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
import { Compra } from '../data/schema'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState } from 'react'
import apiComprasService from '@/service/apiCompras.service'
import { toast } from 'sonner'

type ComprasViewDialogProps = {
  currentRow: Compra | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper para convertir valores a número y formatear
const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === null || value === undefined) return '0.00'
  const numValue = typeof value === 'number' ? value : parseFloat(value as string)
  return isNaN(numValue) ? '0.00' : numValue.toFixed(2)
}

export function ComprasViewDialog({
  currentRow,
  open,
  onOpenChange,
}: ComprasViewDialogProps) {
  const [compra, setCompra] = useState<Compra | null>(null)
  const [loading, setLoading] = useState(false)

  const estadosMap: Record<string, string> = {
    pendiente_pago: 'Pendiente de pago',
    pagada: 'Pagada',
    cancelada: 'Cancelada',
  }

  // Cargar los datos de la compra cuando se abre el diálogo
  useEffect(() => {
    const fetchCompra = async () => {
      if (!currentRow?.id || !open) {
        setCompra(null)
        return
      }

      try {
        setLoading(true)
        const data = await apiComprasService.getCompraById(currentRow.id)
        setCompra(data as Compra)
      } catch (error: any) {
        console.error('Error fetching compra:', error)
        toast.error(error.message || 'Error al cargar los detalles de la compra')
        onOpenChange(false)
      } finally {
        setLoading(false)
      }
    }

    fetchCompra()
  }, [currentRow?.id, open])

  if (!currentRow) return null

  const fechaCompra = compra?.fecha_compra instanceof Date 
    ? compra.fecha_compra 
    : compra?.fecha_compra ? new Date(compra.fecha_compra) : new Date()

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
          <DialogTitle>Detalles de la compra</DialogTitle>
          <DialogDescription>
            Información completa de la compra #{compra?.numero_compra || currentRow.numero_compra}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Cargando detalles...</div>
          </div>
        ) : !compra ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">No se pudieron cargar los detalles</div>
          </div>
        ) : (
          <div className="overflow-y-auto py-4 pe-3 space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número de compra</p>
              <p className="text-lg font-semibold">{compra.numero_compra}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de compra</p>
              <p className="text-lg">{format(fechaCompra, "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Proveedor</p>
              <p className="text-lg">
                {compra.contacto?.nombre_razon_social || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sucursal</p>
              <p className="text-lg">{compra.sucursal?.nombre || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <Badge variant={compra.estado === 'pagada' ? 'default' : compra.estado === 'cancelada' ? 'destructive' : 'secondary'} className="mt-1">
                {estadosMap[compra.estado] || compra.estado}
              </Badge>
            </div>
            {compra.numero_factura && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de factura</p>
                <p className="text-lg">{compra.numero_factura}</p>
              </div>
            )}
          </div>

          {compra.observaciones && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
              <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{compra.observaciones}</p>
            </div>
          )}

          {/* Detalles de la compra */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Detalles de la compra</h3>
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
                  {compra.detalles && compra.detalles.length > 0 ? (
                    compra.detalles.map((detalle, index) => (
                      <TableRow key={detalle.id || index}>
                        <TableCell>
                          {detalle.producto?.producto?.nombre || `Producto ID: ${detalle.producto_id}`}
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
              <span className="font-medium">{compra.detalles?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-semibold">Monto total:</span>
              <span className="text-2xl font-bold">${formatCurrency(compra.monto_total)}</span>
            </div>
          </div>

          {/* Metadatos */}
          {(compra.created_at || compra.updated_at) && (
            <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
              {compra.created_at && (
                <p>
                  Creada: {format(new Date(compra.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              )}
              {compra.updated_at && (
                <p>
                  Última actualización: {format(new Date(compra.updated_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
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
