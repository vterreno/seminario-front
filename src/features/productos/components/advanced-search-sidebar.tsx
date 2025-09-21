import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import apiMarcasService from '@/service/apiMarcas.service'
import { toast } from 'sonner'

export interface AdvancedSearchFilters {
    codigo?: string
    nombre?: string
    marca_id?: number
    precio_costo_min?: number
    precio_costo_max?: number
    precio_venta_min?: number
    precio_venta_max?: number
    stock_min?: number
    stock_max?: number
    estado?: boolean
    empresa_id?: number // Para superadmin
}

// Interfaz para controlar qué filtros están activados
export interface ActiveFilters {
    codigo: boolean
    nombre: boolean
    marca: boolean
    precio_costo: boolean
    precio_venta: boolean
    stock: boolean
    estado: boolean
    empresa: boolean
}

interface Marca {
    id: number
    nombre: string
}

interface Empresa {
    id: number
    name: string
}

interface AdvancedSearchSidebarProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onFiltersChange: (filters: AdvancedSearchFilters) => void
    showEmpresaFilter?: boolean
    empresas?: Empresa[]
    currentFilters?: AdvancedSearchFilters // Filtros actualmente aplicados
}

// Componente FilterSection separado para evitar re-renders
interface FilterSectionProps {
    title: string
    children: React.ReactNode
    isActive: boolean
    onToggle: () => void
}

