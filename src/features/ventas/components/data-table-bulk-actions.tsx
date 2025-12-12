import { useState, useMemo } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { VentasMultiDeleteDialog } from './ventas-multi-delete-dialog'
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

  const canDelete = useMemo(() => hasPermission('ventas_eliminar'), [hasPermission])

  return (
    <>
      <BulkActionsToolbar table={table} entityName='venta' entityNamePlural='ventas' isFeminine={true}>
        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='Eliminar ventas seleccionadas'
                title='Eliminar ventas seleccionadas'
              >
                <Trash2 />
                <span className='sr-only'>Eliminar ventas seleccionadas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar ventas seleccionadas</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      <VentasMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
      />
    </>
  )
}
