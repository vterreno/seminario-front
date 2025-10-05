import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'
import { usePermissions } from '@/hooks/use-permissions'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  const { hasPermission } = usePermissions()

  const canAdd = hasPermission('task_agregar')
  const canImport = hasPermission('task_importar')

  return (
    <div className='flex gap-2'>
      {canImport && (
        <Button
          variant='outline'
          className='space-x-1'
          onClick={() => setOpen('import')}
        >
          <span>Import</span> <Download size={18} />
        </Button>
      )}
      {canAdd && (
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Create</span> <Plus size={18} />
        </Button>
      )}
    </div>
  )
}
