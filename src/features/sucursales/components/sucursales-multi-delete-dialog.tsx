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
import { type Sucursal } from '../data/schema'
import apiSucursalesService from '@/service/apiSucursales.service'

type SucursalesMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

export function SucursalesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: SucursalesMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedSucursales = selectedRows.map((row) => row.original as Sucursal)

  const handleDelete = async () => {
    try {
      const ids = selectedSucursales.map(s => s.id!).filter(Boolean)
      await apiSucursalesService.deleteSucursales(ids)
      
      table.resetRowSelection()
      onOpenChange(false)
      toast.success(`${selectedSucursales.length} sucursal${selectedSucursales.length > 1 ? 'es' : ''} eliminada${selectedSucursales.length > 1 ? 's' : ''} exitosamente`)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar las sucursales')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán{' '}
            <span className='font-medium'>{selectedSucursales.length}</span>{' '}
            sucursal{selectedSucursales.length > 1 ? 'es' : ''} permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[200px] overflow-auto'>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            {selectedSucursales.map((sucursal) => (
              <li key={sucursal.id}>{sucursal.nombre}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar {selectedSucursales.length} sucursal{selectedSucursales.length > 1 ? 'es' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
