import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { type Venta } from '../data/schema'
import apiVentasService from '@/service/apiVentas.service'

type VentasDeleteDialogProps = {
  currentRow?: Venta
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function VentasDeleteDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: VentasDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!currentRow?.id) return

    setIsDeleting(true)
    try {
      await apiVentasService.deleteVenta(currentRow.id)
      toast.success('Venta eliminada exitosamente')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error deleting venta:', error)
      toast.error(error.message || 'Error al eliminar la venta')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará la venta #{currentRow?.numero_venta}.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
