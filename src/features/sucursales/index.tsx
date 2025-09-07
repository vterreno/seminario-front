import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Main } from '@/components/layout/main'
import { SucursalesDialogs } from './components/sucursales-dialogs'
import { SucursalesPrimaryButtons } from './components/sucursales-primary-buttons'
import { SucursalProvider } from './components/sucursales-provider'
import { SucursalesTable } from './components/sucursales-table'
import { Sucursal } from './data/schema'
import { toast } from 'sonner'
import apiSucursalesService from '@/service/apiSucursales.service'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'

interface UserData {
  name: string
  email: string
  empresa: {
    id: number | null
    nombre: string | null
  }
  roles: Array<{
    id: number
    nombre: string
    permissions: Array<{
      id: number
      nombre: string
      codigo: string
    }>
  }>
}

const route = getRouteApi('/_authenticated/settings/sucursales')

export function Sucursales() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSucursales = async () => {
    try {
      setLoading(true)
      
      // Obtener datos del usuario desde localStorage
      const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
      const userEmpresaId = userData?.empresa?.id
      
      let data: Sucursal[]
      
      // Si el usuario tiene empresa asignada, filtrar por esa empresa
      if (userEmpresaId) {
        data = await apiSucursalesService.getSucursalesByEmpresa(userEmpresaId)
      } else {
        // Si no tiene empresa (superadmin), mostrar todas las sucursales
        data = await apiSucursalesService.getAllSucursales()
      }
      
      setSucursales(data)
    } catch (error) {
      console.error('Error fetching sucursales:', error)
      toast.error('Error al cargar las sucursales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSucursales()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando sucursales...</div>
      </div>
    )
  }

  return (
    <SucursalProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Lista de sucursales</h2>
            <p className='text-muted-foreground'>
              Administre aquí las sucursales del sistema.
            </p>
          </div>
          <SucursalesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SucursalesTable data={sucursales} search={search} navigate={navigate} onSuccess={fetchSucursales} />
        </div>
      </Main>

      <SucursalesDialogs onSuccess={fetchSucursales} />
    </SucursalProvider>
  )
}
