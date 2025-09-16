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

export function Contactos() {
  const { hasPermission } = usePermissions()
  const [tab, setTab] = useState<'clientes' | 'proveedores'>('clientes')
  const [clientes, setClientes] = useState<Contacto[]>([])
  const [proveedores, setProveedores] = useState<Contacto[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogValue, setDialogValue] = useState<Partial<Contacto>>({})

  const canVerClientes = hasPermission('cliente_ver')
  const canVerProveedores = hasPermission('proveedor_ver')

  useEffect(() => {
    const load = async () => {
      try {
        if (canVerClientes) {
          const data = await apiContactosService.getClientesAll()
          setClientes(data)
        }
        if (canVerProveedores) {
          const data = await apiContactosService.getProveedoresAll()
          setProveedores(data)
        }
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
        <div className='ms-auto flex items-center space-x-4'>
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
            {(canVerClientes || canVerProveedores) && (
              <Button onClick={() => { setDialogValue({}); setOpenDialog(true) }}>Nuevo contacto</Button>
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
                onEdit={(c) => { setDialogValue({...c, tipo_contacto: 'cliente'}); setOpenDialog(true) }}
                onDelete={async (c) => {
                  try {
                    await apiContactosService.deleteCliente(c.id!)
                    toast.success('Cliente eliminado')
                    const data = await apiContactosService.getClientesAll()
                    setClientes(data)
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'No se pudo eliminar')
                  }
                }}
                canBulkAction
                tipo='cliente'
                onSuccess={async () => { const data = await apiContactosService.getClientesAll(); setClientes(data) }}
              />
            </TabsContent>
          )}
          {canVerProveedores && (
            <TabsContent value="proveedores">
              <ContactosTable 
                data={proveedores}
                onEdit={(c) => { setDialogValue({...c, tipo_contacto: 'proveedor'}); setOpenDialog(true) }}
                onDelete={async (c) => {
                  try {
                    await apiContactosService.deleteProveedor(c.id!)
                    toast.success('Proveedor eliminado')
                    const data = await apiContactosService.getProveedoresAll()
                    setProveedores(data)
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'No se pudo eliminar')
                  }
                }}
                canBulkAction
                tipo='proveedor'
                onSuccess={async () => { const data = await apiContactosService.getProveedoresAll(); setProveedores(data) }}
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
              const tipoContacto = (val as any).tipo_contacto || 'cliente'
              if (tipoContacto === 'cliente') {
                if (val.id) await apiContactosService.updateCliente(val.id, val as any)
                else await apiContactosService.createCliente({ ...val, rol: 'cliente' } as any)
                const data = await apiContactosService.getClientesAll()
                setClientes(data)
              } else {
                if (val.id) await apiContactosService.updateProveedor(val.id, val as any)
                else await apiContactosService.createProveedor({ ...val, rol: 'proveedor' } as any)
                const data = await apiContactosService.getProveedoresAll()
                setProveedores(data)
              }
              setOpenDialog(false)
              toast.success('Guardado correctamente')
            } catch (e: any) {
              toast.error(e?.response?.data?.message || 'Error al guardar')
            }
          }}
        />
      </Main>
    </>
  )
}


