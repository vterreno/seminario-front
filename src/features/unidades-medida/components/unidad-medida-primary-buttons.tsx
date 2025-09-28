import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useUnidadMedida } from './unidad-medida-provider'
import { usePermissions } from '@/hooks/use-permissions'

export function UnidadMedidaPrimaryButtons() {
  const { setOpen } = useUnidadMedida()
  const { hasPermission } = usePermissions()

  const canAdd = hasPermission('unidad_medida_agregar')

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
        Agregar unidad de medida
      </Button>
    </div>
  )
}