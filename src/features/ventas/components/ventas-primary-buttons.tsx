import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useVentas } from './ventas-provider'

type VentasPrimaryButtonsProps = {
  canCreate: boolean
}

export function VentasPrimaryButtons({ canCreate }: VentasPrimaryButtonsProps) {
  const { setOpen, setCurrentRow } = useVentas()

  if (!canCreate) {
    return null
  }

  return (
    <div className='flex items-center space-x-2'>
      <Button
        onClick={() => {
          setCurrentRow(null)
          setOpen('add')
        }}
        size='sm'
        className='h-8'
      >
        <Plus className='mr-2 h-4 w-4' />
        Nueva venta
      </Button>
    </div>
  )
}
