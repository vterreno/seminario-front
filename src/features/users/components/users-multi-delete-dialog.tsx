'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import apiUsersService from '@/service/apiUser.service'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

const CONFIRM_WORD = 'ELIMINAR'

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: UserMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Escriba "${CONFIRM_WORD}" para confirmar.`)
      return
    }

    const selectedUsers = selectedRows.map((row) => row.original as any)
    const userIds = selectedUsers.map((user: any) => user.id)

    try {
      await apiUsersService.deleteUsers(userIds)
      toast.success(`${selectedUsers.length} usuario${selectedUsers.length > 1 ? 's' : ''} eliminado${selectedUsers.length > 1 ? 's' : ''} correctamente`)
      table.resetRowSelection()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error deleting users:', error)
      toast.error(error.message || 'Error al eliminar usuarios')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Eliminar {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'usuarios' : 'usuario'}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            ¿Está seguro de que desea eliminar los usuarios seleccionados? <br />
            Esta acción no se puede deshacer.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>Confirme escribiendo "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Escriba "${CONFIRM_WORD}" para confirmar.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>¡Advertencia!</AlertTitle>
            <AlertDescription>
              Por favor tenga cuidado, esta operación no se puede deshacer.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Eliminar'
      destructive
    />
  )
}
