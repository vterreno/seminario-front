import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableBulkActions } from '@/components/data-table'
import apiContactosService, { Contacto } from '@/service/apiContactos.service'
import { toast } from 'sonner'

export function ContactosBulkActions({ table, tipo, onSuccess }: { table: Table<Contacto>, tipo: 'cliente' | 'proveedor', onSuccess: () => void }) {
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
  return (
    <DataTableBulkActions table={table} entityName={tipo === 'cliente' ? 'cliente' : 'proveedor'} isFeminine>
      <Button size='sm' variant='secondary' onClick={() => handleEstado(true)}>Activar</Button>
      <Button size='sm' variant='outline' onClick={() => handleEstado(false)}>Inactivar</Button>
    </DataTableBulkActions>
  )
}


