import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRoles } from './roles-provider'

export function RolesPrimaryButtons() {
  const { setOpen } = useRoles()

  return (
    <div className='flex items-center space-x-2'>
      <Button
        onClick={() => setOpen('add')}
        size='sm'
        className='h-8'
      >
        <Plus className='mr-2 h-4 w-4' />
        Agregar rol
      </Button>
    </div>
  )
}
