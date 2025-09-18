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
import { type Marca } from '../data/schema'
import apiMarcasService from '@/service/apiMarcas.service'

type MarcasMultiDeleteDialogProps<TData> = {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
    onSuccess?: () => void
}

export function MarcasMultiDeleteDialog<TData>({
    open,
    onOpenChange,
    table,
    onSuccess,
}: MarcasMultiDeleteDialogProps<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedMarcas = selectedRows.map((row) => row.original as Marca)

    const handleDelete = async () => {
        try {
        const marcaIds = selectedMarcas.map(marca => marca.id).filter(id => id !== undefined)
        await apiMarcasService.bulkDeleteMarcas(marcaIds)
        
        table.resetRowSelection()
        onOpenChange(false)
        toast.success(`${selectedMarcas.length} marca${selectedMarcas.length > 1 ? 's' : ''} eliminada${selectedMarcas.length > 1 ? 's' : ''} exitosamente`)
        onSuccess?.()
        } catch (error) {
        toast.error('Error al eliminar las marcas')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
                Esta acción no se puede deshacer. Se eliminarán{' '}
                <span className='font-medium'>{selectedMarcas.length}</span>{' '}
                marca{selectedMarcas.length > 1 ? 's' : ''} permanentemente del sistema.
            </DialogDescription>
            </DialogHeader>
            <div className='max-h-[200px] overflow-auto'>
            <ul className='list-disc list-inside space-y-1 text-sm'>
                {selectedMarcas.map((marca) => (
                <li key={marca.id}>{marca.nombre}</li>
                ))}
            </ul>
            </div>
            <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
                Cancelar
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
                Eliminar {selectedMarcas.length} marca{selectedMarcas.length > 1 ? 's' : ''}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
