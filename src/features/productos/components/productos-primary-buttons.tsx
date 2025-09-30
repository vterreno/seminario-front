import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Filter } from 'lucide-react'
import { useProductos } from './productos-provider'
import { usePermissions } from '@/hooks/use-permissions'

interface ProductosPrimaryButtonsProps {
    onAdvancedSearchOpen?: () => void
    activeFiltersCount?: number
}

export function ProductosPrimaryButtons({ onAdvancedSearchOpen, activeFiltersCount = 0 }: ProductosPrimaryButtonsProps) {
    const { setOpen } = useProductos()
    const { hasPermission } = usePermissions()

    const canAdd = hasPermission('producto_agregar')
    const canView = hasPermission('producto_ver')

    return (
        <div className='flex items-center space-x-2'>
            {/* Botón de búsqueda avanzada - disponible para todos los que pueden ver productos */}
            {canView && onAdvancedSearchOpen && (
                <Button
                    onClick={onAdvancedSearchOpen}
                    size='sm'
                    variant={activeFiltersCount > 0 ? 'default' : 'outline'}
                    className='h-8 relative'
                >
                    <Filter className='mr-2 h-4 w-4' />
                    Búsqueda avanzada
                    {activeFiltersCount > 0 && (
                        <Badge 
                            variant="secondary" 
                            className="ml-2 px-1.5 py-0.5 text-xs"
                        >
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            )}
            
            {/* Botón agregar - solo para quienes tienen permisos */}
            {canAdd && (
                <Button
                    onClick={() => setOpen('add')}
                    size='sm'
                    className='h-8'
                >
                    <Plus className='mr-2 h-4 w-4' />
                    Agregar producto
                </Button>
            )}
        </div>
    )
}
