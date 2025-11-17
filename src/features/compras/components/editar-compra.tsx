import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Empresa } from '@/service/apiEmpresa.service'
import { Sucursal } from '@/features/sucursales/data/schema'
import { Contacto } from '@/service/apiContactos.service'
import { Producto } from '@/features/productos/data/schema'
import apiEmpresaService from '@/service/apiEmpresa.service'
import apiSucursalesService from '@/service/apiSucursales.service'
import apiContactosService from '@/service/apiContactos.service'
import apiProductosService from '@/service/apiProductos.service'
import apiComprasService from '@/service/apiCompras.service'
import { Loader2, ArrowLeft } from 'lucide-react'
import { EmpresaSelector } from '@/features/nueva-venta/components/empresa-selector'
import { SucursalSelector } from '@/features/nueva-venta/components/sucursal-selector'
import { DetallesCompra } from '@/features/nueva-compra/components/detalles-compra'
import { 
  DetalleCompra, 
  DetalleCompraBackend,
  TotalesCompra 
} from '@/features/nueva-compra/types'
import type { Compra } from '../data/schema'

export function EditarCompra() {
  const navigate = useNavigate()
  const { compraId } = useParams({ from: '/_authenticated/compras/editar-compra/$compraId' })
  const { isSuperAdmin } = usePermissions()
  const { auth } = useAuthStore()
  
  const [compraOriginal, setCompraOriginal] = useState<Compra | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [proveedores, setProveedores] = useState<Contacto[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<number | null>(null)
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | null>(null)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<number | null>(null)
  const [proveedorNombre, setProveedorNombre] = useState<string>('')
  const [detalles, setDetalles] = useState<DetalleCompra[]>([])
  
  const [fechaCompra, setFechaCompra] = useState<string>('')
  const [numeroFactura, setNumeroFactura] = useState<string>('')
  const [observaciones, setObservaciones] = useState<string>('')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar la compra original
  useEffect(() => {
    const cargarCompra = async () => {
      try {
        setLoading(true)
        const compra = await apiComprasService.getCompraById(parseInt(compraId))
        
        // Verificar que la compra esté en PENDIENTE_PAGO
        if (compra.estado?.toUpperCase() !== 'PENDIENTE_PAGO') {
          toast.error('Solo se pueden modificar compras en estado PENDIENTE DE PAGO')
          navigate({ to: '/compras/compras' })
          return
        }

        setCompraOriginal(compra as Compra)
        
        // Cargar datos de la compra
        setFechaCompra(compra.fecha_compra ? new Date(compra.fecha_compra).toISOString().split('T')[0] : '')
        setNumeroFactura(compra.numero_factura || '')
        setObservaciones(compra.observaciones || '')
        setProveedorSeleccionado(compra.contacto_id || null)
        setProveedorNombre(compra.contacto?.nombre_razon_social || '')
        setSucursalSeleccionada(compra.sucursal_id || null)
        setEmpresaSeleccionada(compra.sucursal?.empresa_id || null)
        
        // Cargar detalles
        if (compra.detalles && compra.detalles.length > 0) {
          const detallesCargados: DetalleCompra[] = compra.detalles.map((d, index) => ({
            id: `${Date.now()}-${index}`,
            producto: {
              id: d.producto?.producto?.id,
              nombre: d.producto?.producto?.nombre || '',
              codigo: d.producto?.producto?.codigo || '',
            } as Producto,
            cantidad: d.cantidad,
            costo_unitario: typeof d.precio_unitario === 'string' ? parseFloat(d.precio_unitario) : d.precio_unitario,
            iva_porcentaje: 0, // Por defecto, se puede ajustar según necesites
            iva_monto: 0,
            subtotal: typeof d.subtotal === 'string' ? parseFloat(d.subtotal) : d.subtotal,
            total: typeof d.subtotal === 'string' ? parseFloat(d.subtotal) : d.subtotal,
          }))
          setDetalles(detallesCargados)
        }
        
      } catch (error: any) {
        console.error('Error al cargar la compra:', error)
        toast.error(error.message || 'Error al cargar la compra')
        navigate({ to: '/compras/compras' })
      } finally {
        setLoading(false)
      }
    }

    cargarCompra()
  }, [compraId, navigate])

  // Cargar datos iniciales (empresas, sucursales, etc)
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        if (isSuperAdmin) {
          const empresasData = await apiEmpresaService.getAllEmpresas()
          setEmpresas(empresasData.filter(e => e.estado))
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        toast.error('Error al cargar los datos iniciales')
      }
    }

    if (!loading) {
      cargarDatosIniciales()
    }
  }, [isSuperAdmin, loading])

  // Cargar sucursales cuando se selecciona empresa
  useEffect(() => {
    const cargarSucursales = async () => {
      if (empresaSeleccionada && isSuperAdmin) {
        try {
          const sucursalesData = await apiSucursalesService.getAllSucursales()
          const sucursalesDeEmpresa = sucursalesData.filter(
            s => s.estado && s.empresa_id === empresaSeleccionada
          )
          setSucursales(sucursalesDeEmpresa)
        } catch (error) {
          console.error('Error al cargar sucursales:', error)
          toast.error('Error al cargar las sucursales')
        }
      }
    }

    if (!loading) {
      cargarSucursales()
    }
  }, [empresaSeleccionada, isSuperAdmin, loading])

  // Cargar productos cuando se selecciona sucursal
  useEffect(() => {
    const cargarProductos = async () => {
      if (!empresaSeleccionada || !sucursalSeleccionada) {
        return
      }

      try {
        if (typeof sucursalSeleccionada === 'number') {
          const productosData = await apiProductosService.getProductosBySucursal(sucursalSeleccionada)
          setProductos(productosData.filter(p => p.estado))
        }
      } catch (error) {
        console.error('Error al cargar productos:', error)
        toast.error('Error al cargar los productos')
      }
    }

    if (!loading) {
      cargarProductos()
    }
  }, [empresaSeleccionada, sucursalSeleccionada, loading])

  const totales = useMemo<TotalesCompra>(() => {
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0)
    const totalIva = detalles.reduce((sum, d) => sum + d.iva_monto, 0)
    const total = subtotal + totalIva
    
    return { subtotal, totalIva, totalCostosAdicionales: 0, total }
  }, [detalles])

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

  const cancelar = () => {
    navigate({ to: '/compras/compras' })
  }

  const guardarCambios = async () => {
    if (!empresaSeleccionada) {
      toast.error('Debe seleccionar una empresa')
      return
    }

    if (!sucursalSeleccionada) {
      toast.error('Debe seleccionar una sucursal')
      return
    }

    if (!proveedorSeleccionado) {
      toast.error('Error: No se pudo obtener el proveedor')
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

      const detallesBackend: DetalleCompraBackend[] = detalles.map(d => ({
        producto_id: d.producto.id!,
        cantidad: d.cantidad,
        precio_unitario: d.costo_unitario,
        subtotal: d.subtotal,
      }))

      const compraData = {
        fecha_compra: fechaCompra,
        contacto_id: proveedorSeleccionado,
        sucursal_id: sucursalSeleccionada,
        monto_total: totales.total,
        estado: 'PENDIENTE_PAGO',
        detalles: detallesBackend,
        numero_factura: numeroFactura || undefined,
        observaciones: observaciones || undefined,
      }
      
      await apiComprasService.updateCompra(parseInt(compraId), compraData as any)
      
      toast.success('¡Compra actualizada exitosamente!')
      navigate({ to: '/compras/compras' })
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:py-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={cancelar}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Modificar Compra #{compraOriginal?.numero_compra}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Editar los datos de una compra pendiente de pago
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información del proveedor (solo lectura) */}
        <Card className="shadow-sm border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <h2 className="text-sm font-medium mb-1">Proveedor</h2>
                <p className="text-lg font-semibold">{proveedorNombre}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El proveedor no puede ser modificado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fila de Empresa y Sucursal (solo lectura si no es superadmin) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Empresa */}
          {isSuperAdmin && empresaSeleccionada && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-sm font-medium mb-2">Empresa</h2>
                <EmpresaSelector
                  empresas={empresas}
                  empresaSeleccionada={empresaSeleccionada}
                  onEmpresaChange={setEmpresaSeleccionada}
                  disabled={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Sucursal */}
          {empresaSeleccionada && sucursalSeleccionada && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-sm font-medium mb-2">Sucursal</h2>
                <div className="h-9 flex items-center px-3 border rounded-md bg-muted text-xs">
                  <p className="font-medium">
                    {sucursales.find(s => s.id === sucursalSeleccionada)?.nombre || 'Sucursal'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Datos de la compra (editables) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Datos de la compra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fecha" className="text-sm">Fecha de compra *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fechaCompra}
                  onChange={(e) => setFechaCompra(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="factura" className="text-sm">
                  N° Factura/Remito del Proveedor
                  <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                </Label>
                <Input
                  id="factura"
                  type="text"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.target.value)}
                  placeholder="Ej: 0001-00001234"
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="observaciones" className="text-sm">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={1}
                  className="mt-1 resize-none"
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

        {/* Resumen y Acciones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Finalizar modificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resumen de Totales */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal (sin IVA):</span>
                  <span className="font-medium">{formatCurrency(totales.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA Total:</span>
                  <span className="font-medium">{formatCurrency(totales.totalIva)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-medium">
                  <span>Total:</span>
                  <span className="text-lg">{formatCurrency(totales.total)}</span>
                </div>
              </div>

              {/* Total Destacado */}
              <div>
                <div className="w-full bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border-2 border-blue-600 dark:border-blue-700 h-full flex flex-col justify-center">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">Total de la compra</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                    {formatCurrency(totales.total)}
                  </p>
                  {detalles.length > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                      {detalles.length} {detalles.length === 1 ? 'producto' : 'productos'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelar}
                disabled={submitting}
                size="lg"
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarCambios}
                disabled={submitting || detalles.length === 0}
                size="lg"
                className="w-full sm:w-auto sm:min-w-[180px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
    </div>
  )
}
