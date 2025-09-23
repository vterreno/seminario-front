import { MarcasActionDialog } from './marcas-action-dialog'
import { MarcasDeleteDialog } from './marcas-delete-dialog'
import { useMarcas } from './marcas-provider'

type MarcasDialogsProps = {
    onSuccess?: () => void
}

export function MarcasDialogs({ onSuccess }: MarcasDialogsProps) {
    const { open, setOpen, currentRow, setCurrentRow } = useMarcas()
    
    return (
        <>
        <MarcasActionDialog
            key='marcas-add'
            open={open === 'add'}
            onOpenChange={(state) => setOpen(state ? 'add' : null)}
            onSuccess={onSuccess}
        />

        {currentRow && (
            <>
            <MarcasActionDialog
                key={`marcas-edit-${currentRow.id}`}
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

            <MarcasDeleteDialog
                key={`marcas-delete-${currentRow.id}`}
                open={open === 'delete'}
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
            </>
        )}
        </>
    )
}
