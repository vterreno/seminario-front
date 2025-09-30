import { ProductosActionDialog } from './productos-action-dialog'
import { ProductosDeleteDialog } from './productos-delete-dialog'
import { ProductosHistorialDialog } from './productos-historial-dialog'
import { ProductosAjusteStockDialog } from './productos-ajuste-stock-dialog'
import { useProductos } from './productos-provider'

type ProductosDialogsProps = {
    onSuccess?: () => void
}

export function ProductosDialogs({ onSuccess }: ProductosDialogsProps) {
    const { open, setOpen, currentRow, setCurrentRow } = useProductos()
    
    // Función para refrescar el historial cuando se realiza un ajuste
    const handleAjusteSuccess = () => {
        onSuccess?.()
        // Cerrar el modal de ajuste y volver al historial
        setOpen('historial')
    }
    
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

            <ProductosHistorialDialog
                key={`productos-historial-${currentRow.id}`}
                open={open === 'historial'}
                onOpenChange={(state: boolean) => {
                if (!state) {
                    setOpen(null)
                    setTimeout(() => {
                    setCurrentRow(null)
                    }, 500)
                }
                }}
                currentRow={currentRow}
            />

            <ProductosAjusteStockDialog
                key={`productos-ajuste-${currentRow.id}`}
                open={open === 'ajuste'}
                onOpenChange={(state: boolean) => {
                if (!state) {
                    setOpen('historial') // Volver al historial cuando se cierra el ajuste
                }
                }}
                currentRow={currentRow}
                onSuccess={handleAjusteSuccess}
            />
            </>
        )}
        </>
    )
}
