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
import apiContactosService, { type Contacto } from '@/service/apiContactos.service'
import { ContactoMultiDeleteDialog } from './contacto-multi-delete-dialog'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  tipo: 'cliente' | 'proveedor'
  onSuccess?: () => void
}

export function ContactosBulkActions<TData>({ 
  table, 
  tipo, 
  onSuccess
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { hasPermission } = usePermissions()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const canModify = hasPermission(`${tipo}_modificar`)
  const canDelete = hasPermission(`${tipo}_eliminar`)

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    const selectedContactos = selectedRows.map((row) => row.original as Contacto)
    const contactoIds = selectedContactos.map(contacto => contacto.id!)
    const newStatus = status === 'active'

    try {
      let response
      if (tipo === 'cliente') {
        response = await apiContactosService.bulkEstadoClientes(contactoIds, newStatus)
      } else {
        response = await apiContactosService.bulkEstadoProveedores(contactoIds, newStatus)
      }
      
      // Si hay un mensaje específico del backend, mostrarlo
      if (response?.message) {
        if (response.message.includes('consumidor') && response.message.includes('no se pudo')) {
          toast.warning(response.message)
        } else {
          toast.success(response.message)
        }
      } else {
        toast.success(`Contactos ${newStatus ? 'activados' : 'desactivados'} correctamente`)
      }
      
      table.resetRowSelection()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error updating contactos status:', error)
      toast.error(error.response?.data?.message || `Error al ${newStatus ? 'activar' : 'desactivar'} contactos`)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName={tipo === 'cliente' ? 'cliente' : 'proveedor'} entityNamePlural={tipo === 'cliente' ? 'clientes' : 'proveedores'} isFeminine={false}>
        {canModify && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkStatusChange('active')}
                className='size-8'
                aria-label={`Activar ${tipo === 'cliente' ? 'cliente' : 'proveedore'} s seleccionados`}
                title={`Activar ${tipo}s seleccionados`}
              >
                <UserCheck />
                <span className='sr-only'>Activar {tipo === 'cliente' ? 'cliente' : 'proveedore'} s seleccionados</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Activar {tipo === 'cliente' ? 'clientes' : 'proveedores'} seleccionados</p>
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
                aria-label={`Desactivar ${tipo}s seleccionados`}
                title={`Desactivar ${tipo}s seleccionados`}
              >
                <UserX />
                <span className='sr-only'>Desactivar {tipo === 'cliente' ? 'clientes' : 'proveedores'} seleccionados</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Desactivar {tipo === 'cliente' ? 'clientes' : 'proveedores'} seleccionados</p>
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
                aria-label={`Eliminar ${tipo}s seleccionados`}
                title={`Eliminar ${tipo}s seleccionados`}
              >
                <Trash2 />
                <span className='sr-only'>Eliminar {tipo === 'cliente' ? 'clientes' : 'proveedores'} seleccionados</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar {tipo === 'cliente' ? 'clientes' : 'proveedores'} seleccionados</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      <ContactoMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onSuccess}
        tipo={tipo }
      />
    </>
  )
}


