import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCategorias } from './categorias-provider'
import { usePermissions } from '@/hooks/use-permissions'

export function CategoriasPrimaryButtons() {
  const { setOpen } = useCategorias()
  const { hasPermission } = usePermissions()

  const canAdd = hasPermission('categoria_agregar')

  if (!canAdd) {
    return null
  }

  return (
    <div className='flex items-center space-x-2'>
      <Button
        onClick={() => setOpen('add')}
        size='sm'
        className='h-8'
      >
        <Plus className='mr-2 h-4 w-4' />
        Agregar categoría
      </Button>
    </div>
  )
}
