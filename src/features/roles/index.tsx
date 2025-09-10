import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
import apiRolesService from '@/service/apiRoles.service'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'

interface UserData {
  id: number
  nombre: string
  apellido: string
  email: string
  role: {
    id: number
    nombre: string
    permisos?: {
      [key: string]: boolean
    }
  }
  empresa?: {
    id: number
    name: string
  } | null
}

const route = getRouteApi('/_authenticated/roles/')

export function Roles() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      
      // Get user data from localStorage
      const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
      const userEmpresaId = userData?.empresa?.id
      const isSuperAdmin = !userEmpresaId // If user doesn't have empresa_id, they are superadmin

      // If superadmin, fetch all roles from all companies
      // Otherwise, fetch only roles from user's company
      const data = isSuperAdmin 
        ? await apiRolesService.getAllRoles()
        : await apiRolesService.getRolesByEmpresa(userEmpresaId || 0)
      
      setRoles(data)
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
          <RolesTable data={roles} search={search} navigate={navigate as any} onSuccess={fetchRoles} />
        </div>
      </Main>

      <RolesDialogs onSuccess={fetchRoles} />
    </RoleProvider>
  )
}