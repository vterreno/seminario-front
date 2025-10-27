import { Header } from "@/components/layout/header"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { getRouteApi } from "@tanstack/react-router"
import { Main } from '@/components/layout/main'
import { VentasTable } from "./components/ventas-table"
import { usePermissions } from "@/hooks/use-permissions"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import apiVentasService from "@/service/apiVentas.service"
import type { Venta } from "./data/schema"
import { VentasProvider } from "./components/ventas-provider"
import { VentasDialogs } from "./components/ventas-dialogs"
import { AdvancedSearchSidebar, type AdvancedSearchFilters } from "./components/advanced-search-sidebar"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import apiEmpresaService, { type Empresa } from "@/service/apiEmpresa.service"
import apiSucursalesService from "@/service/apiSucursales.service"
import type { Sucursal } from "../sucursales/data/schema"
import { getStorageItem } from "@/hooks/use-local-storage"
import { STORAGE_KEYS } from "@/lib/constants"
const route = getRouteApi('/_authenticated/ventas/ventas/')

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

export function Ventas() {
    return (
        <VentasProvider>
            <VentasContent />
        </VentasProvider>
    )
}

function VentasContent() {
    const { hasPermission } = usePermissions()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const [ventas, setVentas] = useState<Venta[]>([])
    const [loading, setLoading] = useState(true)
    const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState<AdvancedSearchFilters>({})
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [sucursales, setSucursales] = useState<Sucursal[]>([])

    const canBulkAction = hasPermission('ventas_modificar')

    if (!hasPermission('ventas_ver')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                        Sin permisos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        No tienes permisos para ver las ventas.
                    </p>
                </div>
            </div>
        )
    }

    // Detectar si el usuario es superadmin y obtener sus sucursales
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
    const userEmpresaId = userData?.empresa?.id
    const isSuperAdmin = !userEmpresaId // If user doesn't have empresa_id, they are superadmin
    const userSucursales = userData?.sucursales || []
    

    const fetchVentas = async (filters?: AdvancedSearchFilters) => {
        try {
            setLoading(true)
            let data: Venta[] = []

            if(isSuperAdmin) {
                data = await apiVentasService.getAllVentas()
            } else {
                data = await apiVentasService.getVentasByEmpresa(userEmpresaId!)
                setSucursales(userData?.sucursales as Sucursal[])
            }

            let filteredData = data
            
            if (filters && Object.keys(filters).length > 0) {
                console.log('Filtros aplicados:', filters)
                console.log('Total ventas antes de filtrar:', data.length)
                
                filteredData = data.filter((venta) => {
                    // Filtro por empresa
                    // La empresa puede estar en venta.empresa_id o en venta.sucursal.empresa_id
                    if (filters.empresa_id) {
                        const ventaEmpresaId = venta.empresa_id || venta.sucursal?.empresa_id
                        console.log('Venta:', venta.numero_venta, 'empresa_id:', ventaEmpresaId, 'buscando:', filters.empresa_id)
                        if (ventaEmpresaId !== filters.empresa_id) {
                            return false
                        }
                    }
                    
                    // Filtro por sucursal
                    if (filters.sucursal_id) {
                        const ventaSucursalId = venta.sucursal_id || venta.sucursal?.id
                        console.log('Venta:', venta.numero_venta, 'sucursal_id:', ventaSucursalId, 'buscando:', filters.sucursal_id)
                        if (ventaSucursalId !== filters.sucursal_id) {
                            return false
                        }
                    }
                    
                    // Filtro por rango de fechas
                    if (filters.fecha_desde && venta.fecha_venta < filters.fecha_desde) {
                        return false
                    }
                    if (filters.fecha_hasta && venta.fecha_venta > filters.fecha_hasta) {
                        return false
                    }
                    
                    // Filtro por rango de monto
                    if (filters.monto_min !== undefined && venta.monto_total < filters.monto_min) {
                        return false
                    }
                    if (filters.monto_max !== undefined && venta.monto_total > filters.monto_max) {
                        return false
                    }
                    
                    // Filtro por método de pago
                    if (filters.metodo_pago && venta.pago?.metodo_pago !== filters.metodo_pago) {
                        return false
                    }
                    
                    return true
                })
                
                console.log('Total ventas después de filtrar:', filteredData.length)
            }
            
            setVentas(filteredData)
        } catch (error: any) {
            console.error('Error fetching ventas:', error)
            toast.error(error.message || 'Error al cargar las ventas')
        } finally {
            setLoading(false)
        }
    }

    const handleFiltersChange = (filters: AdvancedSearchFilters) => {
        setActiveFilters(filters)
        fetchVentas(filters)
    }

    const handleClearFilters = () => {
        setActiveFilters({})
        fetchVentas()
    }

    const getActiveFiltersCount = () => {
        return Object.keys(activeFilters).length
    }

    // Cargar empresas y sucursales si es superadmin
    useEffect(() => {
        const fetchEmpresasYSucursales = async () => {
            if (isSuperAdmin) {
                try {
                    const [empresasData, sucursalesData] = await Promise.all([
                        apiEmpresaService.getAllEmpresas(),
                        apiSucursalesService.getAllSucursales()
                    ])
                    setEmpresas(empresasData)
                    setSucursales(sucursalesData)
                } catch (error: any) {
                    console.error('Error loading empresas/sucursales:', error)
                    toast.error('Error al cargar empresas y sucursales')
                }
            }
        }
        
        fetchEmpresasYSucursales()
    }, [isSuperAdmin])

    useEffect(() => {
        fetchVentas()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Cargando ventas...</div>
            </div>
        )
    }

    return (
        <>
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
                        <h2 className='text-2xl font-bold tracking-tight'>Ventas</h2>
                        <p className='text-muted-foreground'>
                            Gestión de ventas del sistema
                        </p>
                    </div>
                    <div className='flex items-center gap-2'>
                        {/* Botón de búsqueda avanzada */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdvancedSearchOpen(true)}
                            className="relative"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Búsqueda avanzada
                            {getActiveFiltersCount() > 0 && (
                                <Badge 
                                    variant="secondary" 
                                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                                >
                                    {getActiveFiltersCount()}
                                </Badge>
                            )}
                        </Button>
                        
                        {/* Botón para limpiar filtros */}
                        {getActiveFiltersCount() > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Limpiar filtros
                            </Button>
                        )}
                    </div>
                </div>

                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <VentasTable
                        data={ventas}
                        search={search}
                        navigate={navigate as any}
                        onSuccess={fetchVentas}
                        canBulkAction={canBulkAction}
                        isSuperUser={isSuperAdmin}
                    />
                </div>

                <VentasDialogs onSuccess={fetchVentas} />
                
                {/* Sidebar de búsqueda avanzada */}
                <AdvancedSearchSidebar
                    open={advancedSearchOpen}
                    onOpenChange={setAdvancedSearchOpen}
                    onFiltersChange={handleFiltersChange}
                    showEmpresaFilter={isSuperAdmin}
                    showSucursalFilter={isSuperAdmin || userSucursales.length > 1}
                    currentFilters={activeFilters}
                    empresas={empresas}
                    sucursales={sucursales}
                />
            </Main>
        </>
    )
}


