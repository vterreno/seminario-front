import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'
import { Plus } from 'lucide-react'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const { hasPermission } = usePermissions()

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-full',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full w-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
          fixed &&
          'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
        )}
      >
        <SidebarTrigger variant='outline' className='max-md:scale-125' />

        <div className='ml-auto flex items-center gap-3 sm:gap-4'>
          {hasPermission('ventas_agregar') && (
            <Button asChild size='sm' className='hidden sm:flex'>
              <Link to='/ventas/nueva-venta'>
                <Plus className='mr-2 h-4 w-4' />
                Venta rápida
              </Link>
            </Button>
          )}
          {children}
        </div>
      </div>
    </header>
  )
}
