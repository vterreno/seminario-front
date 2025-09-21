import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { type AdvancedSearchFilters } from './advanced-search-sidebar'

interface ActiveFiltersDisplayProps {
    filters: AdvancedSearchFilters
    onRemoveFilter: (filterKey: keyof AdvancedSearchFilters) => void
    onClearAll: () => void
    marcas?: Array<{id: number, nombre: string}>
    empresas?: Array<{id: number, name: string}>
}

export function ActiveFiltersDisplay({ 
    filters, 
    onRemoveFilter, 
    onClearAll, 
    marcas = [], 
    empresas = [] 
}: ActiveFiltersDisplayProps) {
    const hasFilters = Object.keys(filters).length > 0

    if (!hasFilters) {
        return null
    }

    const getFilterLabel = (key: keyof AdvancedSearchFilters, value: any) => {
        switch (key) {
        case 'codigo':
            return `Código: "${value}"`
        case 'nombre':
            return `Nombre: "${value}"`
        case 'marca_id':
            const marca = marcas.find(m => m.id === value)
            return `Marca: ${marca?.nombre || 'N/A'}`
        case 'precio_costo_min':
            return `Precio costo ≥ $${value}`
        case 'precio_costo_max':
            return `Precio costo ≤ $${value}`
        case 'precio_venta_min':
            return `Precio venta ≥ $${value}`
        case 'precio_venta_max':
            return `Precio venta ≤ $${value}`
        case 'stock_min':
            return `Stock ≥ ${value}`
        case 'stock_max':
            return `Stock ≤ ${value}`
        case 'estado':
            return `Estado: ${value ? 'Activo' : 'Inactivo'}`
        case 'empresa_id':
            const empresa = empresas.find(e => e.id === value)
            return `Empresa: ${empresa?.name || 'N/A'}`
        default:
            return `${key}: ${value}`
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg border">
        <span className="text-sm font-medium text-muted-foreground">
            Filtros aplicados:
        </span>
        
        {Object.entries(filters).map(([key, value]) => (
            <Badge 
            key={key} 
            variant="secondary" 
            className="flex items-center gap-1 px-2 py-1"
            >
            {getFilterLabel(key as keyof AdvancedSearchFilters, value)}
            <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onRemoveFilter(key as keyof AdvancedSearchFilters)}
            >
                <X className="h-3 w-3" />
            </Button>
            </Badge>
        ))}
        
        <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
        >
            Limpiar todos
        </Button>
        </div>
    )
}