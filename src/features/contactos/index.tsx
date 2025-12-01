import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermissions } from '@/hooks/use-permissions'
import { useEffect, useState } from 'react'
import apiContactosService, { Contacto } from '@/service/apiContactos.service'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ContactosTable } from './components/contactos-table'
import { ContactoDialog } from './components/contacto-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useNavigate } from '@tanstack/react-router'

export function Contactos() {
  const { hasPermission, isSuperAdmin } = usePermissions()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'clientes' | 'proveedores'>('clientes')
  const [clientes, setClientes] = useState<Contacto[]>([])
  const [proveedores, setProveedores] = useState<Contacto[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogValue, setDialogValue] = useState<Partial<Contacto>>({})

  // Estados para el modal de confirmación de eliminación
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [contactoToDelete, setContactoToDelete] = useState<Contacto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const canVerClientes = hasPermission('cliente_ver')
  const canVerProveedores = hasPermission('proveedor_ver')
  const canAgregarClientes = hasPermission('cliente_agregar')
  const canAgregarProveedores = hasPermission('proveedor_agregar')
  const canModificarClientes = hasPermission('cliente_modificar')
  const canModificarProveedores = hasPermission('proveedor_modificar')
  const canEliminarClientes = hasPermission('cliente_eliminar')
  const canEliminarProveedores = hasPermission('proveedor_eliminar')

  // Función para navegar a la vista de productos del proveedor
  const handleViewProducts = (contacto: Contacto) => {
    navigate({
      to: '/productos-proveedor/$proveedorId',
      params: { proveedorId: contacto.id!.toString() }
    })
  }

  // Función para refrescar ambas tablas
  const refreshTables = async () => {
    try {
      const promises = [];

      if (canVerClientes) {
        promises.push(
          apiContactosService.getClientesAll().then(data => setClientes(data))
        );
      }

      if (canVerProveedores) {
        promises.push(
          apiContactosService.getProveedoresAll().then(data => setProveedores(data))
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error al refrescar tablas:', error);
      toast.error('Error al refrescar los datos');
    }
  }

  // Función para iniciar el proceso de eliminación
  const handleDelete = (contacto: Contacto) => {
    setContactoToDelete(contacto)
    setConfirmDeleteOpen(true)
  }

  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    if (!contactoToDelete) return

    setIsDeleting(true)
    try {
      // Determinar si es cliente o proveedor basado en la pestaña activa
      if (tab === 'clientes') {
        await apiContactosService.deleteCliente(contactoToDelete.id!)
        toast.success('Cliente eliminado')
      } else {
        await apiContactosService.deleteProveedor(contactoToDelete.id!)
        toast.success('Proveedor eliminado')
      }

      // Refrescar ambas tablas
      await refreshTables()

      setConfirmDeleteOpen(false)
      setContactoToDelete(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'No se pudo eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        await refreshTables()
      } catch (e) {
        toast.error('Error al cargar contactos')
      }
    }
    load()
  }, [canVerClientes, canVerProveedores])

  if (!canVerClientes && !canVerProveedores) {
    return (
      <Main>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Sin permisos</h2>
          <p className="text-muted-foreground">No tienes permisos para ver esta sección.</p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Contactos</h2>
            <p className='text-muted-foreground'>Gestione clientes y proveedores.</p>
          </div>
          <div className='flex gap-2'>
            {((tab === 'clientes' && canAgregarClientes) || (tab === 'proveedores' && canAgregarProveedores)) && (
              <Button onClick={() => { setDialogValue({ rol: tab === 'proveedores' ? 'proveedor' : 'cliente' }); setOpenDialog(true) }}>Nuevo contacto</Button>
            )}
          </div>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            {canVerClientes && <TabsTrigger value="clientes">Clientes</TabsTrigger>}
            {canVerProveedores && <TabsTrigger value="proveedores">Proveedores</TabsTrigger>}
          </TabsList>
          {canVerClientes && (
            <TabsContent value="clientes">
              <ContactosTable
                data={clientes}
                onEdit={(c) => { setDialogValue({ ...c }); setOpenDialog(true) }}
                onDelete={handleDelete}
                canBulkAction={canModificarClientes || canEliminarClientes}
                tipo='cliente'
                onSuccess={refreshTables}
                isSuperAdmin={isSuperAdmin}
                canEdit={canModificarClientes}
                canDelete={canEliminarClientes}
              />
            </TabsContent>
          )}
          {canVerProveedores && (
            <TabsContent value="proveedores">
              <ContactosTable
                data={proveedores}
                onEdit={(c) => { setDialogValue({ ...c }); setOpenDialog(true) }}
                onDelete={handleDelete}
                onViewProducts={handleViewProducts}
                canBulkAction={canModificarProveedores || canEliminarProveedores}
                tipo='proveedor'
                onSuccess={refreshTables}
                isSuperAdmin={isSuperAdmin}
                canEdit={canModificarProveedores}
                canDelete={canEliminarProveedores}
              />
            </TabsContent>
          )}
        </Tabs>
        <ContactoDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          value={dialogValue}
          canVerClientes={canVerClientes}
          canVerProveedores={canVerProveedores}
          onSubmit={async (val) => {
            try {
              const rol = val.rol || 'cliente'
              const isUpdate = !!val.id

              if (rol === 'cliente') {
                if (isUpdate) await apiContactosService.updateCliente(val.id!, val as any)
                else await apiContactosService.createCliente({ ...val, rol: 'cliente' } as any)
              } else {
                if (isUpdate) await apiContactosService.updateProveedor(val.id!, val as any)
                else await apiContactosService.createProveedor({ ...val, rol: 'proveedor' } as any)
              }

              // Refrescar ambas tablas después de cualquier operación
              await refreshTables()

              setOpenDialog(false)
              setDialogValue({}) // Limpiar el formulario
              toast.success(isUpdate ? 'Contacto actualizado correctamente' : 'Contacto creado correctamente')
            } catch (e: any) {
              console.error('Error al guardar contacto:', e)
              toast.error(e?.response?.data?.message || 'Error al guardar')
            }
          }}
        />

        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Confirmar eliminación"
          desc={`¿Está seguro que desea eliminar el contacto "${contactoToDelete?.nombre_razon_social}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          destructive
          isLoading={isDeleting}
          handleConfirm={confirmDelete}
        />
      </Main>
    </>
  )
}


