import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Venta } from '../data/schema'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState } from 'react'
import apiVentasService from '@/service/apiVentas.service'
import { toast } from 'sonner'

type VentasViewDialogProps = {
  currentRow: Venta | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper para convertir valores a número y formatear
const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === null || value === undefined) return '0.00'
  const numValue = typeof value === 'number' ? value : parseFloat(value as string)
  return isNaN(numValue) ? '0.00' : numValue.toFixed(2)
}

export function VentasViewDialog({
  currentRow,
  open,
  onOpenChange,
}: VentasViewDialogProps) {
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(false)

  const metodosMap: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
  }

  // Cargar los datos de la venta cuando se abre el diálogo
  useEffect(() => {
    const fetchVenta = async () => {
      if (!currentRow?.id || !open) {
        setVenta(null)
        return
      }

      try {
        setLoading(true)
        const data = await apiVentasService.getVentaById(currentRow.id)
        setVenta(data)
      } catch (error: any) {
        console.error('Error fetching venta:', error)
        toast.error(error.message || 'Error al cargar los detalles de la venta')
        onOpenChange(false)
      } finally {
        setLoading(false)
      }
    }

    fetchVenta()
  }, [currentRow?.id, open])

  if (!currentRow) return null

  const fechaVenta = venta?.fecha_venta instanceof Date 
    ? venta.fecha_venta 
    : venta?.fecha_venta ? new Date(venta.fecha_venta) : new Date()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        resizable={true}
        minWidth={400}
        minHeight={300}
        maxWidth={window.innerWidth * 0.9}
        maxHeight={window.innerHeight * 0.9}
        defaultWidth={800}
        defaultHeight={600}
        className='sm:max-w-4xl'
      >
        <DialogHeader className='text-start'>
          <DialogTitle>Detalles de la venta</DialogTitle>
          <DialogDescription>
            Información completa de la venta #{venta?.numero_venta || currentRow.numero_venta}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Cargando detalles...</div>
          </div>
        ) : !venta ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">No se pudieron cargar los detalles</div>
          </div>
        ) : (
          <div className="overflow-y-auto py-4 pe-3 space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número de venta</p>
              <p className="text-lg font-semibold">{venta.numero_venta}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de venta</p>
              <p className="text-lg">{format(fechaVenta, "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <p className="text-lg">{venta.contacto?.nombre_razon_social || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sucursal</p>
              <p className="text-lg">{venta.sucursal?.nombre || '-'}</p>
            </div>
          </div>

          {/* Detalles de la venta */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Detalles de la venta</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venta.detalles && venta.detalles.length > 0 ? (
                    venta.detalles.map((detalle, index) => (
                      <TableRow key={detalle.id || index}>
                        <TableCell>
                          {detalle.producto?.nombre || `Producto ID: ${detalle.producto_id}`}
                        </TableCell>
                        <TableCell className="text-right">{detalle.cantidad}</TableCell>
                        <TableCell className="text-right">${formatCurrency(detalle.precio_unitario)}</TableCell>
                        <TableCell className="text-right font-medium">${formatCurrency(detalle.subtotal)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No hay detalles disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total de items:</span>
              <span className="font-medium">{venta.detalles?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-semibold">Monto total:</span>
              <span className="text-2xl font-bold">${formatCurrency(venta.monto_total)}</span>
            </div>
          </div>

          {/* Información de pago */}
          {venta.pago && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Información de pago</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Método de pago</p>
                  <Badge variant='outline' className="mt-1">
                    {metodosMap[venta.pago.metodo_pago] || venta.pago.metodo_pago}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monto pagado</p>
                  <p className="text-lg font-semibold">${formatCurrency(venta.pago.monto_pago)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadatos */}
          {(venta.created_at || venta.updated_at) && (
            <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
              {venta.created_at && (
                <p>
                  Creada: {format(new Date(venta.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              )}
              {venta.updated_at && (
                <p>
                  Última actualización: {format(new Date(venta.updated_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              )}
            </div>
          )}
        </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
