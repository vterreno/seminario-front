import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Compra, CompraFormSchema, type CompraForm, type DetalleCompra } from '../data/schema'
import { toast } from 'sonner'
import apiComprasService from '@/service/apiCompras.service'
import { Textarea } from '@/components/ui/textarea'

type ComprasActionDialogProps = {
  currentRow?: Compra
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ComprasActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: ComprasActionDialogProps) {
  const isEdit = !!currentRow
  const [loading, setLoading] = useState(false)

  const form = useForm<CompraForm>({
    resolver: zodResolver(CompraFormSchema),
    defaultValues: isEdit && currentRow
      ? {
          fecha_compra: currentRow.fecha_compra instanceof Date 
            ? currentRow.fecha_compra.toISOString().split('T')[0]
            : typeof currentRow.fecha_compra === 'string' 
              ? new Date(currentRow.fecha_compra).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
          contacto_id: currentRow.contacto_id || 0,
          sucursal_id: currentRow.sucursal_id || currentRow.sucursal?.id || 0,
          monto_total: typeof currentRow.monto_total === 'number' 
            ? currentRow.monto_total 
            : parseFloat(currentRow.monto_total as any) || 0,
          estado: (currentRow.estado || 'pendiente_pago') as 'pendiente_pago' | 'pagada' | 'cancelada',
          numero_factura: currentRow.numero_factura || undefined,
          observaciones: currentRow.observaciones || undefined,
          detalles: (currentRow.detalles || []).map((d: DetalleCompra) => ({
            producto_id: d.producto_id,
            cantidad: d.cantidad,
            precio_unitario: typeof d.precio_unitario === 'number' 
              ? d.precio_unitario 
              : parseFloat(d.precio_unitario as any) || 0,
            subtotal: typeof d.subtotal === 'number' 
              ? d.subtotal 
              : parseFloat(d.subtotal as any) || 0,
          })),
        }
      : {
          fecha_compra: new Date().toISOString().split('T')[0],
          contacto_id: 0,
          sucursal_id: 0,
          monto_total: 0,
          estado: 'pendiente_pago' as const,
          numero_factura: undefined,
          observaciones: undefined,
          detalles: [],
        },
  })

  const onSubmit = async (values: CompraForm) => {
    try {
      setLoading(true)
      if (isEdit && currentRow?.id) {
        await apiComprasService.updateCompra(currentRow.id, values)
        toast.success('Compra actualizada exitosamente')
      } else {
        await apiComprasService.createCompra(values)
        toast.success('Compra creada exitosamente')
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la compra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent
        resizable={true}
        minWidth={300}
        minHeight={200}
        maxWidth={window.innerWidth * 0.9}
        maxHeight={window.innerHeight * 0.9}
        defaultWidth={512}
        defaultHeight={450} 
        className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Editar compra' : 'Crear nueva compra'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la compra.'
              : 'Completa los siguientes campos para crear una nueva compra.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 overflow-y-auto pe-3'>
            <FormField
              control={form.control}
              name='fecha_compra'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de compra</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecciona un estado' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='pendiente_pago'>Pendiente de pago</SelectItem>
                      <SelectItem value='pagada'>Pagada</SelectItem>
                      <SelectItem value='cancelada'>Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='numero_factura'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de factura (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Ej: FC-001234' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='observaciones'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder='Notas adicionales sobre la compra' rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
