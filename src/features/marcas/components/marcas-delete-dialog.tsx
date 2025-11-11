import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Marca } from '../data/schema'
import { toast } from 'sonner'
import apiMarcasService from '@/service/apiMarcas.service'

type MarcasDeleteDialogProps = {
    currentRow?: Marca
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function MarcasDeleteDialog({
    currentRow,
    open,
    onOpenChange,
    onSuccess,
}: MarcasDeleteDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!currentRow?.id) return

        try {
        setLoading(true)
        
        await apiMarcasService.deleteMarca(currentRow.id)
        
        toast.success('Marca eliminada exitosamente')
        onOpenChange(false)
        onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar la marca')
        } finally {
        setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Eliminar marca</DialogTitle>
            <DialogDescription>
                ¿Estás seguro de que quieres eliminar la marca "<strong>{currentRow?.nombre}</strong>"?
                Esta acción no se puede deshacer.
            </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
            <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
            >
                Cancelar
            </Button>
            <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
            >
                {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
