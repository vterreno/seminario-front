import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Producto } from '../data/schema'
import { toast } from 'sonner'
import apiProductosService from '@/service/apiProductos.service'

type ProductosDeleteDialogProps = {
    currentRow?: Producto
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ProductosDeleteDialog({
    currentRow,
    open,
    onOpenChange,
    onSuccess,
}: ProductosDeleteDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!currentRow?.id) return

        try {
        setLoading(true)

        await apiProductosService.deleteProducto(currentRow.id)

        toast.success('Producto eliminado exitosamente')
        onOpenChange(false)
        onSuccess?.()
        } catch (error: any) {
        toast.error(error.message || 'Error al eliminar el producto')
        } finally {
        setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
                ¿Estás seguro de que quieres eliminar el producto "<strong>{currentRow?.nombre}</strong>"?
                Esta acción no se puede deshacer.
            </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
            <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
            >
                Cancelar
            </Button>
            <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
            >
                {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
