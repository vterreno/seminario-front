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
import { type UnidadMedida } from '../data/schema'
import apiUnidadesMedida from '@/service/apiUnidadesMedida.service'

type UnidadMedidaMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

export function UnidadMedidaMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: UnidadMedidaMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedUnidades = selectedRows.map((row) => row.original as UnidadMedida)

  const handleDelete = async () => {
    try {
      const ids = selectedUnidades.map((unidad) => unidad.id!).filter(Boolean)
      await apiUnidadesMedida.bulkDeleteUnidadesMedida(ids)

      table.resetRowSelection()
      onOpenChange(false)
      toast.success(`${selectedUnidades.length} unidad${selectedUnidades.length > 1 ? 'es' : ''} de medida eliminada${selectedUnidades.length > 1 ? 's' : ''} exitosamente`)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar las unidades de medida')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán{' '}
            <span className='font-medium'>{selectedUnidades.length}</span>{' '}
            unidad{selectedUnidades.length > 1 ? 'es' : ''} de medida permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[200px] overflow-auto'>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            {selectedUnidades.map((unidad) => (
              <li key={unidad.id}>
                <span className="font-medium">{unidad.nombre}</span> ({unidad.abreviatura})
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar {selectedUnidades.length} unidad{selectedUnidades.length > 1 ? 'es' : ''} de medida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}