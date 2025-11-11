import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Categoria } from '../data/schema'
import { toast } from 'sonner'
import apiCategoriasService from '@/service/apiCategorias.service'

type CategoriasDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Categoria
  onSuccess?: () => void
}

export function CategoriasDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: CategoriasDeleteDialogProps) {
  const handleDelete = async () => {
    try {
      if (currentRow.id) {
        await apiCategoriasService.deleteCategoria(currentRow.id)
        toast.success(`Categoría "${currentRow.nombre}" eliminada exitosamente`)
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar la categoría')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La categoría{' '}
            <span className='font-medium'>{currentRow.nombre}</span> será eliminada
            permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar categoría
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
