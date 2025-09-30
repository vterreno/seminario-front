import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useUnidadMedida } from './unidad-medida-provider'

export function UnidadMedidaPrimaryButtons() {
  const { setOpen } = useUnidadMedida()

  // Removido: Verificación de permisos - accesible para todos

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