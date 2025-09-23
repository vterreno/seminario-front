# Guía de Implementación de Permisos en ABMCs

Esta guía te ayudará a implementar control de permisos completo en todos los módulos ABMC del sistema.

## Patrón de Permisos por Módulo

Cada módulo debe tener estos 4 tipos de permisos:
- `{modulo}_ver` → Ver listado/tabla
- `{modulo}_agregar` → Botón "Agregar"
- `{modulo}_modificar` → Botón "Editar" y bulk actions de modificación
- `{modulo}_eliminar` → Botón "Eliminar" y bulk actions de eliminación

### Ejemplos de módulos:
- **Usuarios**: `usuario_ver`, `usuario_agregar`, `usuario_modificar`, `usuario_borrar`
- **Roles**: `roles_ver`, `roles_agregar`, `roles_modificar`, `roles_eliminar`
- **Productos**: `producto_ver`, `producto_agregar`, `producto_modificar`, `producto_eliminar`
- **Clientes**: `cliente_ver`, `cliente_agregar`, `cliente_modificar`, `cliente_eliminar`

## Implementación Paso a Paso

### 1. Componente Principal del Módulo

**Archivo**: `src/features/{modulo}/index.tsx`

```typescript
import { usePermissions } from '@/hooks/use-permissions'
// ... otras importaciones

export function {Modulo}() {
  const { hasPermission } = usePermissions()
  // ... otras variables

  // Verificar si el usuario tiene permisos para ver el módulo
  if (!hasPermission('{modulo}_ver')) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Sin permisos</h2>
            <p className="text-muted-foreground">No tienes permisos para ver esta sección.</p>
          </div>
        </Main>
      </>
    )
  }

  // ... resto del componente
}
```

### 2. Botón "Agregar"

**Archivo**: `src/features/{modulo}/components/{modulo}-primary-buttons.tsx`

```typescript
import { usePermissions } from '@/hooks/use-permissions'
// ... otras importaciones

export function {Modulo}PrimaryButtons() {
  const { setOpen } = use{Modulo}()
  const { hasPermission } = usePermissions()

  // Si no tiene permisos para agregar, no mostrar el botón
  if (!hasPermission('{modulo}_agregar')) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Agregar {entidad}</span> <PlusIcon size={18} />
      </Button>
    </div>
  )
}
```

### 3. Acciones de Fila (Editar/Eliminar)

**Archivo**: `src/features/{modulo}/components/data-table-row-actions.tsx`

```typescript
import { usePermissions } from '@/hooks/use-permissions'
// ... otras importaciones

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = use{Modulo}()
  const { hasPermission } = usePermissions()

  // Verificar permisos
  const canEdit = hasPermission('{modulo}_modificar')
  const canDelete = hasPermission('{modulo}_eliminar')

  // Si no tiene ningún permiso, no mostrar el menú
  if (!canEdit && !canDelete) {
    return null
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='data-[state=open]:bg-muted flex h-8 w-8 p-0'>
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          {canEdit && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('edit')
              }}
            >
              Editar
              <DropdownMenuShortcut>
                <EditIcon size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {canEdit && canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('delete')
              }}
              className='text-red-500!'
            >
              Eliminar
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
```

### 4. Bulk Actions (Acciones Masivas)

**Archivo**: `src/features/{modulo}/components/data-table-bulk-actions.tsx`

```typescript
import { usePermissions } from '@/hooks/use-permissions'
// ... otras importaciones

export function DataTableBulkActions<TData>({
  table,
  onSuccess,
}: DataTableBulkActionsProps<TData>) {
  const { hasPermission } = usePermissions()
  // ... otras variables

  // Verificar permisos
  const canEdit = hasPermission('{modulo}_modificar')
  const canDelete = hasPermission('{modulo}_eliminar')

  // Si no tiene permisos, no mostrar bulk actions
  if (!canEdit && !canDelete) {
    return null
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='{entidad}' entityNamePlural='{entidades}'>
        {canEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkEdit()}
                className='size-8'
              >
                <EditIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar seleccionados</p>
            </TooltipContent>
          </Tooltip>
        )}

        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar seleccionados</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      {canDelete && (
        <{Modulo}MultiDeleteDialog
          table={table}
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onSuccess={onSuccess}
        />
      )}
    </>
  )
}
```

## Lista de Módulos por Implementar

### ✅ Completados
- [x] **Usuarios** - Implementado completamente
- [x] **Roles** - Implementado parcialmente (falta botones y bulk actions)

### 🔄 Por Implementar
- [ ] **Productos** (`producto_*`)
- [ ] **Clientes/Contactos** (`cliente_*`)
- [ ] **Ventas** (`ventas_*`)
- [ ] **Compras** (`compras_*`)
- [ ] **Sucursales** (`sucursal_*`)
- [ ] **Empresas** (`empresa_*`) - Solo para superadmin

## Pasos para Implementar en Cada Módulo

1. **Identificar el módulo** y sus permisos correspondientes
2. **Modificar el componente principal** para verificar `{modulo}_ver`
3. **Actualizar primary-buttons** para verificar `{modulo}_agregar`
4. **Modificar row-actions** para verificar `{modulo}_modificar` y `{modulo}_eliminar`
5. **Actualizar bulk-actions** para verificar los permisos correspondientes
6. **Probar** con diferentes roles/permisos

## Ejemplo de Implementación Rápida

### Para Productos:
```bash
# 1. Modificar src/features/productos/index.tsx
# 2. Modificar src/features/productos/components/productos-primary-buttons.tsx
# 3. Modificar src/features/productos/components/data-table-row-actions.tsx
# 4. Modificar src/features/productos/components/data-table-bulk-actions.tsx
```

**Permisos necesarios**:
- `producto_ver`
- `producto_agregar`
- `producto_modificar`
- `producto_eliminar`

## Notas Importantes

1. **Superadmin**: Los usuarios sin empresa (`empresa.id === null`) tienen acceso a TODO automáticamente
2. **Consistencia**: Mantener el mismo patrón en todos los módulos
3. **UX**: Siempre mostrar un mensaje claro cuando no se tienen permisos
4. **Seguridad**: Las validaciones del frontend deben estar respaldadas por el backend

## Testing

Para probar los permisos:
1. Crear roles con diferentes combinaciones de permisos
2. Asignar usuarios a esos roles
3. Verificar que solo aparezcan las opciones permitidas
4. Confirmar que las acciones no autorizadas no sean accesibles

---

**Estado actual**: Usuarios implementado ✅, Roles parcial ⚠️, resto pendiente ❌
