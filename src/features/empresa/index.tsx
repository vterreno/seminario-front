import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { EmpresaDialogs } from './components/empresa-dialogs'
import { EmpresaPrimaryButtons } from './components/empresa-primary-buttons'
import { EmpresaProvider } from './components/empresa-provider'
import { EmpresaTable } from './components/empresa-table'
import { Empresa } from './data/schema'
import apiEmpresaService from '@/service/apiEmpresa.service'
import { toast } from 'sonner'

const route = getRouteApi('/_authenticated/empresa/')

export function Empresa() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const data = await apiEmpresaService.getAllEmpresas()
      setEmpresas(data)
    } catch (error) {
      console.error('Error fetching empresas:', error)
      toast.error('Error al cargar las empresas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando empresas...</div>
      </div>
    )
  }

  return (
    <EmpresaProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Lista de empresas</h2>
            <p className='text-muted-foreground'>
              Administre aquí las empresas del sistema.
            </p>
          </div>
          <EmpresaPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <EmpresaTable data={empresas} search={search} navigate={navigate} onSuccess={fetchEmpresas} />
        </div>
      </Main>

      <EmpresaDialogs onSuccess={fetchEmpresas} />
    </EmpresaProvider>
  )
}