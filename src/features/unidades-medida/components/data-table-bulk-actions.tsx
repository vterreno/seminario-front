import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { UnidadMedidaMultiDeleteDialog } from './unidad-medida-multi-delete-dialog'
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

  const canDelete = hasPermission('unidad_medida_eliminar')

  return (
    <>
      <BulkActionsToolbar table={table} entityName='unidad de medida' entityNamePlural='unidades de medida' isFeminine={true}>
        {canDelete && (
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
        )}
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