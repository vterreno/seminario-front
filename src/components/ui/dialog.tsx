'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useResizable } from '@/hooks/use-resizable'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  resizable?: boolean
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  defaultWidth?: number
  defaultHeight?: number
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ 
  className, 
  children, 
  resizable = false,
  minWidth = 300,
  minHeight = 200,
  maxWidth,
  maxHeight,
  defaultWidth = 512,
  defaultHeight = 400,
  ...props 
}, ref) => {
  const { size, handleMouseDown, isResizing } = useResizable({
    minWidth,
    minHeight,
    maxWidth: maxWidth || window.innerWidth * 0.9,
    maxHeight: maxHeight || window.innerHeight * 0.9,
    defaultWidth,
    defaultHeight
  })

  if (!resizable) {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
            className
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className='absolute right-6 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50 bg-background shadow-sm border px-2 py-0'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 flex flex-col translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          isResizing && 'select-none',
          className
        )}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          maxWidth: 'none',
          maxHeight: 'none'
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        {...props}
      >
        {/* Resize handles */}
        {/* Esquinas */}
        <div
          className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize hover:bg-blue-500 hover:opacity-50 transition-colors"
          onMouseDown={handleMouseDown('top-left')}
        />
        <div
          className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize hover:bg-blue-500 hover:opacity-50 transition-colors"
          onMouseDown={handleMouseDown('top-right')}
        />
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 cursor-ne-resize hover:bg-blue-500 hover:opacity-50 transition-colors"
          onMouseDown={handleMouseDown('bottom-left')}
        />
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 cursor-nw-resize hover:bg-blue-500 hover:opacity-50 transition-colors"
          onMouseDown={handleMouseDown('bottom-right')}
        />

        {/* Bordes */}
        <div
          className="absolute -top-1 left-3 right-3 h-2 cursor-ns-resize hover:bg-blue-500 hover:opacity-30 transition-colors"
          onMouseDown={handleMouseDown('top')}
        />
        <div
          className="absolute -bottom-1 left-3 right-3 h-2 cursor-ns-resize hover:bg-blue-500 hover:opacity-30 transition-colors"
          onMouseDown={handleMouseDown('bottom')}
        />
        <div
          className="absolute -left-1 top-3 bottom-3 w-2 cursor-ew-resize hover:bg-blue-500 hover:opacity-30 transition-colors"
          onMouseDown={handleMouseDown('left')}
        />
        <div
          className="absolute -right-1 top-3 bottom-3 w-2 cursor-ew-resize hover:bg-blue-500 hover:opacity-30 transition-colors"
          onMouseDown={handleMouseDown('right')}
        />

        {/* Contenido del dialog */}
        <div className="flex-1 overflow-auto p-6 pt-6">
          {children}
        </div>

        {/* Botón de cerrar */}
        <DialogPrimitive.Close className='absolute right-6 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50 bg-background shadow-sm border px-2 py-0'>
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
