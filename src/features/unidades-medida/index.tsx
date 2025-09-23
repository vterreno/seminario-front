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
import { unidadesMedidaService } from '@/service/unidades-medida.service'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/use-permissions'

const route = getRouteApi('/_authenticated/unidades-medida/')

export function UnidadesMedida() {
  const { hasPermission } = usePermissions()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([])
  const [loading, setLoading] = useState(true)

  // Verificar si el usuario tiene permisos para ver unidades de medida
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

  const fetchUnidadesMedida = async () => {
    try {
      setLoading(true)
      const data = await unidadesMedidaService.getAll()
      setUnidadesMedida(data)
    } catch (error) {
      console.error('Error fetching unidades de medida:', error)
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
          <UnidadMedidaTable data={unidadesMedida} search={search} navigate={navigate} onSuccess={fetchUnidadesMedida} />
        </div>
      </Main>

      <UnidadMedidaDialogs onSuccess={fetchUnidadesMedida} />
    </UnidadMedidaProvider>
  )
}