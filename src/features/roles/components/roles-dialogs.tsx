import { RolesActionDialog } from './roles-action-dialog'
import { RolesDeleteDialog } from './roles-delete-dialog'
import { useRoles } from './roles-provider'

type RolesDialogsProps = {
  onSuccess?: () => void
}

export function RolesDialogs({ onSuccess }: RolesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useRoles()
  
  return (
    <>
      <RolesActionDialog
        key='roles-add'
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
        onSuccess={onSuccess}
      />

      {currentRow && (
        <>
          <RolesActionDialog
            key={`roles-edit-${currentRow.id}`}
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

          <RolesDeleteDialog
            key={`roles-delete-${currentRow.id}`}
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
