import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sucursal } from '../data/schema'
import { toast } from 'sonner'
import apiSucursalesService from '@/service/apiSucursales.service'

type SucursalesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Sucursal
  onSuccess?: () => void
}

export function SucursalesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: SucursalesDeleteDialogProps) {
  const handleDelete = async () => {
    try {
      if (currentRow.id) {
        await apiSucursalesService.deleteSucursal(currentRow.id)
        toast.success(`Sucursal "${currentRow.nombre}" eliminada exitosamente`)
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la sucursal')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La sucursal{' '}
            <span className='font-medium'>{currentRow.nombre}</span> será eliminada
            permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar sucursal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
