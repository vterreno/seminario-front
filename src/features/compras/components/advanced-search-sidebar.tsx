import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { FilterSection } from './filter-section'

export interface AdvancedSearchFilters {
    fecha_desde?: string
    fecha_hasta?: string
    monto_min?: number
    monto_max?: number
    estado?: 'pendiente_pago' | 'pagado'
    empresa_id?: number // Para superadmin
    sucursal_id?: number // Para superadmin
}

// Interfaz para controlar qué filtros están activados
export interface ActiveFilters {
    fecha_rango: boolean
    monto_rango: boolean
    estado: boolean
    empresa: boolean
    sucursal: boolean
}

interface Empresa {
    id?: number
    name: string
    estado?: boolean
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
}

interface Sucursal {
    id?: number
    nombre: string
    codigo?: string | null
    direccion?: string | null
    empresa_id?: number
    empresa?: Empresa
    estado?: boolean
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
}

interface AdvancedSearchSidebarProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onFiltersChange: (filters: AdvancedSearchFilters) => void
    showEmpresaFilter?: boolean
    showSucursalFilter?: boolean
    empresas?: Empresa[]
    sucursales?: Sucursal[]
    currentFilters?: AdvancedSearchFilters // Filtros actualmente aplicados
}

export function AdvancedSearchSidebar({ 
    open, 
    onOpenChange, 
    onFiltersChange, 
    showEmpresaFilter = false,
    showSucursalFilter = false,
    empresas = [],
    sucursales = [],
    currentFilters = {}
}: AdvancedSearchSidebarProps) {
    const [filters, setFilters] = useState<AdvancedSearchFilters>({})
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        fecha_rango: false,
        monto_rango: false,
        estado: false,
        empresa: false,
        sucursal: false
    })

    // Filtrar sucursales por empresa seleccionada solo si hay filtro de empresa
    const filteredSucursales = useMemo<Sucursal[]>(() => {
        if (showEmpresaFilter) {
            if (filters.empresa_id) {
                return sucursales.filter(s => s.empresa_id === filters.empresa_id)
            } else if (showSucursalFilter) {
                // Si también hay showSucursalFilter, mostrar todas las sucursales
                return sucursales
            } else {
                return []
            }
        } else if (showSucursalFilter) {
            return sucursales
        } else {
            return []
        }
    }, [showEmpresaFilter, filters.empresa_id, showSucursalFilter, sucursales])

    // Sincronizar filtros cuando se abra el sidebar
    useEffect(() => {
        if (open) {
            setFilters(currentFilters)
            // Determinar qué filtros están activos basado en los currentFilters
            setActiveFilters({
                fecha_rango: !!(currentFilters.fecha_desde || currentFilters.fecha_hasta),
                monto_rango: !!(currentFilters.monto_min !== undefined || currentFilters.monto_max !== undefined),
                estado: !!currentFilters.estado,
                empresa: !!currentFilters.empresa_id,
                sucursal: !!currentFilters.sucursal_id
            })
        }
    }, [open, currentFilters])

    const handleFilterChange = useCallback((key: keyof AdvancedSearchFilters, value: any) => {
        setFilters(prevFilters => {
            const newFilters = { ...prevFilters }
            
            if (value === undefined || value === null || value === '') {
                delete newFilters[key]
            } else {
                newFilters[key] = value
            }
            
            // Si se cambia la empresa, limpiar la sucursal
            if (key === 'empresa_id') {
                delete newFilters.sucursal_id
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
                        case 'fecha_rango':
                            delete newFilters.fecha_desde
                            delete newFilters.fecha_hasta
                            break
                        case 'monto_rango':
                            delete newFilters.monto_min
                            delete newFilters.monto_max
                            break
                        case 'estado':
                            delete newFilters.estado
                            break
                        case 'empresa':
                            delete newFilters.empresa_id
                            break
                        case 'sucursal':
                            delete newFilters.sucursal_id
                            break
                    }
                    
                    return newFilters
                })
            }
            
            return newActiveFilters
        })
    }, [])

    // Crear funciones memoizadas para cada toggle
    const toggleFechaRango = useCallback(() => handleFilterToggle('fecha_rango'), [handleFilterToggle])
    const toggleMontoRango = useCallback(() => handleFilterToggle('monto_rango'), [handleFilterToggle])
    const toggleEstado = useCallback(() => handleFilterToggle('estado'), [handleFilterToggle])
    const toggleEmpresa = useCallback(() => handleFilterToggle('empresa'), [handleFilterToggle])
    const toggleSucursal = useCallback(() => handleFilterToggle('sucursal'), [handleFilterToggle])

    const applyFilters = () => {
        // Solo enviar filtros que estén activos
        const activeFiltersOnly: AdvancedSearchFilters = {}
        
        if (activeFilters.fecha_rango) {
            if (filters.fecha_desde) {
                activeFiltersOnly.fecha_desde = filters.fecha_desde
            }
            if (filters.fecha_hasta) {
                activeFiltersOnly.fecha_hasta = filters.fecha_hasta
            }
        }
        if (activeFilters.monto_rango) {
            if (filters.monto_min !== undefined) {
                activeFiltersOnly.monto_min = filters.monto_min
            }
            if (filters.monto_max !== undefined) {
                activeFiltersOnly.monto_max = filters.monto_max
            }
        }
        if (activeFilters.estado && filters.estado) {
            activeFiltersOnly.estado = filters.estado
        }
        if (activeFilters.empresa && filters.empresa_id) {
            activeFiltersOnly.empresa_id = filters.empresa_id
        }
        if (activeFilters.sucursal && filters.sucursal_id) {
            activeFiltersOnly.sucursal_id = filters.sucursal_id
        }
        
        // Aplicar filtros activos y cerrar sidebar
        onFiltersChange(activeFiltersOnly)
        onOpenChange(false)
    }

    const clearFilters = () => {
        // Limpiar filtros locales y aplicar (quitar todos los filtros)
        setFilters({})
        setActiveFilters({
            fecha_rango: false,
            monto_rango: false,
            estado: false,
            empresa: false,
            sucursal: false
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
                            Búsqueda avanzada de compras
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
                        
                        {/* Filtro por Empresa (solo para superadmin) */}
                        {showEmpresaFilter && (
                            <>
                                <FilterSection 
                                    title="Empresa" 
                                    isActive={activeFilters.empresa}
                                    onToggle={toggleEmpresa}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="empresa">Empresa</Label>
                                        <Select
                                            value={filters.empresa_id?.toString() || ''}
                                            onValueChange={(value) => 
                                                handleFilterChange('empresa_id', value === '' ? undefined : parseInt(value))
                                            }
                                            disabled={!activeFilters.empresa}
                                        >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Seleccionar empresa..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {empresas.filter(e => e.id !== undefined).map((empresa) => (
                                                    <SelectItem key={empresa.id} value={empresa.id!.toString()}>
                                                        {empresa.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FilterSection>

                                <Separator />
                            </>
                        )}

                        {/* Filtro por Sucursal (para superadmin o usuario con varias sucursales) */}
                        {(showEmpresaFilter || showSucursalFilter) && (
                            <>
                                <FilterSection 
                                    title="Sucursal" 
                                    isActive={activeFilters.sucursal}
                                    onToggle={toggleSucursal}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="sucursal">Sucursal</Label>
                                        <Select
                                            value={filters.sucursal_id?.toString() || ''}
                                            onValueChange={(value) => 
                                                handleFilterChange('sucursal_id', value === '' ? undefined : parseInt(value))
                                            }
                                            disabled={
                                                !activeFilters.sucursal ||
                                                (showEmpresaFilter && !filters.empresa_id)
                                            }
                                        >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={
                                                    showEmpresaFilter && !filters.empresa_id 
                                                        ? "Primero seleccione una empresa..." 
                                                        : "Seleccionar sucursal..."
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredSucursales.filter(s => s.id !== undefined).map((sucursal) => (
                                                    <SelectItem key={sucursal.id} value={sucursal.id!.toString()}>
                                                        {sucursal.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {showEmpresaFilter && !filters.empresa_id && activeFilters.sucursal && (
                                            <p className="text-xs text-muted-foreground">
                                                Seleccione una empresa primero para ver las sucursales
                                            </p>
                                        )}
                                    </div>
                                </FilterSection>
                                <Separator />
                            </>
                        )}

                        {/* Filtro por Rango de Monto */}
                        <FilterSection 
                            title="Rango de Monto Total" 
                            isActive={activeFilters.monto_rango}
                            onToggle={toggleMontoRango}
                        >
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="monto_min">Monto mínimo ($)</Label>
                                    <Input
                                        id="monto_min"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={filters.monto_min ?? ''}
                                        onChange={(e) => handleFilterChange('monto_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        disabled={!activeFilters.monto_rango}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="monto_max">Monto máximo ($)</Label>
                                    <Input
                                        id="monto_max"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={filters.monto_max ?? ''}
                                        onChange={(e) => handleFilterChange('monto_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        disabled={!activeFilters.monto_rango}
                                    />
                                </div>
                            </div>
                        </FilterSection>

                        <Separator />

                        {/* Filtro por Rango de Fechas */}
                        <FilterSection 
                            title="Rango de Fechas" 
                            isActive={activeFilters.fecha_rango}
                            onToggle={toggleFechaRango}
                        >
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_desde">Fecha desde</Label>
                                    <Input
                                        id="fecha_desde"
                                        type="date"
                                        value={filters.fecha_desde || ''}
                                        onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                                        disabled={!activeFilters.fecha_rango}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_hasta">Fecha hasta</Label>
                                    <Input
                                        id="fecha_hasta"
                                        type="date"
                                        value={filters.fecha_hasta || ''}
                                        onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                                        disabled={!activeFilters.fecha_rango}
                                    />
                                </div>
                            </div>
                        </FilterSection>

                        <Separator />

                        {/* Filtro por Estado de Compra */}
                        <FilterSection 
                            title="Estado de Compra" 
                            isActive={activeFilters.estado}
                            onToggle={toggleEstado}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado de compra</Label>
                                <Select
                                    value={filters.estado || ''}
                                    onValueChange={(value) => 
                                        handleFilterChange('estado', value === '' ? undefined : value)
                                    }
                                    disabled={!activeFilters.estado}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Seleccionar estado..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pendiente_pago">PENDIENTE PAGO</SelectItem>
                                        <SelectItem value="pagado">PAGADO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </FilterSection>

                    </div>
                </ScrollArea>

                {/* Footer fijo con botones */}
                <div className="px-6 py-4 border-t flex-shrink-0 space-y-2">
                    <div className="flex gap-2">
                        <Button 
                            onClick={applyFilters} 
                            className="flex-1"
                            disabled={getActiveFiltersCount() === 0}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Aplicar Filtros
                        </Button>
                        <Button 
                            onClick={clearFilters} 
                            variant="outline"
                            disabled={getActiveFiltersCount() === 0}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    {hasUnsavedChanges() && (
                        <p className="text-xs text-muted-foreground text-center">
                            Hay cambios sin guardar
                        </p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
