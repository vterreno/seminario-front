import { Button } from '@/components/ui/button'

export function MaintenanceError() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>503</h1>
        <span className='font-medium'>El sitio web está en mantenimiento!</span>
        <p className='text-muted-foreground text-center'>
          El sitio web no está disponible en este momento. <br />
          Volveremos en línea pronto.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline'>Más información</Button>
        </div>
      </div>
    </div>
  )
}
