import { CategoriasActionDialog } from './categorias-action-dialog'
import { CategoriasDeleteDialog } from './categorias-delete-dialog'
import { useCategorias } from './categorias-provider'

type CategoriasDialogsProps = {
  onSuccess?: () => void
}

export function CategoriasDialogs({ onSuccess }: CategoriasDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useCategorias()
  
  return (
    <>
      <CategoriasActionDialog
        key='categorias-add'
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
        onSuccess={onSuccess}
      />

      {currentRow && (
        <>
          <CategoriasActionDialog
            key={`categorias-edit-${currentRow.id}`}
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

          <CategoriasDeleteDialog
            key={`categorias-delete-${currentRow.id}`}
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