function FilterSection({ title, children, isActive, onToggle }: FilterSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {title}
                </h4>
                <div className="flex items-center space-x-2">
                    <span className={`text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <Switch
                        checked={isActive}
                        onCheckedChange={onToggle}
                    />
                </div>
            </div>
            <div className={`space-y-3 transition-opacity duration-200 ${
                isActive ? 'opacity-100' : 'opacity-40'
            }`}>
                <div className={!isActive ? 'pointer-events-none' : ''}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export function AdvancedSearchSidebar({ 
    open, 
    onOpenChange, 
    onFiltersChange, 
    showEmpresaFilter = false,
    empresas = [],
    currentFilters = {}
}: AdvancedSearchSidebarProps) {
    const [filters, setFilters] = useState<AdvancedSearchFilters>({})
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        codigo: false,
        nombre: false,
        marca: false,
        precio_costo: false,
        precio_venta: false,
        stock: false,
        estado: false,
        empresa: false
    })
    const [marcas, setMarcas] = useState<Marca[]>([])
    const [loadingMarcas, setLoadingMarcas] = useState(false)

    // Cargar marcas al abrir el sidebar
    useEffect(() => {
        if (open && marcas.length === 0) {
        fetchMarcas()
        }
    }, [open])

    // Sincronizar filtros cuando se abra el sidebar
    useEffect(() => {
        if (open) {
        setFilters(currentFilters)
        // Determinar qué filtros están activos basado en los currentFilters
        setActiveFilters({
            codigo: !!currentFilters.codigo,
            nombre: !!currentFilters.nombre,
            marca: !!currentFilters.marca_id,
            precio_costo: !!(currentFilters.precio_costo_min !== undefined || currentFilters.precio_costo_max !== undefined),
            precio_venta: !!(currentFilters.precio_venta_min !== undefined || currentFilters.precio_venta_max !== undefined),
            stock: !!(currentFilters.stock_min !== undefined || currentFilters.stock_max !== undefined),
            estado: currentFilters.estado !== undefined,
            empresa: !!currentFilters.empresa_id
        })
        }
    }, [open, currentFilters])

    const fetchMarcas = async () => {
        try {
        setLoadingMarcas(true)
        const data = await apiMarcasService.getAllMarcas()
        setMarcas(data)
        } catch (error) {
        toast.error('Error al cargar las marcas')
        } finally {
        setLoadingMarcas(false)
        }
    }

    const handleFilterChange = useCallback((key: keyof AdvancedSearchFilters, value: any) => {
        setFilters(prevFilters => {
            const newFilters = { ...prevFilters }
            
            if (value === undefined || value === null || value === '') {
                delete newFilters[key]
            } else {
                newFilters[key] = value
            }
            
            return newFilters
        })
    }, [])

    const handleFilterToggle = useCallback((filterKey: keyof ActiveFilters) => {
        setActiveFilters(prevActiveFilters => {
            const newActiveFilters = { ...prevActiveFilters, [filterKey]: !prevActiveFilters[filterKey] }
            
            // Si el filtro se desactiva, limpiar sus valores
            if (!newActiveFilters[filterKey]) {
                setFilters(prevFilters => {
                    const newFilters = { ...prevFilters }
                    
                    switch (filterKey) {
                        case 'codigo':
                            delete newFilters.codigo
                            break
                        case 'nombre':
                            delete newFilters.nombre
                            break
                        case 'marca':
                            delete newFilters.marca_id
                            break
                        case 'precio_costo':
                            delete newFilters.precio_costo_min
                            delete newFilters.precio_costo_max
                            break
                        case 'precio_venta':
                            delete newFilters.precio_venta_min
                            delete newFilters.precio_venta_max
                            break
                        case 'stock':
                            delete newFilters.stock_min
                            delete newFilters.stock_max
                            break
                        case 'estado':
                            delete newFilters.estado
                            break
                        case 'empresa':
                            delete newFilters.empresa_id
                            break
                    }
                    
                    return newFilters
                })
            }
            
            return newActiveFilters
        })
    }, [])

    // Crear funciones memoizadas para cada toggle
    const toggleCodigo = useCallback(() => handleFilterToggle('codigo'), [handleFilterToggle])
    const toggleNombre = useCallback(() => handleFilterToggle('nombre'), [handleFilterToggle])
    const toggleMarca = useCallback(() => handleFilterToggle('marca'), [handleFilterToggle])
    const toggleEstado = useCallback(() => handleFilterToggle('estado'), [handleFilterToggle])
    const togglePrecioCosto = useCallback(() => handleFilterToggle('precio_costo'), [handleFilterToggle])
    const togglePrecioVenta = useCallback(() => handleFilterToggle('precio_venta'), [handleFilterToggle])
    const toggleStock = useCallback(() => handleFilterToggle('stock'), [handleFilterToggle])
    const toggleEmpresa = useCallback(() => handleFilterToggle('empresa'), [handleFilterToggle])

    const applyFilters = () => {
        // Solo enviar filtros que estén activos
        const activeFiltersOnly: AdvancedSearchFilters = {}
        
        if (activeFilters.codigo && filters.codigo) {
        activeFiltersOnly.codigo = filters.codigo
        }
        if (activeFilters.nombre && filters.nombre) {
        activeFiltersOnly.nombre = filters.nombre
        }
        if (activeFilters.marca && filters.marca_id) {
        activeFiltersOnly.marca_id = filters.marca_id
        }
        if (activeFilters.precio_costo) {
        if (filters.precio_costo_min !== undefined) {
            activeFiltersOnly.precio_costo_min = filters.precio_costo_min
        }
        if (filters.precio_costo_max !== undefined) {
            activeFiltersOnly.precio_costo_max = filters.precio_costo_max
        }
        }
        if (activeFilters.precio_venta) {
        if (filters.precio_venta_min !== undefined) {
            activeFiltersOnly.precio_venta_min = filters.precio_venta_min
        }
        if (filters.precio_venta_max !== undefined) {
            activeFiltersOnly.precio_venta_max = filters.precio_venta_max
        }
        }
        if (activeFilters.stock) {
        if (filters.stock_min !== undefined) {
            activeFiltersOnly.stock_min = filters.stock_min
        }
        if (filters.stock_max !== undefined) {
            activeFiltersOnly.stock_max = filters.stock_max
        }
        }
        if (activeFilters.estado && filters.estado !== undefined) {
        activeFiltersOnly.estado = filters.estado
        }
        if (activeFilters.empresa && filters.empresa_id) {
        activeFiltersOnly.empresa_id = filters.empresa_id
        }
        
        // Aplicar filtros activos y cerrar sidebar
        onFiltersChange(activeFiltersOnly)
        onOpenChange(false)
    }

    const clearFilters = () => {
        // Limpiar filtros locales y aplicar (quitar todos los filtros)
        setFilters({})
        setActiveFilters({
        codigo: false,
        nombre: false,
        marca: false,
        precio_costo: false,
        precio_venta: false,
        stock: false,
        estado: false,
        empresa: false
        })
        onFiltersChange({})
    }

    const getActiveFiltersCount = () => {
        return Object.values(activeFilters).filter(Boolean).length
    }

    const hasUnsavedChanges = () => {
        return JSON.stringify(filters) !== JSON.stringify(currentFilters)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
            {/* Header fijo */}
            <div className="px-6 py-4 border-b flex-shrink-0">
            <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Búsqueda Avanzada
                {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()} configurados
                    </Badge>
                )}
                </SheetTitle>
                <SheetDescription>
                Activa los filtros que necesites y configura sus valores. Luego presiona "Aplicar Filtros" para buscar.
                </SheetDescription>
            </SheetHeader>
            </div>

            {/* Área de scroll con contenido */}
            <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-6 px-6 py-6">
                
                {/* Filtro por Código */}
                <FilterSection 
                    title="Código del Producto" 
                    isActive={activeFilters.codigo}
                    onToggle={toggleCodigo}
                >
                <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                    id="codigo"
                    placeholder="Ingrese el código del producto..."
                    value={filters.codigo || ''}
                    onChange={(e) => handleFilterChange('codigo', e.target.value)}
                    disabled={!activeFilters.codigo}
                    />
                </div>
                </FilterSection>

                <Separator />

                {/* Filtro por Nombre */}
                <FilterSection 
                    title="Nombre del Producto" 
                    isActive={activeFilters.nombre}
                    onToggle={toggleNombre}
                >
                <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                    id="nombre"
                    placeholder="Ingrese el nombre del producto..."
                    value={filters.nombre || ''}
                    onChange={(e) => handleFilterChange('nombre', e.target.value)}
                    disabled={!activeFilters.nombre}
                    />
                </div>
                </FilterSection>

                <Separator />

                {/* Filtro por Marca */}
                <FilterSection 
                    title="Marca" 
                    isActive={activeFilters.marca}
                    onToggle={toggleMarca}
                >
                <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Select
                    value={filters.marca_id?.toString() || 'all'}
                    onValueChange={(value) => 
                        handleFilterChange('marca_id', value === 'all' ? undefined : parseInt(value))
                    }
                    disabled={!activeFilters.marca}
                    >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar marca..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las marcas</SelectItem>
                        {loadingMarcas ? (
                        <SelectItem value="loading" disabled>Cargando marcas...</SelectItem>
                        ) : (
                        marcas.map((marca) => (
                            <SelectItem key={marca.id} value={marca.id.toString()}>
                            {marca.nombre}
                            </SelectItem>
                        ))
                        )}
                    </SelectContent>
                    </Select>
                </div>
                </FilterSection>

                <Separator />

                {/* Filtro por Estado */}
                <FilterSection 
                    title="Estado del Producto" 
                    isActive={activeFilters.estado}
                    onToggle={toggleEstado}
                >
                <div className="space-y-3">
                    <Label htmlFor="estado">Estado</Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <span className="text-sm text-muted-foreground">Inactivo</span>
                    <Switch
                        id="estado"
                        checked={filters.estado === true}
                        onCheckedChange={(checked) => 
                        handleFilterChange('estado', checked ? true : undefined)
                        }
                        disabled={!activeFilters.estado}
                    />
                    <span className="text-sm text-muted-foreground">Activo</span>
                    </div>
                </div>
                </FilterSection>

                <Separator />

                {/* Filtro por Precio de Costo */}
                <FilterSection 
                    title="Precio de Costo" 
                    isActive={activeFilters.precio_costo}
                    onToggle={togglePrecioCosto}
                >
                <div className="space-y-2">
                    <Label>Rango de Precio de Costo</Label>
                    <div className="grid grid-cols-2 gap-3">
                    <Input
                        type="number"
                        placeholder="Precio mínimo"
                        value={filters.precio_costo_min || ''}
                        onChange={(e) => 
                        handleFilterChange('precio_costo_min', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        disabled={!activeFilters.precio_costo}
                    />
                    <Input
                        type="number"
                        placeholder="Precio máximo"
                        value={filters.precio_costo_max || ''}
                        onChange={(e) => 
                        handleFilterChange('precio_costo_max', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        disabled={!activeFilters.precio_costo}
                    />
                    </div>
                </div>
                </FilterSection>

                <Separator />

                {/* Filtro por Precio de Venta */}
                <FilterSection 
                    title="Precio de Venta" 
                    isActive={activeFilters.precio_venta}
                    onToggle={togglePrecioVenta}
                >
                <div className="space-y-2">
                    <Label>Rango de Precio de Venta</Label>
                    <div className="grid grid-cols-2 gap-3">
                    <Input
                        type="number"
                        placeholder="Precio mínimo"
                        value={filters.precio_venta_min || ''}
                        onChange={(e) => 
                        handleFilterChange('precio_venta_min', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        disabled={!activeFilters.precio_venta}
                    />
                    <Input
                        type="number"
                        placeholder="Precio máximo"
                        value={filters.precio_venta_max || ''}
                        onChange={(e) => 
                        handleFilterChange('precio_venta_max', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        disabled={!activeFilters.precio_venta}
                    />
                    </div>
                </div>
                </FilterSection>

                <Separator />

                {/* Filtro por Stock */}
                <FilterSection 
                    title="Stock Disponible" 
                    isActive={activeFilters.stock}
                    onToggle={toggleStock}
                >
                <div className="space-y-2">
                    <Label>Rango de Stock</Label>
                    <div className="grid grid-cols-2 gap-3">
                    <Input
                        type="number"
                        placeholder="Stock mínimo"
                        value={filters.stock_min || ''}
                        onChange={(e) => 
                        handleFilterChange('stock_min', e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        disabled={!activeFilters.stock}
                    />
                    <Input
                        type="number"
                        placeholder="Stock máximo"
                        value={filters.stock_max || ''}
                        onChange={(e) => 
                        handleFilterChange('stock_max', e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        disabled={!activeFilters.stock}
                    />
                    </div>
                </div>
                </FilterSection>

                {/* Filtro de Empresa para Superadmin */}
                {showEmpresaFilter && (
                <>
                    <Separator />
                    <FilterSection 
                        title="Empresa" 
                        isActive={activeFilters.empresa}
                        onToggle={toggleEmpresa}
                    >
                    <div className="space-y-2">
                        <Label htmlFor="empresa">Empresa</Label>
                        <Select
                        value={filters.empresa_id?.toString() || 'all'}
                        onValueChange={(value) => 
                            handleFilterChange('empresa_id', value === 'all' ? undefined : parseInt(value))
                        }
                        disabled={!activeFilters.empresa}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar empresa..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las empresas</SelectItem>
                            {empresas.map((empresa) => (
                            <SelectItem key={empresa.id} value={empresa.id.toString()}>
                                {empresa.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    </FilterSection>
                </>
                )}

            </div>
            </ScrollArea>

            {/* Botones de acción fijos en la parte inferior */}
            <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
                disabled={getActiveFiltersCount() === 0}
            >
                <RotateCcw className="h-4 w-4" />
                Limpiar
            </Button>
            <Button
                onClick={applyFilters}
                className="flex-1 flex items-center gap-2"
                variant={hasUnsavedChanges() ? "default" : "outline"}
            >
                <Search className="h-4 w-4" />
                {hasUnsavedChanges() ? 'Aplicar Cambios' : 'Aplicar Filtros'}
            </Button>
            </div>
        </SheetContent>
        </Sheet>
    )
}