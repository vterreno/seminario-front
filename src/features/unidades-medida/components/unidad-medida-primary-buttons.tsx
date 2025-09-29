import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useUnidadMedida } from './unidad-medida-provider'
// import { usePermissions } from '@/hooks/use-permissions' // TODO: Restaurar cuando se corrijan los permisos

export function UnidadMedidaPrimaryButtons() {
  const { setOpen } = useUnidadMedida()
  // const { hasPermission } = usePermissions() // TODO: Restaurar cuando se corrijan los permisos

  // const canAdd = hasPermission('unidad_medida_agregar') // TODO: Restaurar cuando se corrijan los permisos
  const canAdd = true // Temporal: permitir agregar a todos los usuarios

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