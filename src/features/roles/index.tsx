import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { RolesDialogs } from './components/roles-dialogs'
import { RolesPrimaryButtons } from './components/roles-primary-buttons'
import { RoleProvider } from './components/roles-provider'
import { RolesTable } from './components/roles-table'
import { Role } from './data/schema'
import { toast } from 'sonner'

const route = getRouteApi('/_authenticated/roles/')

export function Roles() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      // Aquí iría la llamada al servicio de roles
      // const data = await apiRoleService.getAllRoles()
      // setRoles(data)
      
      // Datos de ejemplo mientras no esté el servicio
      const mockRoles: Role[] = [
        {
          id: 1,
          nombre: 'Administrador',
          empresa_id: 1,
          estado: true,
          permisos: {
            usuario_ver: true,
            usuario_agregar: true,
            usuario_modificar: true,
            usuario_borrar: true,
            proveedor_ver: true,
            proveedor_agregar: true,
            proveedor_modificar: true,
            proveedor_eliminar: true,
            cliente_ver: true,
            cliente_agregar: true,
            cliente_modificar: true,
            cliente_eliminar: true,
            producto_ver: true,
            producto_agregar: true,
            producto_modificar: true,
            producto_eliminar: true,
            compras_ver: true,
            compras_agregar: true,
            compras_modificar: true,
            compras_eliminar: true,
            ventas_ver: true,
            ventas_agregar: true,
            ventas_modificar: true,
            ventas_eliminar: true,
            ventas_acceso_caja: true,
            marca_ver: true,
            marca_agregar: true,
            marca_modificar: true,
            marca_eliminar: true,
            unidad_ver: true,
            unidad_agregar: true,
            unidad_modificar: true,
            unidad_eliminar: true,
            categoria_ver: true,
            categoria_agregar: true,
            categoria_modificar: true,
            categoria_eliminar: true,
            configuracion_empresa: true,
            sucursal_todas: true,
            sucursal_1: false,
            sucursal_2: false,
            lista_precios_predeterminada: true,
            lista_precios_1: false,
            lista_precios_2: false,
          },
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          nombre: 'Vendedor',
          empresa_id: 1,
          estado: true,
          permisos: {
            usuario_ver: false,
            usuario_agregar: false,
            usuario_modificar: false,
            usuario_borrar: false,
            proveedor_ver: true,
            proveedor_agregar: false,
            proveedor_modificar: false,
            proveedor_eliminar: false,
            cliente_ver: true,
            cliente_agregar: true,
            cliente_modificar: true,
            cliente_eliminar: false,
            producto_ver: true,
            producto_agregar: false,
            producto_modificar: false,
            producto_eliminar: false,
            compras_ver: false,
            compras_agregar: false,
            compras_modificar: false,
            compras_eliminar: false,
            ventas_ver: true,
            ventas_agregar: true,
            ventas_modificar: true,
            ventas_eliminar: false,
            ventas_acceso_caja: true,
            marca_ver: true,
            marca_agregar: false,
            marca_modificar: false,
            marca_eliminar: false,
            unidad_ver: true,
            unidad_agregar: false,
            unidad_modificar: false,
            unidad_eliminar: false,
            categoria_ver: true,
            categoria_agregar: false,
            categoria_modificar: false,
            categoria_eliminar: false,
            configuracion_empresa: false,
            sucursal_todas: false,
            sucursal_1: true,
            sucursal_2: false,
            lista_precios_predeterminada: true,
            lista_precios_1: false,
            lista_precios_2: false,
          },
          created_at: '2024-01-16T14:20:00Z',
          updated_at: '2024-01-16T14:20:00Z',
        },
      ]
      setRoles(mockRoles)
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error al cargar los roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando roles...</div>
      </div>
    )
  }

  return (
    <RoleProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Lista de roles</h2>
            <p className='text-muted-foreground'>
              Administre aquí los roles y permisos del sistema.
            </p>
          </div>
          <RolesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <RolesTable data={roles} search={search} navigate={navigate} onSuccess={fetchRoles} />
        </div>
      </Main>

      <RolesDialogs onSuccess={fetchRoles} />
    </RoleProvider>
  )
}