import { VentasActionDialog } from './ventas-action-dialog'
import { VentasDeleteDialog } from './ventas-delete-dialog'
import { VentasViewDialog } from './ventas-view-dialog'
import { useVentas } from './ventas-provider'

type VentasDialogsProps = {
  onSuccess?: () => void
}

export function VentasDialogs({ onSuccess }: VentasDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useVentas()
  
  return (
    <>
      <VentasViewDialog
        key='ventas-view'
        open={open === 'view'}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null)
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }
        }}
        currentRow={currentRow}
      />

      {/* Diálogo de crear nueva venta deshabilitado */}
      {/* <VentasActionDialog
        key='ventas-add'
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
        onSuccess={onSuccess}
      /> */}

      {currentRow && (
        <>
          <VentasActionDialog
            key={`ventas-edit-${currentRow.id}`}
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

          <VentasDeleteDialog
            key={`ventas-delete-${currentRow.id}`}
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
