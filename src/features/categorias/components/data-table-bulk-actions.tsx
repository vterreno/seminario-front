import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Shield, ShieldOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Categoria } from '../data/schema'
import { CategoriasMultiDeleteDialog } from './categorias-multi-delete-dialog'
import { usePermissions } from '@/hooks/use-permissions'
import apiCategoriasService from '@/service/apiCategorias.service'
import { toast } from 'sonner'

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

  const selectedCategorias = selectedRows.map((row) => row.original as Categoria)

  const canModify = hasPermission('categoria_modificar')
  const canDelete = hasPermission('categoria_eliminar')

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    const categoriaIds = selectedCategorias.map(categoria => categoria.id!).filter(id => id !== undefined)
    
    try {
      await apiCategoriasService.bulkUpdateCategoriaStatus(categoriaIds, status === 'active')

      table.resetRowSelection()
      toast.success(`${status === 'active' ? 'Activadas' : 'Desactivadas'} ${selectedCategorias.length} categoría${selectedCategorias.length > 1 ? 's' : ''}`)
      onSuccess?.()
    } catch (error: unknown) {
      // El servicio ya extrae el mensaje del backend y lo pone en error.message
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(`Error al ${status === 'active' ? 'activar' : 'desactivar'} categorías`)
      }
    }
  }
  return (
    <>
      <BulkActionsToolbar table={table} entityName='categoría' entityNamePlural='categorías' isFeminine={true}>
        {canModify && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkStatusChange('active')}
                className='size-8'
                aria-label='Activar categorias seleccionados'
                title='Activar categorias seleccionados'
              >
                <Shield />
                <span className='sr-only'>Activar categorias seleccionados</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Activar categorias seleccionados</p>
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
                aria-label='Desactivar categorias seleccionados'
                title='Desactivar categorias seleccionados'
              >
                <ShieldOff />
                <span className='sr-only'>Desactivar categorias seleccionados</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Desactivar categorias seleccionados</p>
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
                aria-label='Eliminar categorías seleccionadas'
                title='Eliminar categorías seleccionadas'
              >
                <Trash2 />
                <span className='sr-only'>Eliminar categorías seleccionadas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar categorías seleccionadas</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      <CategoriasMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
      />
    </>
  )
}
