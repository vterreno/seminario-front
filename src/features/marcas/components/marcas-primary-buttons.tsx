import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useMarcas } from './marcas-provider'
import { usePermissions } from '@/hooks/use-permissions'

export function MarcasPrimaryButtons() {
    const { setOpen } = useMarcas()
    const { hasPermission } = usePermissions()

    const canAdd = hasPermission('marca_agregar')

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
            Agregar marca
        </Button>
        </div>
    )
}
