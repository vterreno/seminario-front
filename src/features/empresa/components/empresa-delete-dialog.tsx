import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empresa } from '../data/schema'
import { toast } from 'sonner'
import apiEmpresaService from '@/service/apiEmpresa.service'

type EmpresaDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Empresa
  onSuccess?: () => void
}

export function EmpresaDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: EmpresaDeleteDialogProps) {
  const handleDelete = async () => {
    try {
      if (currentRow.id) {
        await apiEmpresaService.deleteEmpresa(currentRow.id)
        toast.success(`Empresa "${currentRow.name}" eliminada exitosamente`)
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error deleting empresa:', error)
      toast.error('Error al eliminar la empresa')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La empresa{' '}
            <span className='font-medium'>{currentRow.name}</span> será eliminada
            permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar empresa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
