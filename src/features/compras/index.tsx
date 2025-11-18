import { Header } from "@/components/layout/header"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { getRouteApi } from "@tanstack/react-router"
import { Main } from '@/components/layout/main'
import { ComprasTable } from "./components/compras-table"
import { usePermissions } from "@/hooks/use-permissions"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import apiComprasService from "@/service/apiCompras.service"
import type { Compra } from "./data/schema"
import { ComprasProvider } from "./components/compras-provider"
import { ComprasDialogs } from "./components/compras-dialogs"
import { AdvancedSearchSidebar, type AdvancedSearchFilters } from "./components/advanced-search-sidebar"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import apiEmpresaService, { type Empresa } from "@/service/apiEmpresa.service"
import apiSucursalesService from "@/service/apiSucursales.service"
import type { Sucursal } from "../sucursales/data/schema"
import { getStorageItem } from "@/hooks/use-local-storage"
import { STORAGE_KEYS } from "@/lib/constants"

const route = getRouteApi('/_authenticated/compras/compras/')

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

export function Compras() {
    return (
        <ComprasProvider>
            <ComprasContent />
        </ComprasProvider>
    )
}

function ComprasContent() {
    const { hasPermission } = usePermissions()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const [compras, setCompras] = useState<Compra[]>([])
    const [loading, setLoading] = useState(true)
    const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState<AdvancedSearchFilters>({})
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [sucursales, setSucursales] = useState<Sucursal[]>([])

    const canBulkAction = hasPermission('compras_modificar')

    if (!hasPermission('compras_ver')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                        Sin permisos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        No tienes permisos para ver las compras.
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
    

    const fetchCompras = async (filters?: AdvancedSearchFilters) => {
        try {
            setLoading(true)
            let data: Compra[]

            if(isSuperAdmin) {
                data = await apiComprasService.getAllCompras() as Compra[]
            } else {
                data = await apiComprasService.getComprasByEmpresa(userEmpresaId!) as Compra[]
                setSucursales(userData?.sucursales as Sucursal[])
            }

            let filteredData = data
            
            if (filters && Object.keys(filters).length > 0) {
                filteredData = data.filter((compra) => {
                    // Filtro por sucursal
                    if (filters.sucursal_id) {
                        const compraSucursalId = compra.sucursal?.id
                        if (compraSucursalId !== filters.sucursal_id) {
                            return false
                        }
                    }
                    
                    // Filtro por rango de fechas
                    if (filters.fecha_desde && compra.fecha_compra < filters.fecha_desde) {
                        return false
                    }
                    if (filters.fecha_hasta && compra.fecha_compra > filters.fecha_hasta) {
                        return false
                    }
                    
                    // Filtro por rango de monto
                    if (filters.monto_min !== undefined && compra.monto_total < filters.monto_min) {
                        return false
                    }
                    if (filters.monto_max !== undefined && compra.monto_total > filters.monto_max) {
                        return false
                    }
                    
                    // Filtro por estado
                    if (filters.estado && compra.estado.toLowerCase() !== filters.estado.toLowerCase()) {
                        return false
                    }
                    
                    return true
                })
            }
            
            setCompras(filteredData)
        } catch (error: any) {
            console.error('Error fetching compras:', error)
            toast.error(error.message || 'Error al cargar las compras')
        } finally {
            setLoading(false)
        }
    }

    const handleFiltersChange = (filters: AdvancedSearchFilters) => {
        setActiveFilters(filters)
        fetchCompras(filters)
    }

    const handleClearFilters = () => {
        setActiveFilters({})
        fetchCompras()
    }

    const handleRefresh = () => {
        // Usar los filtros activos actuales al refrescar
        fetchCompras(activeFilters)
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
        fetchCompras()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Cargando compras...</div>
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
                        <h2 className='text-2xl font-bold tracking-tight'>Compras</h2>
                        <p className='text-muted-foreground'>
                            Gestión de compras del sistema
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
                    <ComprasTable
                        data={compras}
                        search={search}
                        navigate={navigate as any}
                        onSuccess={handleRefresh}
                        canBulkAction={canBulkAction}
                        isSuperUser={isSuperAdmin}
                    />
                </div>

                <ComprasDialogs onSuccess={handleRefresh} />
                
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


