import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Building2, Building } from 'lucide-react'
import { toast } from 'sonner'
import apiEmpresaService from '@/service/apiEmpresa.service'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Empresa } from '../data/schema'
import { EmpresaMultiDeleteDialog } from './empresa-multi-delete-dialog'

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
    const selectedEmpresas = selectedRows.map((row) => row.original as Empresa)
    try {
      const updatePromises = selectedEmpresas.map((empresa) => 
        empresa.id ? apiEmpresaService.updateEmpresaPartial(empresa.id, { estado: status === 'active' }) : Promise.resolve()
      )
      await Promise.all(updatePromises)
      table.resetRowSelection()
      toast.success(`${status === 'active' ? 'Activadas' : 'Desactivadas'} ${selectedEmpresas.length} empresa${selectedEmpresas.length > 1 ? 's' : ''}`)
      onSuccess?.()
    } catch (error) {
      console.error('Error updating empresas:', error)
      toast.error(`Error al ${status === 'active' ? 'activar' : 'desactivar'} empresas`)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='empresa' entityNamePlural='empresas' isFeminine={true}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label='Activar empresas seleccionadas'
              title='Activar empresas seleccionadas'
            >
              <Building2 />
              <span className='sr-only'>Activar empresas seleccionadas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activar empresas seleccionadas</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label='Desactivar empresas seleccionadas'
              title='Desactivar empresas seleccionadas'
            >
              <Building />
              <span className='sr-only'>Desactivar empresas seleccionadas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Desactivar empresas seleccionadas</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Eliminar empresas seleccionadas'
              title='Eliminar empresas seleccionadas'
            >
              <Trash2 />
              <span className='sr-only'>Eliminar empresas seleccionadas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar empresas seleccionadas</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <EmpresaMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
      />
    </>
  )
}
