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
import { type Compra } from '../data/schema'
import apiComprasService from '@/service/apiCompras.service'

type ComprasDeleteDialogProps = {
  currentRow?: Compra
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ComprasDeleteDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: ComprasDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!currentRow?.id) return

    setIsDeleting(true)
    try {
      await apiComprasService.deleteCompra(currentRow.id)
      toast.success('Compra eliminada exitosamente')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error deleting compra:', error)
      toast.error(error.message || 'Error al eliminar la compra')
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
            Esta acción eliminará la compra #{currentRow?.numero_compra}.
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
