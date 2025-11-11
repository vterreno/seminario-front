import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UnidadMedidaDialogs } from './components/unidad-medida-dialogs'
import { UnidadMedidaPrimaryButtons } from './components/unidad-medida-primary-buttons'
import { UnidadMedidaProvider } from './components/unidad-medida-provider'
import { UnidadMedidaTable } from './components/unidad-medida-table'
import { UnidadMedida } from './data/schema'
import apiUnidadesMedida from '@/service/apiUnidadesMedida.service'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/use-permissions'

const route = getRouteApi('/_authenticated/unidades-medida/')

export function UnidadesMedida() {
    const { hasPermission } = usePermissions()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const [unidadesMedida, setUnidadesMedida] = useState<Array<UnidadMedida & { estado: boolean }>>([])
    const [loading, setLoading] = useState(true)
    const { isSuperAdmin } = usePermissions()

    const fetchUnidadesMedida = async () => {
        try {
        setLoading(true)
        const data = await apiUnidadesMedida.getAllUnidadesMedida()
        // Ensure each item has the required `estado` boolean for the state type
        setUnidadesMedida(data.map(d => ({ ...d, estado: (d as any).estado ?? true })))
        } catch (error) {
        toast.error('Error al cargar las unidades de medida')
        } finally {
        setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnidadesMedida()
    }, [])

    if (loading) {
        return (
        <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Cargando unidades de medida...</div>
        </div>
        )
    }
    // Verificar permisos para bulk actions
    const canEdit = hasPermission('unidad_medida_modificar')
    const canDelete = hasPermission('unidad_medida_eliminar')
    const canBulkAction = canEdit || canDelete
    if (!hasPermission('unidad_medida_ver')) {
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
    return (
        <UnidadMedidaProvider>
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
                <h2 className='text-2xl font-bold tracking-tight'>Unidades de medida</h2>
                <p className='text-muted-foreground'>
                Administre aquí las unidades de medida de su empresa.
                </p>
            </div>
            <UnidadMedidaPrimaryButtons />
            </div>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
            <UnidadMedidaTable 
                data={unidadesMedida} 
                search={search} 
                navigate={navigate} 
                onSuccess={fetchUnidadesMedida}
                canBulkAction={canBulkAction}
                isSuperAdmin={isSuperAdmin}
            />
            </div>
        </Main>

        <UnidadMedidaDialogs onSuccess={fetchUnidadesMedida} />
        </UnidadMedidaProvider>
    )
}