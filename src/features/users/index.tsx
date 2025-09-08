import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { User } from './data/schema'
import { toast } from 'sonner'
import apiUsersService from '@/service/apiUser.service'
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

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Get user data from localStorage
      const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
      const userEmpresaId = userData?.empresa?.id
      const isSuperAdmin = !userEmpresaId // If user doesn't have empresa_id, they are superadmin

      // If superadmin, fetch all users from all companies
      // Otherwise, fetch only users from user's company
      const data = await apiUsersService.getAllUsers()

      // Filter users by empresa if not superadmin
      const filteredUsers = isSuperAdmin
        ? data
        : data.filter(user => user.empresa?.id === userEmpresaId)

      setUsers(filteredUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <UsersProvider onSuccess={fetchUsers}>
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
            <h2 className='text-2xl font-bold tracking-tight'>Lista de usuarios</h2>
            <p className='text-muted-foreground'>
              Administre aquí sus usuarios y sus roles.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={users} search={search} navigate={navigate as any} onSuccess={fetchUsers} />
        </div>
      </Main>

      <UsersDialogs onSuccess={fetchUsers} />
    </UsersProvider>
  )
}
