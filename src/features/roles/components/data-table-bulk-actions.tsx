import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Role } from '../data/schema'
import { RolesMultiDeleteDialog } from './roles-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  onSuccess?: () => void
}

export function DataTableBulkActions<TData>({
  table,
  onSuccess,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    const selectedRoles = selectedRows.map((row) => row.original as Role)
    try {
      // Aquí iría la llamada al servicio de roles
      console.log(`${status === 'active' ? 'Activando' : 'Desactivando'} roles:`, selectedRoles)
      
      table.resetRowSelection()
      toast.success(`${status === 'active' ? 'Activados' : 'Desactivados'} ${selectedRoles.length} rol${selectedRoles.length > 1 ? 'es' : ''}`)
      onSuccess?.()
    } catch (error) {
      console.error('Error updating roles:', error)
      toast.error(`Error al ${status === 'active' ? 'activar' : 'desactivar'} roles`)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='rol' entityNamePlural='roles' isFeminine={false}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label='Activar roles seleccionados'
              title='Activar roles seleccionados'
            >
              <Shield />
              <span className='sr-only'>Activar roles seleccionados</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activar roles seleccionados</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label='Desactivar roles seleccionados'
              title='Desactivar roles seleccionados'
            >
              <ShieldOff />
              <span className='sr-only'>Desactivar roles seleccionados</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Desactivar roles seleccionados</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Eliminar roles seleccionados'
              title='Eliminar roles seleccionados'
            >
              <Trash2 />
              <span className='sr-only'>Eliminar roles seleccionados</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar roles seleccionados</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <RolesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
      />
    </>
  )
}
