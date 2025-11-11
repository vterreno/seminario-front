import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { type Producto } from '../data/schema'
import apiProductosService from '@/service/apiProductos.service'

type ProductosMultiDeleteDialogProps<TData> = {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
    onSuccess?: () => void
}

export function ProductosMultiDeleteDialog<TData>({
    open,
    onOpenChange,
    table,
    onSuccess,
}: ProductosMultiDeleteDialogProps<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedProductos = selectedRows.map((row) => row.original as Producto)

    const handleDelete = async () => {
        try {
        const productoIds = selectedProductos.filter(producto => producto.id !== undefined).map(producto => producto.id)
        await apiProductosService.bulkDeleteProductos(productoIds)

        table.resetRowSelection()
        onOpenChange(false)
        toast.success(`${selectedProductos.length} producto${selectedProductos.length > 1 ? 's' : ''} eliminado${selectedProductos.length > 1 ? 's' : ''} exitosamente`)
        onSuccess?.()
        } catch (error: any) {
        toast.error(error?.message || 'Error al eliminar los productos. Por favor, intenta nuevamente.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
                Esta acción no se puede deshacer. Se eliminarán{' '}
                <span className='font-medium'>{selectedProductos.length}</span>{' '}
                producto{selectedProductos.length > 1 ? 's' : ''} permanentemente del sistema.
            </DialogDescription>
            </DialogHeader>
            <div className='max-h-[200px] overflow-auto'>
            <ul className='list-disc list-inside space-y-1 text-sm'>
                {selectedProductos.map((producto) => (
                <li key={producto.id}>{producto.nombre}</li>
                ))}
            </ul>
            </div>
            <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
                Cancelar
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
                Eliminar {selectedProductos.length} producto{selectedProductos.length > 1 ? 's' : ''}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
