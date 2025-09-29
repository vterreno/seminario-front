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
        // Verificar si se puede eliminar
        const canDeleteResponse = await apiUnidadesMedida.canDelete(currentRow.id)
        
        if (!canDeleteResponse.canDelete) {
          toast.error(canDeleteResponse.message || 'Esta unidad de medida está siendo utilizada por al menos un producto y no se puede eliminar')
          return
        }

        await apiUnidadesMedida.delete(currentRow.id)
        toast.success(`Unidad de medida "${currentRow.nombre}" eliminada exitosamente`)
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      console.error('Error deleting unidad de medida:', error)
      // Manejar error de empresa requerida
      if (error.message && error.message.includes('pertenecer a una empresa')) {
        toast.error('Debe pertenecer a una empresa para gestionar unidades de medida. Solo el superadministrador no puede realizar esta acción.')
      } else {
        toast.error('Error al eliminar la unidad de medida')
      }
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