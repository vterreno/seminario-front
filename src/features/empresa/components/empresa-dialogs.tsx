import { EmpresaActionDialog } from './empresa-action-dialog'
import { EmpresaDeleteDialog } from './empresa-delete-dialog'
import { useEmpresa } from './empresa-provider'

type EmpresaDialogsProps = {
  onSuccess?: () => void
}

export function EmpresaDialogs({ onSuccess }: EmpresaDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useEmpresa()
  
  return (
    <>
      <EmpresaActionDialog
        key='empresa-add'
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
        onSuccess={onSuccess}
      />

      {currentRow && (
        <>
          <EmpresaActionDialog
            key={`empresa-edit-${currentRow.id}`}
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

          <EmpresaDeleteDialog
            key={`empresa-delete-${currentRow.id}`}
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
