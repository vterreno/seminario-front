import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { type ListaPrecios } from '../data/schema'
import apiListaPreciosService from '@/service/apiListaPrecios.service'

interface ListaPreciosMultiDeleteDialogProps<TData> {
    table: Table<TData>
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ListaPreciosMultiDeleteDialog<TData>({
    table,
    open,
    onOpenChange,
    onSuccess,
}: ListaPreciosMultiDeleteDialogProps<TData>) {
    const [isDeleting, setIsDeleting] = useState(false)
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedListas = selectedRows.map((row) => row.original as ListaPrecios)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            const listaIds = selectedListas.map((lista) => lista.id)
            
            await apiListaPreciosService.bulkDeleteListaPrecios(listaIds)
            
            toast.success(`${selectedListas.length} lista${selectedListas.length > 1 ? 's' : ''} de precios eliminada${selectedListas.length > 1 ? 's' : ''} exitosamente`)
            table.resetRowSelection()
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar listas de precios')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán permanentemente{' '}
                        <strong>{selectedListas.length}</strong> lista{selectedListas.length > 1 ? 's' : ''} de precios:
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="max-h-[200px] overflow-y-auto rounded-md border p-3 space-y-1">
                    {selectedListas.map((lista) => (
                        <div key={lista.id} className="text-sm">
                            • <strong>{lista.nombre}</strong>
                            {lista.descripcion && (
                                <span className="text-muted-foreground ml-1">
                                    - {lista.descripcion}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
