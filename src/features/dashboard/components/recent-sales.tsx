import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/utils'
import { DashboardRecentMovement } from '../types'

interface RecentSalesProps {
  items: DashboardRecentMovement[]
  emptyMessage?: string
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
})

const getInitials = (value: string) => {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || 'NA'
}

const formatMovementDate = (value: string) => {
  try {
    return dateFormatter.format(new Date(value))
  } catch (error) {
    return 'Sin fecha'
  }
}

export function RecentSales({ items, emptyMessage = 'Sin movimientos recientes' }: RecentSalesProps) {
  if (!items.length) {
    return <p className='text-sm text-muted-foreground'>{emptyMessage}</p>
  }

  return (
    <div className='space-y-6'>
      {items.map((item) => (
        <div key={`${item.type}-${item.id}`} className='flex items-center gap-4'>
          <Avatar className='h-10 w-10 border bg-muted/60 text-xs font-semibold uppercase'>
            <AvatarFallback>{getInitials(item.entity)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between gap-3'>
            <div className='space-y-1'>
              <p className='text-sm font-medium leading-none'>{item.entity}</p>
              <p className='text-xs text-muted-foreground'>
                {item.reference} · {item.sucursal}
              </p>
            </div>
            <div className='text-right'>
              <p className='font-semibold'>{formatCurrency(item.amount)}</p>
              <p className='text-xs text-muted-foreground'>{formatMovementDate(item.date)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
