import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/use-permissions'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import { type ListaPrecios } from './data/schema'
import { ListaPreciosProvider } from './components/lista-precios-provider'
import { ListaPreciosTable } from './components/lista-precios-table'
import { ListaPreciosDialogs } from './components/lista-precios-dialogs'
import { ListaPreciosPrimaryButtons } from './components/lista-precios-primary-buttons'

const route = getRouteApi('/_authenticated/ventas/lista-precios/')

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

export function ListasPreciosPage() {
    const { hasPermission } = usePermissions()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const [listaPrecios, setListaPrecios] = useState<ListaPrecios[]>([])
    const [loading, setLoading] = useState(true)

    // Verificar permisos
    const canEdit = hasPermission('lista_precios_modificar')
    const canDelete = hasPermission('lista_precios_eliminar')
    const canBulkAction = canEdit || canDelete

    if (!hasPermission('lista_precios_ver')) {
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

    const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
    const userEmpresaId = userData?.empresa?.id
    const isSuperAdmin = !userEmpresaId

    const fetchListaPrecios = async () => {
        try {
            setLoading(true)
            let data: ListaPrecios[]
            if (isSuperAdmin) {
                data = await apiListaPreciosService.getAllListaPrecios()
            } else {
                data = await apiListaPreciosService.getListaPreciosByEmpresa(userEmpresaId!)
            }
            setListaPrecios(data)
        } catch (error) {
            console.error('Error fetching listas de precios:', error)
            toast.error('Error al cargar las listas de precios')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchListaPrecios()
    }, [])

    const handleSuccess = () => {
        fetchListaPrecios()
    }

    return (
        <ListaPreciosProvider
            listaPrecios={listaPrecios}
            setListaPrecios={setListaPrecios}
            isSuperAdmin={isSuperAdmin}
            userEmpresaId={userEmpresaId}
        >
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>
            <Main>
                <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold tracking-tight'>Listas de Precios</h1>
                        <p className='text-muted-foreground mt-1'>
                            Gestiona las listas de precios y sus productos asociados
                        </p>
                    </div>
                    <ListaPreciosPrimaryButtons onSuccess={handleSuccess} />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4" />
                            <p className="text-muted-foreground">Cargando listas de precios...</p>
                        </div>
                    </div>
                ) : (
                    <ListaPreciosTable
                        data={listaPrecios}
                        search={search}
                        navigate={navigate}
                        onSuccess={handleSuccess}
                        canBulkAction={canBulkAction}
                        showEmpresaColumn={isSuperAdmin}
                    />
                )}

                <ListaPreciosDialogs onSuccess={handleSuccess} />
            </Main>
        </ListaPreciosProvider>
    )
}
