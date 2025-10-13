import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useListaPreciosContext } from './lista-precios-provider'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import { toast } from 'sonner'
import { useState } from 'react'

interface ListaPreciosDeleteDialogProps {
    onSuccess?: () => void
}

export function ListaPreciosDeleteDialog({ onSuccess }: ListaPreciosDeleteDialogProps) {
    const { selectedLista, isDeleteDialogOpen, setIsDeleteDialogOpen } = useListaPreciosContext()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!selectedLista) return

        try {
            setIsDeleting(true)
            await apiListaPreciosService.deleteListaPrecios(selectedLista.id)
            toast.success('Lista de precios eliminada exitosamente')
            setIsDeleteDialogOpen(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar la lista de precios')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>¿Eliminar lista de precios?</DialogTitle>
                    <DialogDescription>
                        Estás por eliminar la lista de precios <strong>{selectedLista?.nombre}</strong>.
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
