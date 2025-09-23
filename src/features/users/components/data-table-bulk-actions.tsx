import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type User } from '../data/schema'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'
import apiUsersService from '@/service/apiUser.service'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  onSuccess?: () => void
}

export function DataTableBulkActions<TData>({
  table,
  onSuccess,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { hasPermission } = usePermissions()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const canModify = hasPermission('usuario_modificar')
  const canDelete = hasPermission('usuario_eliminar')

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    const userIds = selectedUsers.map(user => user.id)
    const newStatus = status === 'active'

    try {
      await apiUsersService.updateUsersStatus(userIds, newStatus)
      toast.success(`${selectedUsers.length} usuario${selectedUsers.length > 1 ? 's' : ''} ${newStatus ? 'activado' : 'desactivado'}${selectedUsers.length > 1 ? 's' : ''} correctamente`)
      table.resetRowSelection()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error updating users status:', error)
      toast.error(error.message || `Error al ${newStatus ? 'activar' : 'desactivar'} usuarios`)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='usuario' entityNamePlural='usuarios'>
        {canModify && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkStatusChange('active')}
                className='size-8'
                aria-label='Activar usuarios seleccionados'
                title='Activar usuarios seleccionados'
              >
                <UserCheck />
                <span className='sr-only'>Activar usuarios seleccionados</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Activar usuarios seleccionados</p>
            </TooltipContent>
          </Tooltip>
        )}

        {canModify && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkStatusChange('inactive')}
                className='size-8'
                aria-label='Desactivar usuarios seleccionados'
                title='Desactivar usuarios seleccionados'
              >
                <UserX />
                <span className='sr-only'>Desactivar usuarios seleccionados</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Desactivar usuarios seleccionados</p>
            </TooltipContent>
          </Tooltip>
        )}

        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='Eliminar usuarios seleccionados'
                title='Eliminar usuarios seleccionados'
              >
                <Trash2 />
                <span className='sr-only'>Eliminar usuarios seleccionados</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar usuarios seleccionados</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
      />
    </>
  )
}
