import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useListaPreciosContext } from './lista-precios-provider'
import { usePermissions } from '@/hooks/use-permissions'

interface ListaPreciosPrimaryButtonsProps {
    onSuccess?: () => void
}

export function ListaPreciosPrimaryButtons({ onSuccess }: ListaPreciosPrimaryButtonsProps) {
    const { setIsAddDialogOpen } = useListaPreciosContext()
    const { hasPermission } = usePermissions()

    const canAdd = hasPermission('modulo_listas_agregar')

    return (
        <div className="flex gap-2">
            {canAdd && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Lista
                </Button>
            )}
        </div>
    )
}
