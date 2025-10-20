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
import { type Venta } from '../data/schema'
import apiVentasService from '@/service/apiVentas.service'

type VentasMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

export function VentasMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: VentasMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedVentas = selectedRows.map((row) => row.original as Venta)

  const handleDelete = async () => {
    try {
      const ventaIds = selectedVentas.map(venta => venta.id!).filter(id => id !== undefined)
      
      // Eliminar ventas una por una ya que no existe un método de eliminación masiva
      await Promise.all(ventaIds.map(id => apiVentasService.deleteVenta(id)))
      
      table.resetRowSelection()
      onOpenChange(false)
      toast.success(`${selectedVentas.length} venta${selectedVentas.length > 1 ? 's' : ''} eliminada${selectedVentas.length > 1 ? 's' : ''} exitosamente`)
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting ventas:', error)
      toast.error('Error al eliminar las ventas')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán{' '}
            <span className='font-medium'>{selectedVentas.length}</span>{' '}
            venta{selectedVentas.length > 1 ? 's' : ''} permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[200px] overflow-auto'>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            {selectedVentas.map((venta) => (
              <li key={venta.id}>Venta #{venta.numero_venta}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar {selectedVentas.length} venta{selectedVentas.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
