import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useEmpresa } from './empresa-provider'
import { usePermissions } from '@/hooks/use-permissions'

export function EmpresaPrimaryButtons() {
  const { setOpen } = useEmpresa()
  const { hasPermission } = usePermissions()

  const canAdd = hasPermission('empresa_agregar')

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
        Agregar empresa
      </Button>
    </div>
  )
}
