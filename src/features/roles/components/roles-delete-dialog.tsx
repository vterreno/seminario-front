import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Role } from '../data/schema'
import { toast } from 'sonner'
import apiRolesService from '@/service/apiRoles.service'

type RolesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Role
  onSuccess?: () => void
}

export function RolesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: RolesDeleteDialogProps) {
  const handleDelete = async () => {
    try {
      if (currentRow.id) {
        await apiRolesService.deleteRole(currentRow.id)
        toast.success(`Rol "${currentRow.nombre}" eliminado exitosamente`)
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Error al eliminar el rol')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El rol{' '}
            <span className='font-medium'>{currentRow.nombre}</span> será eliminado
            permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar rol
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
