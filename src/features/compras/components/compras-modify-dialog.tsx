import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Producto } from '@/features/productos/data/schema'
import apiComprasService from '@/service/apiCompras.service'
import apiProductoProveedorService from '@/service/apiProductoProveedor.service'
import { Loader2, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react'
import { DetallesCompra } from '@/features/nueva-compra/components/detalles-compra'
import { 
  DetalleCompra, 
  TotalesCompra,
  CostoAdicional 
} from '@/features/nueva-compra/types'
import type { Compra } from '../data/schema'

type ComprasModifyDialogProps = {
  currentRow: Compra | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ComprasModifyDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: ComprasModifyDialogProps) {
  const [compraOriginal, setCompraOriginal] = useState<Compra | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  
  const [detalles, setDetalles] = useState<DetalleCompra[]>([])
  const [costosAdicionales, setCostosAdicionales] = useState<CostoAdicional[]>([])
  const [fechaCompra, setFechaCompra] = useState<string>('')
  const [numeroFactura, setNumeroFactura] = useState<string>('')
  const [observaciones, setObservaciones] = useState<string>('')
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Cargar la compra cuando se abre el diálogo
  useEffect(() => {
    const cargarCompra = async () => {
      if (!currentRow?.id || !open) {
        setCompraOriginal(null)
        setDetalles([])
        return
      }

      try {
        setLoading(true)
        const compra = await apiComprasService.getCompraById(currentRow.id)
        
        // Verificar que la compra esté en PENDIENTE_PAGO
        if (compra.estado?.toUpperCase() !== 'PENDIENTE_PAGO') {
          toast.error('Solo se pueden modificar compras en estado PENDIENTE DE PAGO')
          onOpenChange(false)
          return
        }

        setCompraOriginal(compra as Compra)
        
        // Cargar datos de la compra
        setFechaCompra(compra.fecha_compra ? new Date(compra.fecha_compra).toISOString().split('T')[0] : '')
        setNumeroFactura(compra.numero_factura || '')
        setObservaciones(compra.observaciones || '')
        
        // Cargar costos adicionales
        if (compra.costosAdicionales && compra.costosAdicionales.length > 0) {
          const costosCargados: CostoAdicional[] = compra.costosAdicionales.map((c, index) => ({
            id: `${Date.now()}-${index}`,
            concepto: c.concepto,
            monto: typeof c.monto === 'string' ? parseFloat(c.monto) : c.monto,
          }))
          setCostosAdicionales(costosCargados)
        }
        
        // Cargar detalles
        
        // Cargar detalles
        if (compra.detalles && compra.detalles.length > 0) {
          const detallesCargados: DetalleCompra[] = compra.detalles.map((d, index) => {
            let productoData: Producto | undefined;
            if (isNestedProducto(d.producto)) {
              productoData = d.producto.producto;
            } else if (d.producto) {
              productoData = d.producto as Producto;
            }
            return {
              id: `${Date.now()}-${index}`,
              producto: {
                id: productoData?.id,
                nombre: productoData?.nombre || '',
                codigo: productoData?.codigo || '',
              } as Producto,
              cantidad: d.cantidad,
              costo_unitario: typeof d.precio_unitario === 'string' ? parseFloat(d.precio_unitario) : d.precio_unitario,
              iva_porcentaje: 0,
              iva_monto: 0,
              subtotal: typeof d.subtotal === 'string' ? parseFloat(d.subtotal) : d.subtotal,
              total: typeof d.subtotal === 'string' ? parseFloat(d.subtotal) : d.subtotal,
            }
          })
          setDetalles(detallesCargados)
        }

        // Cargar productos del proveedor en lugar de productos de la sucursal
        if (compra.contacto?.id) {
          try {
            const productosProveedorData = await apiProductoProveedorService.getProductosByProveedor(compra.contacto.id)
            const productosDisponibles = productosProveedorData
              .filter(pp => pp.producto?.estado)
              .map(pp => pp.producto!)
            setProductos(productosDisponibles)
          } catch (error) {
            console.error('Error al cargar productos del proveedor:', error)
            toast.warning('No se pudieron cargar los productos del proveedor')
          }
        }
        
      } catch (error: any) {
        console.error('Error al cargar la compra:', error)
        toast.error(error.message || 'Error al cargar la compra')
        onOpenChange(false)
      } finally {
        setLoading(false)
      }
    }

    cargarCompra()
  }, [currentRow?.id, open, onOpenChange])

  const totales = useMemo<TotalesCompra>(() => {
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0)
    const totalIva = detalles.reduce((sum, d) => sum + d.iva_monto, 0)
    const totalCostosAdicionales = costosAdicionales.reduce((sum, c) => sum + c.monto, 0)
    const total = subtotal + totalIva + totalCostosAdicionales
    
    return { subtotal, totalIva, totalCostosAdicionales, total }
  }, [detalles, costosAdicionales])

  const agregarDetalle = (
    producto: Producto, 
    cantidad: number, 
    costoUnitario: number, 
    ivaPorcentaje: number
  ) => {
    const subtotal = cantidad * costoUnitario
    const ivaMonto = subtotal * (ivaPorcentaje / 100)
    const total = subtotal + ivaMonto
    
    const nuevoDetalle: DetalleCompra = {
      id: `${Date.now()}-${Math.random()}`,
      producto,
      cantidad,
      costo_unitario: costoUnitario,
      iva_porcentaje: ivaPorcentaje,
      iva_monto: ivaMonto,
      subtotal,
      total,
    }

    setDetalles([...detalles, nuevoDetalle])
    toast.success('Producto agregado')
  }

  const eliminarDetalle = (id: string) => {
    setDetalles(detalles.filter(d => d.id !== id))
    toast.success('Producto eliminado')
  }

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) return
    
    setDetalles(detalles.map(d => {
      if (d.id === id) {
        const subtotal = cantidad * d.costo_unitario
        const ivaMonto = subtotal * (d.iva_porcentaje / 100)
        const total = subtotal + ivaMonto
        
        return { ...d, cantidad, subtotal, iva_monto: ivaMonto, total }
      }
      return d
    }))
  }

  const actualizarCosto = (id: string, costoUnitario: number) => {
    if (costoUnitario < 0) return
    
    setDetalles(detalles.map(d => {
      if (d.id === id) {
        const subtotal = d.cantidad * costoUnitario
        const ivaMonto = subtotal * (d.iva_porcentaje / 100)
        const total = subtotal + ivaMonto
        
        return { ...d, costo_unitario: costoUnitario, subtotal, iva_monto: ivaMonto, total }
      }
      return d
    }))
  }

  const actualizarIva = (id: string, ivaPorcentaje: number) => {
    setDetalles(detalles.map(d => {
      if (d.id === id) {
        const ivaMonto = d.subtotal * (ivaPorcentaje / 100)
        const total = d.subtotal + ivaMonto
        
        return { ...d, iva_porcentaje: ivaPorcentaje, iva_monto: ivaMonto, total }
      }
      return d
    }))
  }

  const agregarCostoAdicional = () => {
    const nuevoCosto: CostoAdicional = {
      id: `${Date.now()}`,
      concepto: '',
      monto: 0,
    }
    setCostosAdicionales([...costosAdicionales, nuevoCosto])
  }

  const eliminarCostoAdicional = (id: string) => {
    setCostosAdicionales(costosAdicionales.filter(c => c.id !== id))
    toast.success('Costo adicional eliminado')
  }

  const actualizarCostoAdicional = (id: string, campo: 'concepto' | 'monto', valor: string | number) => {
    setCostosAdicionales(costosAdicionales.map(c => {
      if (c.id === id) {
        return { ...c, [campo]: valor }
      }
      return c
    }))
  }

  const guardarCambios = async () => {
    if (!compraOriginal) {
      toast.error('Error: No se pudo cargar la compra')
      return
    }

    if (detalles.length === 0) {
      toast.error('Debe agregar al menos un producto')
      return
    }

    if (!fechaCompra) {
      toast.error('Debe ingresar la fecha de compra')
      return
    }

    try {
      setSubmitting(true)

      // Mapear detalles al formato que espera el backend
      const detallesBackend = detalles.map(d => ({
        compra_id: compraOriginal.id!,
        producto_proveedor_id: d.producto.id!,
        cantidad: d.cantidad,
        precio_unitario: d.costo_unitario,
        iva_porcentaje: d.iva_porcentaje,
        iva_monto: d.iva_monto,
        subtotal: d.subtotal,
      }))

      // Preparar el payload de actualización (solo campos modificables)
      const updatePayload = {
        fecha_compra: fechaCompra,
        monto_total: totales.total,
        detalles: detallesBackend,
        ...(numeroFactura && { numero_factura: numeroFactura }),
        ...(observaciones && { observaciones: observaciones }),
        ...(costosAdicionales.length > 0 && {
          costos_adicionales: costosAdicionales
            .filter(c => c.concepto.trim() && c.monto > 0)
            .map(c => ({
              concepto: c.concepto,
              monto: c.monto,
            }))
        }),
      }
      
      await apiComprasService.updateCompra(compraOriginal.id!, updatePayload)
      
      toast.success('¡Compra actualizada exitosamente!')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al actualizar la compra:', error)
      const errorMessage = error.message || 'Error al actualizar la compra. Por favor intente nuevamente.'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value)
  }

  if (!currentRow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        resizable={true}
        minWidth={600}
        minHeight={400}
        maxWidth={window.innerWidth * 0.95}
        maxHeight={window.innerHeight * 0.95}
        defaultWidth={1200}
        defaultHeight={800}
        className='sm:max-w-7xl'
      >
        <DialogHeader className='text-start'>
          <DialogTitle>Modificar Compra #{compraOriginal?.numero_compra || currentRow.numero_compra}</DialogTitle>
          <DialogDescription>
            Editar los datos de una compra pendiente de pago
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !compraOriginal ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">No se pudieron cargar los datos</div>
          </div>
        ) : (
          <div className="overflow-y-auto py-4 pe-3 space-y-4">
            {/* Información del proveedor y estado de pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información del proveedor (solo lectura) */}
              <Card className="shadow-sm border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h2 className="text-xs font-medium mb-1 text-muted-foreground">Proveedor</h2>
                      <p className="text-base font-semibold">{compraOriginal.contacto?.nombre_razon_social}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        El proveedor no puede ser modificado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estado de pago */}
              <Card className="shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h2 className="text-xs font-medium mb-1 text-muted-foreground">Estado de Pago</h2>
                      <div className="flex items-center gap-2 mt-2">
                        {compraOriginal.pago ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                              <Badge variant="default" className="bg-green-600">
                                PAGADA
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {compraOriginal.pago.metodo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                                {' - '}
                                {new Date(compraOriginal.pago.fecha_pago).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-orange-600" />
                            <div>
                              <Badge variant="outline" className="border-orange-600 text-orange-600">
                                PENDIENTE DE PAGO
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Datos de la compra (editables) */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm">Datos de la compra</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="fecha" className="text-xs">Fecha de compra *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={fechaCompra}
                      onChange={(e) => setFechaCompra(e.target.value)}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="factura" className="text-xs">
                      N° Factura/Remito
                      <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                    </Label>
                    <Input
                      id="factura"
                      type="text"
                      value={numeroFactura}
                      onChange={(e) => setNumeroFactura(e.target.value)}
                      placeholder="Ej: 0001-00001234"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="observaciones" className="text-xs">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Notas adicionales..."
                      rows={1}
                      className="mt-1 resize-none text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de Compra */}
            <DetallesCompra
              productos={productos}
              detalles={detalles}
              onAgregarDetalle={agregarDetalle}
              onEliminarDetalle={eliminarDetalle}
              onActualizarCantidad={actualizarCantidad}
              onActualizarCosto={actualizarCosto}
              onActualizarIva={actualizarIva}
            />

            {/* Costos Adicionales */}
            <Card>
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Costos adicionales</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={agregarCostoAdicional}
                    className="h-7 text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pb-3">
                {costosAdicionales.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No hay costos adicionales agregados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {costosAdicionales.map((costo) => (
                      <div key={costo.id} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            type="text"
                            placeholder="Concepto (ej: Flete)"
                            value={costo.concepto}
                            onChange={(e) => actualizarCostoAdicional(costo.id, 'concepto', e.target.value)}
                            className="h-8 text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="Monto"
                            value={costo.monto || ''}
                            onChange={(e) => actualizarCostoAdicional(costo.id, 'monto', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarCostoAdicional(costo.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen y Acciones */}
            <Card>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Resumen de Totales */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal (sin IVA):</span>
                      <span className="font-medium">{formatCurrency(totales.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IVA Total:</span>
                      <span className="font-medium">{formatCurrency(totales.totalIva)}</span>
                    </div>
                    {totales.totalCostosAdicionales > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Costos adicionales:</span>
                        <span className="font-medium">{formatCurrency(totales.totalCostosAdicionales)}</span>
                      </div>
                    )}
                    <Separator className="my-1.5" />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span className="text-base">{formatCurrency(totales.total)}</span>
                    </div>
                  </div>

                  {/* Total Destacado */}
                  <div>
                    <div className="w-full bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-2 border-blue-600 dark:border-blue-700 h-full flex flex-col justify-center">
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-0.5">Total de la compra</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {formatCurrency(totales.total)}
                      </p>
                      {detalles.length > 0 && (
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                          {detalles.length} {detalles.length === 1 ? 'producto' : 'productos'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={guardarCambios}
                    disabled={submitting || detalles.length === 0}
                    size="sm"
                    className="w-full sm:w-auto sm:min-w-[150px]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
