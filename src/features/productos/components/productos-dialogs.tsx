import { ProductosActionDialog } from './productos-action-dialog'
import { ProductosDeleteDialog } from './productos-delete-dialog'
import { useProductos } from './productos-provider'

type ProductosDialogsProps = {
    onSuccess?: () => void
}

export function ProductosDialogs({ onSuccess }: ProductosDialogsProps) {
    const { open, setOpen, currentRow, setCurrentRow } = useProductos()
    
    return (
        <>
        <ProductosActionDialog
            key='productos-add'
            open={open === 'add'}
            onOpenChange={(state) => setOpen(state ? 'add' : null)}
            onSuccess={onSuccess}
        />

        {currentRow && (
            <>
            <ProductosActionDialog
                key={`productos-edit-${currentRow.id}`}
                open={open === 'edit'}
                onOpenChange={(state) => {
                if (!state) {
                    setOpen(null)
                    setTimeout(() => {
                    setCurrentRow(null)
                    }, 500)
                }
                }}
                currentRow={currentRow}
                onSuccess={onSuccess}
            />

            <ProductosDeleteDialog
                key={`productos-delete-${currentRow.id}`}
                open={open === 'delete'}
                onOpenChange={(state: boolean) => {
                if (!state) {
                    setOpen(null)
                    setTimeout(() => {
                    setCurrentRow(null)
                    }, 500)
                }
                }}
                currentRow={currentRow}
                onSuccess={onSuccess}
            />
            </>
        )}
        </>
    )
}
