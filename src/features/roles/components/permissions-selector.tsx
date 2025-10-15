import { useFormContext } from 'react-hook-form'
import { useEffect, useState, useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleForm } from '../data/schema'
import apiPermisosService, { Permission } from '@/service/apiPermisos.service'
import { toast } from 'sonner'

type PermissionsSelectorProps = {
  disabled?: boolean
}

interface PermissionGroup {
  id: string
  name: string
  permissions: Permission[]
}

export function PermissionsSelector({ disabled = false }: PermissionsSelectorProps) {
  const { watch, setValue } = useFormContext<RoleForm>()
  const permisos = watch('permisos') || []
  const empresaId = watch('empresa_id')
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  // Refetch permissions when empresa_id changes
  useEffect(() => {
    fetchPermissions()
  }, [empresaId])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      
      // Si hay empresa_id, obtener solo permisos relevantes para esa empresa
      // Si no hay empresa_id (ej: superadmin sin seleccionar empresa), no cargar permisos
      if (empresaId) {
        const data = await apiPermisosService.getPermisosByEmpresa(empresaId)
        setAllPermissions(data)
        
        // Limpiar permisos seleccionados que ya no están disponibles para esta empresa
        if (permisos.length > 0) {
          const availableCodes = new Set(data.map(p => p.codigo))
          const filteredPermisos = permisos.filter((p: Permission) => 
            availableCodes.has(p.codigo)
          )
          
          // Solo actualizar si hay cambios
          if (filteredPermisos.length !== permisos.length) {
            setValue('permisos', filteredPermisos, { shouldValidate: true })
          }
        }
      } else {
        // Si no hay empresa seleccionada, limpiar todo
        setAllPermissions([])
        if (permisos.length > 0) {
          setValue('permisos', [], { shouldValidate: true })
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('Error al cargar los permisos')
    } finally {
      setLoading(false)
    }
  }

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
  }

  // Agrupar permisos dinámicamente basado en el prefijo del código
  const permissionGroups = useMemo(() => {
    const groups: { [key: string]: PermissionGroup } = {}
    
    allPermissions.forEach(permission => {
      // Extraer el grupo del código (ej: "usuario_ver" -> "usuario")
      const parts = permission.codigo.split('_')
      const groupKey = parts[0]
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          name: capitalizeFirst(groupKey),
          permissions: []
        }
      }
      
      groups[groupKey].permissions.push(permission)
    })
    
    return Object.values(groups)
  }, [allPermissions])

  const isPermissionSelected = (codigo: string): boolean => {
    return permisos.some((p: Permission) => p.codigo === codigo)
  }

  const handleSelectAll = (groupId: string, checked: boolean) => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return

    let updatedPermisos = [...permisos]
    
    if (checked) {
      // Agregar todos los permisos del grupo que no estén ya seleccionados
      group.permissions.forEach(permission => {
        if (!updatedPermisos.some((p: Permission) => p.codigo === permission.codigo)) {
          updatedPermisos.push(permission)
        }
      })
    } else {
      // Remover todos los permisos del grupo
      const groupCodes = group.permissions.map(p => p.codigo)
      updatedPermisos = updatedPermisos.filter((p: Permission) => !groupCodes.includes(p.codigo))
    }
    
    setValue('permisos', updatedPermisos, { shouldValidate: true })
  }

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    let updatedPermisos = [...permisos]
    
    if (checked) {
      // Agregar permiso si no existe
      if (!updatedPermisos.some((p: Permission) => p.codigo === permission.codigo)) {
        updatedPermisos.push(permission)
      }
    } else {
      // Remover permiso
      updatedPermisos = updatedPermisos.filter((p: Permission) => p.codigo !== permission.codigo)
    }
    
    setValue('permisos', updatedPermisos, { shouldValidate: true })
  }

  const isGroupFullySelected = (groupId: string): boolean => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return false
    
    return group.permissions.every(permission => 
      isPermissionSelected(permission.codigo)
    )
  }

  const isGroupPartiallySelected = (groupId: string): boolean => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return false
    
    const selectedCount = group.permissions.filter(permission => 
      isPermissionSelected(permission.codigo)
    ).length
    
    return selectedCount > 0 && selectedCount < group.permissions.length
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Permisos del rol</Label>
          <p className="text-sm text-muted-foreground">
            Cargando permisos...
          </p>
        </div>
      </div>
    )
  }

  if (!empresaId) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Permisos del rol</Label>
          <p className="text-sm text-muted-foreground">
            Por favor, seleccione una empresa para ver los permisos disponibles
          </p>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Permisos del rol</Label>
        <p className="text-sm text-muted-foreground">
          Seleccione los permisos que tendrá este rol
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {permissionGroups.map((group) => {
          const isFullySelected = isGroupFullySelected(group.id)
          const isPartiallySelected = isGroupPartiallySelected(group.id)
          
          return (
            <Card key={group.id} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={isFullySelected}
                    ref={(el) => {
                      if (el) {
                        const input = el.querySelector('button')
                        if (input) (input as any).indeterminate = isPartiallySelected && !isFullySelected
                      }
                    }}
                    onCheckedChange={(checked) => 
                      handleSelectAll(group.id, checked as boolean)
                    }
                    disabled={disabled}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className="font-medium">{group.name}</span>
                </CardTitle>
                <button
                  type="button"
                  onClick={() => handleSelectAll(group.id, !isFullySelected)}
                  disabled={disabled}
                  className="text-xs text-muted-foreground hover:text-foreground text-left"
                >
                  Seleccionar todo
                </button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {group.permissions.map((permission) => (
                    <div key={permission.codigo} className="flex items-center space-x-2">
                      <Checkbox
                        checked={isPermissionSelected(permission.codigo)}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(permission, checked as boolean)
                        }
                        disabled={disabled}
                        id={permission.codigo}
                      />
                      <Label
                        htmlFor={permission.codigo}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {permission.nombre}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
