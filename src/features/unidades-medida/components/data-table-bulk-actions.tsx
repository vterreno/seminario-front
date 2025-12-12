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
import { UnidadMedidaMultiDeleteDialog } from './unidad-medida-multi-delete-dialog'
import { type UnidadMedida } from '../data/schema'
import apiUnidadesMedidaService from '@/service/apiUnidadesMedida.service'

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
    const selectedUnidades = selectedRows.map((row) => row.original as UnidadMedida)
    const ids = selectedUnidades.map(u => u.id!).filter(Boolean)
    
    try {
      await apiUnidadesMedidaService.bulkUpdateUnidadMedidaStatus(ids, status === 'active')
      
      table.resetRowSelection()
      toast.success(`${status === 'active' ? 'Activadas' : 'Desactivadas'} ${selectedUnidades.length} unidad${selectedUnidades.length > 1 ? 'es' : ''} de medida`)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || `Error al ${status === 'active' ? 'activar' : 'desactivar'} unidades de medida`)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='unidad de medida' entityNamePlural='unidades de medida' isFeminine={true}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label='Activar unidades de medida seleccionadas'
              title='Activar unidades de medida seleccionadas'
            >
              <Shield />
              <span className='sr-only'>Activar unidades de medida seleccionadas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activar unidades de medida seleccionadas</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label='Desactivar unidades de medida seleccionadas'
              title='Desactivar unidades de medida seleccionadas'
            >
              <ShieldOff />
              <span className='sr-only'>Desactivar unidades de medida seleccionadas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Desactivar unidades de medida seleccionadas</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Eliminar unidades de medida seleccionadas'
              title='Eliminar unidades de medida seleccionadas'
            >
              <Trash2 />
              <span className='sr-only'>Eliminar unidades de medida seleccionadas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar unidades de medida seleccionadas</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UnidadMedidaMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
      />
    </>
  )
}