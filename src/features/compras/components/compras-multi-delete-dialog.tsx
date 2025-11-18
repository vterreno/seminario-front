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
import { type Compra } from '../data/schema'
import apiComprasService from '@/service/apiCompras.service'

type ComprasMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

export function ComprasMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: ComprasMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCompras = selectedRows.map((row) => row.original as Compra)

  const handleDelete = async () => {
    try {
      const compraIds = selectedCompras.map(compra => compra.id!).filter(id => id !== undefined)
      
      // Usar el método de eliminación masiva si existe, sino eliminar una por una
      if (compraIds.length > 0) {
        try {
          await apiComprasService.bulkDeleteCompras(compraIds)
        } catch (bulkError) {
          console.error('Bulk delete failed, falling back to individual deletions:', bulkError);
          toast.warning('La eliminación masiva falló. Intentando eliminar las compras una por una.');
          await Promise.all(compraIds.map(id => apiComprasService.deleteCompra(id)))
        }
      }
      
      table.resetRowSelection()
      onOpenChange(false)
      toast.success(`${selectedCompras.length} compra${selectedCompras.length > 1 ? 's' : ''} eliminada${selectedCompras.length > 1 ? 's' : ''} exitosamente`)
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting compras:', error)
      toast.error('Error al eliminar las compras')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán{' '}
            <span className='font-medium'>{selectedCompras.length}</span>{' '}
            compra{selectedCompras.length > 1 ? 's' : ''} permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[200px] overflow-auto'>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            {selectedCompras.map((compra) => (
              <li key={compra.id}>Compra #{compra.numero_compra}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar {selectedCompras.length} compra{selectedCompras.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
