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
import { Venta, VentaFormSchema, type VentaForm, type DetalleVenta } from '../data/schema'
import { toast } from 'sonner'
import apiVentasService from '@/service/apiVentas.service'

type VentasActionDialogProps = {
  currentRow?: Venta
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function VentasActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: VentasActionDialogProps) {
  const isEdit = !!currentRow
  const [loading, setLoading] = useState(false)

  const form = useForm<VentaForm>({
    resolver: zodResolver(VentaFormSchema),
    defaultValues: isEdit && currentRow
      ? {
          numero_venta: currentRow.numero_venta,
          fecha_venta: currentRow.fecha_venta instanceof Date 
            ? currentRow.fecha_venta.toISOString().split('T')[0]
            : typeof currentRow.fecha_venta === 'string' 
              ? new Date(currentRow.fecha_venta).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
          contacto_id: currentRow.contacto_id || undefined,
          sucursal_id: currentRow.sucursal_id,
          monto_total: typeof currentRow.monto_total === 'number' 
            ? currentRow.monto_total 
            : parseFloat(currentRow.monto_total as any) || 0,
          detalles: (currentRow.detalles || []).map((d: DetalleVenta) => ({
            producto_id: d.producto_id,
            cantidad: d.cantidad,
            precio_unitario: typeof d.precio_unitario === 'number' 
              ? d.precio_unitario 
              : parseFloat(d.precio_unitario as any) || 0,
            subtotal: typeof d.subtotal === 'number' 
              ? d.subtotal 
              : parseFloat(d.subtotal as any) || 0,
          })),
          pago: {
            fecha_pago: currentRow.pago?.fecha_pago 
              ? (typeof currentRow.pago.fecha_pago === 'string'
                  ? currentRow.pago.fecha_pago.split('T')[0]
                  : new Date(currentRow.pago.fecha_pago).toISOString().split('T')[0])
              : new Date().toISOString().split('T')[0],
            metodo_pago: currentRow.pago?.metodo_pago || 'efectivo',
            monto_pago: typeof currentRow.pago?.monto_pago === 'number' 
              ? currentRow.pago.monto_pago 
              : parseFloat(currentRow.pago?.monto_pago as any) || 0,
          },
        }
      : {
          numero_venta: 0,
          fecha_venta: new Date().toISOString().split('T')[0],
          contacto_id: undefined,
          sucursal_id: 0,
          monto_total: 0,
          detalles: [],
          pago: {
            fecha_pago: new Date().toISOString().split('T')[0],
            metodo_pago: 'efectivo' as const,
            monto_pago: 0,
          },
        },
  })

  const onSubmit = async (values: VentaForm) => {
    try {
      setLoading(true)
      if (isEdit && currentRow?.id) {
        await apiVentasService.updateVenta(currentRow.id, values)
        toast.success('Venta actualizada exitosamente')
      } else {
        await apiVentasService.createVenta(values)
        toast.success('Venta creada exitosamente')
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la venta')
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
            {isEdit ? 'Editar venta' : 'Crear nueva venta'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la venta.'
              : 'Completa los siguientes campos para crear una nueva venta.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-5 overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form id='venta-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4 px-0.5'>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name='numero_venta'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de venta</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder='Ingrese el número de venta' 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          autoComplete='off'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='fecha_venta'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de venta</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={typeof field.value === 'string' ? field.value : ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contacto_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Contacto</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder='Ingrese el ID del contacto'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='sucursal_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Sucursal</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder='Ingrese el ID de la sucursal'
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='monto_total'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto total</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder='Ingrese el monto total'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='pago.metodo_pago'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de pago</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Seleccione un método de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="efectivo">Efectivo</SelectItem>
                            <SelectItem value="transferencia">Transferencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='pago.fecha_pago'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de pago</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={typeof field.value === 'string' ? field.value : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='pago.monto_pago'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto del pago</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder='Ingrese el monto del pago'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button 
            type='submit'
            form='venta-form'
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')} venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
