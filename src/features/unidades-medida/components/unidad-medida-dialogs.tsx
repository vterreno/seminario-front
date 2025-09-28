import { UnidadMedidaActionDialog } from './unidad-medida-action-dialog'
import { UnidadMedidaDeleteDialog } from './unidad-medida-delete-dialog'
import { useUnidadMedida } from './unidad-medida-provider'

type UnidadMedidaDialogsProps = {
  onSuccess?: () => void
}

export function UnidadMedidaDialogs({ onSuccess }: UnidadMedidaDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useUnidadMedida()
  
  return (
    <>
      <UnidadMedidaActionDialog
        key='unidad-medida-add'
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
        onSuccess={onSuccess}
      />

      {currentRow && (
        <>
          <UnidadMedidaActionDialog
            key={`unidad-medida-edit-${currentRow.id}`}
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

          <UnidadMedidaDeleteDialog
            key={`unidad-medida-delete-${currentRow.id}`}
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