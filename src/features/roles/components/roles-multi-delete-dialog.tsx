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
import { type Role } from '../data/schema'
import apiRolesService from '@/service/apiRoles.service'

type RolesMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

export function RolesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: RolesMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedRoles = selectedRows.map((row) => row.original as Role)

  const handleDelete = async () => {
    try {
      const roleIds = selectedRoles.map(role => role.id!).filter(id => id !== undefined)
      await apiRolesService.bulkDeleteRoles(roleIds)
      
      table.resetRowSelection()
      onOpenChange(false)
      toast.success(`${selectedRoles.length} rol${selectedRoles.length > 1 ? 'es' : ''} eliminado${selectedRoles.length > 1 ? 's' : ''} exitosamente`)
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting roles:', error)
      toast.error('Error al eliminar los roles')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán{' '}
            <span className='font-medium'>{selectedRoles.length}</span>{' '}
            rol{selectedRoles.length > 1 ? 'es' : ''} permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[200px] overflow-auto'>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            {selectedRoles.map((role) => (
              <li key={role.id}>{role.nombre}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar {selectedRoles.length} rol{selectedRoles.length > 1 ? 'es' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
