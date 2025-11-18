import { ComprasActionDialog } from './compras-action-dialog'
import { ComprasDeleteDialog } from './compras-delete-dialog'
import { ComprasViewDialog } from './compras-view-dialog'
import { ComprasPayDialog } from './compras-pay-dialog'
import { ComprasModifyDialog } from './compras-modify-dialog'
import { useCompras } from './compras-provider'

type ComprasDialogsProps = {
  onSuccess?: () => void
}

export function ComprasDialogs({ onSuccess }: ComprasDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useCompras()
  
  return (
    <>
      <ComprasViewDialog
        key='compras-view'
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

      {/* Diálogo de crear nueva compra deshabilitado */}
      {/* <ComprasActionDialog
        key='compras-add'
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
        onSuccess={onSuccess}
      /> */}

      {currentRow && (
        <>
          <ComprasActionDialog
            key={`compras-edit-${currentRow.id}`}
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

          <ComprasDeleteDialog
            key={`compras-delete-${currentRow.id}`}
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

          <ComprasPayDialog
            key={`compras-pay-${currentRow.id}`}
            open={open === 'pay'}
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

          <ComprasModifyDialog
            key={`compras-modify-${currentRow.id}`}
            open={open === 'modify'}
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
