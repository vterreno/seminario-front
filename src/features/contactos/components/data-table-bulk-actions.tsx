import { useState } from 'react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableBulkActions } from '@/components/data-table'
import apiContactosService, { Contacto } from '@/service/apiContactos.service'
import { ContactoMultiDeleteDialog } from './contacto-multi-delete-dialog'
import { toast } from 'sonner'

export function ContactosBulkActions({ 
  table, 
  tipo, 
  onSuccess, 
  canModify = true, 
  canDelete = true 
}: { 
  table: Table<Contacto>, 
  tipo: 'cliente' | 'proveedor', 
  onSuccess: () => void,
  canModify?: boolean,
  canDelete?: boolean
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const handleEstado = async (estado: boolean) => {
    const ids = table.getFilteredSelectedRowModel().rows.map(r => r.original.id!)
    try {
      if (tipo === 'cliente') {
        await apiContactosService.bulkEstadoClientes(ids, estado)
      } else {
        await apiContactosService.bulkEstadoProveedores(ids, estado)
      }
      toast.success('Estados actualizados')
      table.resetRowSelection()
      onSuccess()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'No se pudo actualizar')
    }
  }

  // Verificar si hay contactos consumidor final seleccionados
  const selectedContactos = table.getFilteredSelectedRowModel().rows.map(r => r.original)
  const hasConsumidorFinal = selectedContactos.some(c => c.es_consumidor_final)
  
  return (
    <>
      <DataTableBulkActions table={table} entityName={tipo === 'cliente' ? 'cliente' : 'proveedor'} isFeminine>
        {canModify && (
          <>
            <Button size='sm' variant='secondary' onClick={() => handleEstado(true)}>Activar</Button>
            <Button size='sm' variant='outline' onClick={() => handleEstado(false)}>Inactivar</Button>
          </>
        )}
        {canDelete && (
          <Button 
            size='sm' 
            variant='destructive' 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={hasConsumidorFinal}
            title={hasConsumidorFinal ? 'No se pueden eliminar contactos consumidor final' : 'Eliminar contactos seleccionados'}
          >
            Eliminar
          </Button>
        )}
      </DataTableBulkActions>
      
      {canDelete && (
        <ContactoMultiDeleteDialog
          table={table}
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onSuccess={onSuccess}
          tipo={tipo}
        />
      )}
    </>
  )
}


