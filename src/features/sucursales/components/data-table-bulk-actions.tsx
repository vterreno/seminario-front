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
import { type Sucursal } from '../data/schema'
import { SucursalesMultiDeleteDialog } from './sucursales-multi-delete-dialog'
import apiSucursalesService from '@/service/apiSucursales.service'
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

  const canModify = hasPermission('sucursal_modificar')
  const canDelete = hasPermission('sucursal_eliminar')

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    const selectedSucursales = selectedRows.map((row) => row.original as Sucursal)
    const ids = selectedSucursales.map(s => s.id!).filter(Boolean)
    
    try {
      await apiSucursalesService.updateSucursalesStatus(ids, status === 'active')
      
      table.resetRowSelection()
      toast.success(`${status === 'active' ? 'Activadas' : 'Desactivadas'} ${selectedSucursales.length} sucursal${selectedSucursales.length > 1 ? 'es' : ''}`)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || `Error al ${status === 'active' ? 'activar' : 'desactivar'} sucursales`)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='sucursal' entityNamePlural='sucursales' isFeminine={true}>
        {canModify && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkStatusChange('active')}
                className='size-8'
                aria-label='Activar sucursales seleccionadas'
                title='Activar sucursales seleccionadas'
              >
                <Shield />
                <span className='sr-only'>Activar sucursales seleccionadas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Activar sucursales seleccionadas</p>
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
                aria-label='Desactivar sucursales seleccionadas'
                title='Desactivar sucursales seleccionadas'
              >
                <ShieldOff />
                <span className='sr-only'>Desactivar sucursales seleccionadas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Desactivar sucursales seleccionadas</p>
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
                aria-label='Eliminar sucursales seleccionadas'
                title='Eliminar sucursales seleccionadas'
              >
                <Trash2 />
                <span className='sr-only'>Eliminar sucursales seleccionadas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar sucursales seleccionadas</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      <SucursalesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
      />
    </>
  )
}
