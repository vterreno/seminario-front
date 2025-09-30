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
import apiProductosService from '@/service/apiProductos.service'
import apiEmpresaService from '@/service/apiEmpresa.service'
import { type Producto } from './data/schema'
import { ProductosProvider } from './components/productos-provider'
import { ProductosTable } from './components/productos-table'
import { ProductosDialogs } from './components/productos-dialogs'
import { ProductosPrimaryButtons } from './components/productos-primary-buttons'
import { AdvancedSearchSidebar, type AdvancedSearchFilters } from './components/advanced-search-sidebar'
import { ActiveFiltersDisplay } from './components/active-filters-display'

const route = getRouteApi('/_authenticated/productos/productos/')

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

export function Productos() {
    const { hasPermission } = usePermissions()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const [productos, setProductos] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    
    // Estado para búsqueda avanzada
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState<AdvancedSearchFilters>({})
    const [allProductos, setAllProductos] = useState<Producto[]>([]) // Guardamos todos los productos sin filtrar
    const [empresas, setEmpresas] = useState<Array<{id: number, name: string}>>([])
    const [marcas, setMarcas] = useState<Array<{id: number, nombre: string}>>([])

    // Verificar permisos para bulk actions
    const canEdit = hasPermission('producto_modificar')
    const canDelete = hasPermission('producto_eliminar')
    const canBulkAction = canEdit || canDelete
    if (!hasPermission('producto_ver')) {
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

    const fetchProductos = async () => {
        try {
            setLoading(true)

            let data: Producto[]
            if (isSuperAdmin) {
                // Superadmin: get all productos from all companies
                data = await apiProductosService.getAllProductos()
                // También cargar empresas para el filtro
                try {
                    const empresasData = await apiEmpresaService.getAllEmpresas()
                    const mappedEmpresas = empresasData.map(e => ({ id: e.id!, name: e.name! }))
                    setEmpresas(mappedEmpresas)
                } catch (error) {
                    console.error('Error fetching empresas:', error)
                }
            } else {
                // Regular admin: get only productos from their company
                data = await apiProductosService.getProductosByEmpresa(userEmpresaId!)
            }

            setAllProductos(data) // Guardamos todos los productos
            applyFiltersToProducts(data, activeFilters) // Aplicamos filtros existentes
        } catch (error) {
            console.error('Error fetching productos:', error)
            toast.error('Error al cargar los productos')
        } finally {
            setLoading(false)
        }
    }

    // Función para aplicar filtros a los productos
    const applyFiltersToProducts = (productosData: Producto[], filters: AdvancedSearchFilters) => {
        let filtered = [...productosData]

        // Filtro por código
        if (filters.codigo) {
            filtered = filtered.filter(p => 
                p.codigo.toLowerCase().includes(filters.codigo!.toLowerCase())
            )
        }

        // Filtro por nombre
        if (filters.nombre) {
            filtered = filtered.filter(p => 
                p.nombre.toLowerCase().includes(filters.nombre!.toLowerCase())
            )
        }

        // Filtro por marca
        if (filters.marca_id) {
            filtered = filtered.filter(p => p.marca_id === filters.marca_id)
        }

        // Filtro por precio de costo mínimo
        if (filters.precio_costo_min !== undefined) {
            filtered = filtered.filter(p => p.precio_costo >= filters.precio_costo_min!)
        }

        // Filtro por precio de costo máximo
        if (filters.precio_costo_max !== undefined) {
            filtered = filtered.filter(p => p.precio_costo <= filters.precio_costo_max!)
        }

        // Filtro por precio de venta mínimo
        if (filters.precio_venta_min !== undefined) {
            filtered = filtered.filter(p => p.precio_venta >= filters.precio_venta_min!)
        }

        // Filtro por precio de venta máximo
        if (filters.precio_venta_max !== undefined) {
            filtered = filtered.filter(p => p.precio_venta <= filters.precio_venta_max!)
        }

        // Filtro por stock mínimo
        if (filters.stock_min !== undefined) {
            filtered = filtered.filter(p => p.stock >= filters.stock_min!)
        }

        // Filtro por stock máximo
        if (filters.stock_max !== undefined) {
            filtered = filtered.filter(p => p.stock <= filters.stock_max!)
        }

        // Filtro por estado
        if (filters.estado !== undefined) {
            filtered = filtered.filter(p => p.estado === filters.estado)
        }

        // Filtro por empresa (solo para superadmin)
        if (filters.empresa_id && isSuperAdmin) {
            filtered = filtered.filter(p => p.empresa_id === filters.empresa_id)
        }

        setProductos(filtered)
    }

    // Cargar marcas para el display de filtros activos
    const fetchMarcas = async () => {
        try {
            const apiMarcasService = await import('../../service/apiMarcas.service')
            const data = await apiMarcasService.default.getAllMarcas()
            setMarcas(data)
        } catch (error) {
            console.error('Error fetching marcas:', error)
        }
    }

    // Manejar cambios en los filtros
    const handleFiltersChange = (filters: AdvancedSearchFilters) => {
        setActiveFilters(filters)
        applyFiltersToProducts(allProductos, filters)
    }

    // Remover un filtro específico
    const handleRemoveFilter = (filterKey: keyof AdvancedSearchFilters) => {
        const newFilters = { ...activeFilters }
        
        // Limpiar filtros relacionados
        if (filterKey === 'precio_costo_min' || filterKey === 'precio_costo_max') {
            delete newFilters.precio_costo_min
            delete newFilters.precio_costo_max
        } else if (filterKey === 'precio_venta_min' || filterKey === 'precio_venta_max') {
            delete newFilters.precio_venta_min
            delete newFilters.precio_venta_max
        } else if (filterKey === 'stock_min' || filterKey === 'stock_max') {
            delete newFilters.stock_min
            delete newFilters.stock_max
        } else {
            delete newFilters[filterKey]
        }
        
        handleFiltersChange(newFilters)
    }

    // Limpiar todos los filtros
    const handleClearAllFilters = () => {
        handleFiltersChange({})
    }

    useEffect(() => {
        fetchProductos()
        fetchMarcas()
    }, [])

    const handleSuccess = async () => {
        // Refrescar la lista de productos inmediatamente
        try {
            setRefreshing(true)
            await fetchProductos()
        } catch (error) {
            console.error('Error refreshing productos:', error)
            // No mostramos error toast aquí para no duplicar mensajes
        } finally {
            setRefreshing(false)
        }
    }

    return (
            <ProductosProvider>
                {/* ===== Top Heading ===== */}
            <Header fixed>
            <Search />
            <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
            </div>
        </Header>

        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 xl:-mx-6 xl:px-6 2xl:-mx-32 2xl:px-8'>
            <div>
                <h2 className='text-2xl font-bold tracking-tight'>
                Productos
                {loading && <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>}
                {refreshing && <span className="ml-2 text-sm text-muted-foreground">Actualizando...</span>}
                </h2>
                <p className='text-muted-foreground'>
                Gestiona los productos de tu empresa.
                {Object.keys(activeFilters).length > 0 && (
                    <span className="ml-2 text-primary">
                    • {Object.keys(activeFilters).length} filtro{Object.keys(activeFilters).length > 1 ? 's' : ''} aplicado{Object.keys(activeFilters).length > 1 ? 's' : ''}
                    </span>
                )}
                </p>
            </div>
            <ProductosPrimaryButtons 
                onAdvancedSearchOpen={() => setIsAdvancedSearchOpen(true)}
                activeFiltersCount={Object.keys(activeFilters).length}
            />
            </div>
            
            {/* Mostrar filtros activos */}
            {Object.keys(activeFilters).length > 0 && (
                <div className="mb-4 xl:-mx-6 xl:px-6 2xl:-mx-32 2xl:px-8">
                    <ActiveFiltersDisplay
                        filters={activeFilters}
                        onRemoveFilter={handleRemoveFilter}
                        onClearAll={handleClearAllFilters}
                        marcas={marcas}
                        empresas={empresas}
                    />
                </div>
            )}

            {/* Con esta de linea de css en el div, me anda en mi monitor, pero nose en los demas
            quiero tratar de que no se vea un scroll horizontal */}
            <div className='flex-1 py-1 xl:-mx-6 xl:px-6 2xl:-mx-32 2xl:px-8'>
                <ProductosTable
                data={productos}
                search={search}
                navigate={navigate}
                onSuccess={handleSuccess}
                canBulkAction={canBulkAction}
                showEmpresaColumn={isSuperAdmin}
                />
            </div>

            <ProductosDialogs onSuccess={handleSuccess} />

            {/* Sidebar de búsqueda avanzada */}
            <AdvancedSearchSidebar
                open={isAdvancedSearchOpen}
                onOpenChange={setIsAdvancedSearchOpen}
                onFiltersChange={handleFiltersChange}
                showEmpresaFilter={isSuperAdmin}
                empresas={empresas}
                currentFilters={activeFilters}
            />
        </Main>
        </ProductosProvider>
    )
}

