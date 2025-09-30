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
import { type Categoria } from '../data/schema'
import apiCategoriasService from '@/service/apiCategorias.service'

type CategoriasMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

export function CategoriasMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: CategoriasMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCategorias = selectedRows.map((row) => row.original as Categoria)

  const handleDelete = async () => {
    try {
      const categoriaIds = selectedCategorias.map(categoria => categoria.id!).filter(id => id !== undefined)
      
      // Eliminar categorías una por una ya que no existe un método de eliminación masiva
      await Promise.all(categoriaIds.map(id => apiCategoriasService.deleteCategoria(id)))
      
      table.resetRowSelection()
      onOpenChange(false)
      toast.success(`${selectedCategorias.length} categoría${selectedCategorias.length > 1 ? 's' : ''} eliminada${selectedCategorias.length > 1 ? 's' : ''} exitosamente`)
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting categorias:', error)
      toast.error('Error al eliminar las categorías')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminarán{' '}
            <span className='font-medium'>{selectedCategorias.length}</span>{' '}
            categoría{selectedCategorias.length > 1 ? 's' : ''} permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[200px] overflow-auto'>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            {selectedCategorias.map((categoria) => (
              <li key={categoria.id}>{categoria.nombre}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Eliminar {selectedCategorias.length} categoría{selectedCategorias.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
