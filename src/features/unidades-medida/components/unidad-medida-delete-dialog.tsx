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
import { unidadesMedidaService } from '@/service/unidades-medida.service'

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
        // Verificar si se puede eliminar
        const canDeleteResponse = await unidadesMedidaService.canDelete(currentRow.id)
        
        if (!canDeleteResponse.canDelete) {
          toast.error(canDeleteResponse.message || 'Esta unidad de medida está siendo utilizada por al menos un producto y no se puede eliminar')
          return
        }

        await unidadesMedidaService.delete(currentRow.id)
        toast.success(`Unidad de medida "${currentRow.nombre}" eliminada exitosamente`)
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error deleting unidad de medida:', error)
      toast.error('Error al eliminar la unidad de medida')
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