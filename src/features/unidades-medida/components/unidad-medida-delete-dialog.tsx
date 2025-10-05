import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UnidadMedida } from '../data/schema'
import { toast } from 'sonner'
import apiUnidadesMedida from '@/service/apiUnidadesMedida.service'

type UnidadMedidaDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: UnidadMedida
  onSuccess?: () => void
}

export function UnidadMedidaDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: UnidadMedidaDeleteDialogProps) {
  const handleDelete = async () => {
    try {
      if (currentRow.id) {
        // Ejecutar eliminación y manejar el resultado vía excepción si falla
        await apiUnidadesMedida.deleteUnidadMedida(currentRow.id)
        toast.success(`Unidad de medida "${currentRow.nombre}" eliminada exitosamente`)
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      console.error('Error deleting unidad de medida:', error)
      // Mostrar mensaje del error si existe, sino un mensaje genérico
      const message = error?.message || 'Error al eliminar la unidad de medida'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La unidad de medida{' '}
            <span className='font-medium'>{currentRow.nombre}</span> ({currentRow.abreviatura}) será eliminada
            permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar unidad de medida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}