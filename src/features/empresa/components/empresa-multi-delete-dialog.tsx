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
import { type Empresa } from '../data/schema'
import apiEmpresaService from '@/service/apiEmpresa.service'

type EmpresaMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

export function EmpresaMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: EmpresaMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedEmpresas = selectedRows.map((row) => row.original as Empresa)

  const handleDelete = async () => {
    try {
      const ids = selectedEmpresas.map((empresa) => empresa.id!).filter(Boolean)
      const response = await apiEmpresaService.deleteEmpresas(ids)
      console.log(response.message)
      if (response.message === "Algunas empresas con sucursales, no se pueden eliminar") {
        toast.error('Algunas empresas con sucursales, no se pueden eliminar')
        return
      }
      if (response.message === "Algunas empresas con usuarios, no se pueden eliminar") {
        toast.error('Algunas empresas con usuarios, no se pueden eliminar')
        return
      }
      table.resetRowSelection()
      onOpenChange(false)
      toast.success(`${selectedEmpresas.length} empresa${selectedEmpresas.length > 1 ? 's' : ''} eliminada${selectedEmpresas.length > 1 ? 's' : ''} exitosamente`)
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting empresas:', error)
      toast.error('Error al eliminar las empresas')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán{' '}
            <span className='font-medium'>{selectedEmpresas.length}</span>{' '}
            empresa{selectedEmpresas.length > 1 ? 's' : ''} permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[200px] overflow-auto'>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            {selectedEmpresas.map((empresa) => (
              <li key={empresa.id}>{empresa.name}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar {selectedEmpresas.length} empresa{selectedEmpresas.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
