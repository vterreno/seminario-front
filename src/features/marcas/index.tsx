import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { MarcasDialogs } from './components/marcas-dialogs'
import { MarcasPrimaryButtons } from './components/marcas-primary-buttons'
import { MarcasProvider } from './components/marcas-provider'
import { MarcasTable } from './components/marcas-table'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/use-permissions'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import apiMarcasService from '@/service/apiMarcas.service'
import { type Marca } from './data/schema'

const route = getRouteApi('/_authenticated/productos/marcas/')

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

export function Marcas() {
    const { hasPermission } = usePermissions()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const [marcas, setMarcas] = useState<Marca[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Verificar permisos para bulk actions
    const canEdit = hasPermission('marca_modificar')
    const canDelete = hasPermission('marca_eliminar')
    const canBulkAction = canEdit || canDelete
    if (!hasPermission('marca_ver')) {
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
    // Detectar si el usuario es superadmin
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
    const userEmpresaId = userData?.empresa?.id
    const isSuperAdmin = !userEmpresaId // If user doesn't have empresa_id, they are superadmin

    const fetchMarcas = async () => {
        try {
            setLoading(true)

            let data: Marca[]
            if (isSuperAdmin) {
                // Superadmin: get all marcas from all companies
                data = await apiMarcasService.getAllMarcas()
            } else {
                // Regular admin: get only marcas from their company
                data = await apiMarcasService.getMarcasByEmpresa(userEmpresaId!)
            }

            setMarcas(data)
        } catch (error) {
            console.error('Error fetching marcas:', error)
            toast.error('Error al cargar las marcas')
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        fetchMarcas()
    }, [])

    const handleSuccess = async () => {
        // Refrescar la lista de marcas inmediatamente
        try {
            setRefreshing(true)
            await fetchMarcas()
        } catch (error) {
            console.error('Error refreshing marcas:', error)
            // No mostramos error toast aquí para no duplicar mensajes
        } finally {
            setRefreshing(false)
        }
    }

    return (
            <MarcasProvider>
                {/* ===== Top Heading ===== */}
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
                <h2 className='text-2xl font-bold tracking-tight'>
                Marcas
                {loading && <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>}
                {refreshing && <span className="ml-2 text-sm text-muted-foreground">Actualizando...</span>}
                </h2>
                <p className='text-muted-foreground'>
                Gestiona las marcas de productos de tu empresa.
                </p>
            </div>
            <MarcasPrimaryButtons />
            </div>

            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
                <MarcasTable 
                data={marcas}
                search={search}
                navigate={navigate}
                onSuccess={handleSuccess}
                canBulkAction={canBulkAction}
                showEmpresaColumn={isSuperAdmin}
                />
            </div>

            <MarcasDialogs onSuccess={handleSuccess} />
        </Main>
        </MarcasProvider>
    )
}

