import { SucursalesActionDialog } from './sucursales-action-dialog'
import { SucursalesDeleteDialog } from './sucursales-delete-dialog'
import { useSucursales } from './sucursales-provider'

type SucursalesDialogsProps = {
  onSuccess?: () => void
}

export function SucursalesDialogs({ onSuccess }: SucursalesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useSucursales()
  
  return (
    <>
      <SucursalesActionDialog
        key='sucursales-add'
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
        onSuccess={onSuccess}
      />

      {currentRow && (
        <>
          <SucursalesActionDialog
            key={`sucursales-edit-${currentRow.id}`}
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

          <SucursalesDeleteDialog
            key={`sucursales-delete-${currentRow.id}`}
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
