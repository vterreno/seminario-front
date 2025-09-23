import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { type Contacto } from '@/service/apiContactos.service'
import apiContactosService from '@/service/apiContactos.service'

type ContactoMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
  tipo: 'cliente' | 'proveedor'
}

export function ContactoMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
  tipo,
}: ContactoMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedContactos = selectedRows.map((row) => row.original as Contacto)
  
  // Filtrar contactos que no sean consumidor final
  const contactosEliminables = selectedContactos.filter(c => !c.es_consumidor_final)

  const handleDelete = async () => {
    try {
      const deletePromises = contactosEliminables.map((contacto) => {
        if (tipo === 'cliente') {
          return apiContactosService.deleteCliente(contacto.id!)
        } else {
          return apiContactosService.deleteProveedor(contacto.id!)
        }
      })
      
      await Promise.all(deletePromises)
      
      table.resetRowSelection()
      onOpenChange(false)
      
      const consumidoresBloqueados = selectedContactos.length - contactosEliminables.length
      if (consumidoresBloqueados > 0) {
        toast.warning(`${contactosEliminables.length} contacto${contactosEliminables.length > 1 ? 's' : ''} eliminado${contactosEliminables.length > 1 ? 's' : ''}. ${consumidoresBloqueados} consumidor${consumidoresBloqueados > 1 ? 'es' : ''} final${consumidoresBloqueados > 1 ? 'es' : ''} no se pudo${consumidoresBloqueados > 1 ? 'ieron' : ''} eliminar.`)
      } else {
        toast.success(`${contactosEliminables.length} ${tipo}${contactosEliminables.length > 1 ? 's' : ''} eliminado${contactosEliminables.length > 1 ? 's' : ''} exitosamente`)
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting contactos:', error)
      toast.error('Error al eliminar los contactos')
    }
  }

  if (contactosEliminables.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No se pueden eliminar contactos</DialogTitle>
            <DialogDescription>
              Los contactos seleccionados incluyen consumidores finales que no pueden ser eliminados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Está seguro que desea eliminar {contactosEliminables.length} {tipo}{contactosEliminables.length > 1 ? 's' : ''}?
            {selectedContactos.length > contactosEliminables.length && (
              <span className="block mt-2 text-orange-600">
                Nota: {selectedContactos.length - contactosEliminables.length} consumidor{selectedContactos.length - contactosEliminables.length > 1 ? 'es' : ''} final{selectedContactos.length - contactosEliminables.length > 1 ? 'es' : ''} no será{selectedContactos.length - contactosEliminables.length > 1 ? 'n' : ''} eliminado{selectedContactos.length - contactosEliminables.length > 1 ? 's' : ''}.
              </span>
            )}
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
