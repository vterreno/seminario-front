import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuthStore } from '@/stores/auth-store'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { hasToken } from '@/lib/auth-utils'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import { type ListaPrecios } from './data/schema'
import { ListaPreciosProvider } from './components/lista-precios-provider'
import { ListaPreciosTable } from './components/lista-precios-table'
import { ListaPreciosDialogs } from './components/lista-precios-dialogs'
import { ListaPreciosPrimaryButtons } from './components/lista-precios-primary-buttons'

const route = getRouteApi('/_authenticated/ventas/lista-precios/')

// Función helper para generar el código de permiso desde el nombre de la lista
// Debe coincidir con la lógica del backend: generarCodigoPermiso()
const generarCodigoPermisoLista = (nombreLista: string): string => {
    return 'lista_' + nombreLista
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_') + '_ver'
}

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
    sucursales?: Array<{
        id: number
        nombre: string
    }>
}

export function ListasPreciosPage() {
    const { hasPermission } = usePermissions()
    const { auth } = useAuthStore()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const [listaPrecios, setListaPrecios] = useState<ListaPrecios[]>([])
    const [loading, setLoading] = useState(true)

    // Verificar permisos
    const canEdit = hasPermission('modulo_listas_modificar')
    const canDelete = hasPermission('modulo_listas_eliminar')
    const canBulkAction = canEdit || canDelete

    if (!hasPermission('modulo_listas_ver')) {
        return (
            <>
                <Header>
                    <div className='flex items-center space-x-4'>
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
    
    // Memorizar permisos del localStorage para evitar recreaciones
    const localStoragePermisos = useMemo(() => userData?.role?.permisos, [userData?.role?.permisos])

    const fetchListaPrecios = useCallback(async () => {
        // No intentar cargar si no hay token (usuario no autenticado)
        if (!hasToken()) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            let data: ListaPrecios[]
            if (isSuperAdmin) {
                data = await apiListaPreciosService.getAllListaPrecios()
            } else {
                data = await apiListaPreciosService.getListaPreciosByEmpresa(userEmpresaId!)
            }

            // Filtrar listas según permisos específicos (solo si NO es superadmin)
            if (!isSuperAdmin) {
                // Obtener permisos frescos del store en el momento de ejecutar
                const currentAuth = useAuthStore.getState().auth
                
                data = data.filter(lista => {
                    const codigoPermiso = generarCodigoPermisoLista(lista.nombre)

                    // Verificar permiso usando los datos más actuales del store
                    if (currentAuth.user?.roles) {
                        return currentAuth.user.roles.some(role =>
                            role.permissions?.some(permission => permission.codigo === codigoPermiso)
                        )
                    }

                    // Fallback a localStorage
                    if (localStoragePermisos) {
                        return !!localStoragePermisos[codigoPermiso]
                    }

                    return false
                })
            }

            setListaPrecios(data)
        } catch (error: any) {
            if (error.response?.status !== 401) {
                console.error('Error fetching listas de precios:', error)
                toast.error('Error al cargar las listas de precios')
            }
        } finally {
            setLoading(false)
        }
    }, [isSuperAdmin, userEmpresaId, localStoragePermisos])

    useEffect(() => {
        fetchListaPrecios()
    }, [fetchListaPrecios])

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
                <div className='flex items-center space-x-4'>
                    <Search />
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>
            <Main>
                <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold tracking-tight'>Listas de precios</h1>
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
