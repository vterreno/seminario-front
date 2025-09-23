import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'
import { usePermissions } from '@/hooks/use-permissions'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  const { hasPermission } = usePermissions()

  // Si no tiene permisos para agregar usuarios, no mostrar el botón
  if (!hasPermission('usuario_agregar')) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Agregar usuario</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
