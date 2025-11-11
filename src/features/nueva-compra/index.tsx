import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
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
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { EmpresaSelector } from '../nueva-venta/components/empresa-selector'
import { SucursalSelector } from '../nueva-venta/components/sucursal-selector'
import { ProveedorSelector } from './components/proveedor-selector'
import { DetallesCompra } from './components/detalles-compra'
import { 
  DetalleCompra, 
  CostoAdicional, 
  DetalleCompraBackend,
  TotalesCompra 
} from './types'

export function NuevaCompra() {
  const navigate = useNavigate()
  const { isSuperAdmin } = usePermissions()
  const { auth } = useAuthStore()
  
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [proveedores, setProveedores] = useState<Contacto[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<number | null>(null)
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | null>(null)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<number | null>(null)
  const [detalles, setDetalles] = useState<DetalleCompra[]>([])
  const [costosAdicionales, setCostosAdicionales] = useState<CostoAdicional[]>([])
  
  const [fechaCompra, setFechaCompra] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [numeroFactura, setNumeroFactura] = useState<string>('')
  const [observaciones, setObservaciones] = useState<string>('')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Función para reiniciar el formulario
  const reiniciarFormulario = () => {
    setProveedorSeleccionado(null)
    setDetalles([])
    setCostosAdicionales([])
    setFechaCompra(new Date().toISOString().split('T')[0])
    setNumeroFactura('')
    setObservaciones('')
    
    // Si no es superadmin, mantener la empresa y sucursal
    if (isSuperAdmin) {
      setEmpresaSeleccionada(null)
      setSucursalSeleccionada(null)
    }
  }

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true)
        
        if (isSuperAdmin) {
          const empresasData = await apiEmpresaService.getAllEmpresas()
          setEmpresas(empresasData.filter(e => e.estado))
        } else {
          if (auth.user?.empresa?.id) {
            const empresaId = auth.user.empresa.id
            setEmpresaSeleccionada(empresaId)
            
            try {
              const sucursalesData = await apiSucursalesService.getAllSucursales()
              const sucursalesDeEmpresa = sucursalesData.filter(
                s => s.estado && s.empresa_id === empresaId
              )
              setSucursales(sucursalesDeEmpresa)
              
              if (sucursalesDeEmpresa.length === 1 && sucursalesDeEmpresa[0].id) {
                setSucursalSeleccionada(sucursalesDeEmpresa[0].id)
              }
            } catch (error) {
              console.error('Error al cargar sucursales:', error)
              toast.error('No tienes permisos para ver las sucursales')
            }
          } else {
            toast.error('No se pudo obtener la empresa del usuario')
          }
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        toast.error('Error al cargar los datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    cargarDatosIniciales()
  }, [isSuperAdmin, auth.user])

  useEffect(() => {
    const cargarSucursales = async () => {
      if (empresaSeleccionada && isSuperAdmin) {
        try {
          const sucursalesData = await apiSucursalesService.getAllSucursales()
          const sucursalesDeEmpresa = sucursalesData.filter(
            s => s.estado && s.empresa_id === empresaSeleccionada
          )
          setSucursales(sucursalesDeEmpresa)
          
          if (sucursalesDeEmpresa.length === 1 && sucursalesDeEmpresa[0].id) {
            setSucursalSeleccionada(sucursalesDeEmpresa[0].id)
          } else {
            setSucursalSeleccionada(null)
          }
          
          setProveedorSeleccionado(null)
          setDetalles([])
        } catch (error) {
          console.error('Error al cargar sucursales:', error)
          toast.error('Error al cargar las sucursales')
        }
      }
    }

    cargarSucursales()
  }, [empresaSeleccionada, isSuperAdmin])

  useEffect(() => {
    const cargarProveedoresYProductos = async () => {
      if (!empresaSeleccionada) {
        return
      }

      try {
        try {
          let proveedoresData: Contacto[] = []
          
          if (isSuperAdmin) {
            proveedoresData = await apiContactosService.getProveedoresAll()
          } else {
            proveedoresData = await apiContactosService.getProveedoresAll()
          }
          
          const proveedoresFiltrados = proveedoresData.filter(c => 
            c.estado && 
            (c.rol === 'proveedor' || c.rol === 'ambos') &&
            c.empresa_id === empresaSeleccionada
          )
          
          setProveedores(proveedoresFiltrados)
        } catch (error) {
          console.error('Error al cargar proveedores:', error)
          toast.error('No tienes permisos para ver los proveedores')
          setProveedores([])
        }

        try {
          let productosData: Producto[] = []
          
          if (typeof sucursalSeleccionada === 'number') {
            productosData = await apiProductosService.getProductosBySucursal(sucursalSeleccionada)
            setProductos(productosData.filter(p => p.estado))
          } else {
            setProductos([])
          }
          
        } catch (error) {
          console.error('Error al cargar productos:', error)
          toast.error('No tienes permisos para ver los productos')
          setProductos([])
        }
      } catch (error) {
        console.error('Error general al cargar datos:', error)
      }
    }

    cargarProveedoresYProductos()
  }, [empresaSeleccionada, isSuperAdmin, sucursalSeleccionada])

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
      id: `${Date.now()}-${Math.random()}`,
      concepto: '',
      monto: 0,
    }
    setCostosAdicionales([...costosAdicionales, nuevoCosto])
  }

  const eliminarCostoAdicional = (id: string) => {
    setCostosAdicionales(costosAdicionales.filter(c => c.id !== id))
  }

  const actualizarCostoAdicional = (id: string, campo: 'concepto' | 'monto', valor: string | number) => {
    setCostosAdicionales(costosAdicionales.map(c => {
      if (c.id === id) {
        return { ...c, [campo]: valor }
      }
      return c
    }))
  }

  const cancelarCompra = () => {
    navigate({ to: '/compras' })
  }

  const guardarCompra = async () => {
    if (!empresaSeleccionada) {
      toast.error('Debe seleccionar una empresa')
      return
    }

    if (!sucursalSeleccionada) {
      toast.error('Debe seleccionar una sucursal')
      return
    }

    if (!proveedorSeleccionado) {
      toast.error('Debe seleccionar un proveedor')
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
        estado: 'PENDIENTE_PAGO', // Estado inicial: mercadería recibida, pendiente de pago
        detalles: detallesBackend,
        numero_factura: numeroFactura || undefined,
        observaciones: observaciones || undefined,
      }
      
      // Llamar al servicio de API para crear la compra
      const compraCreada = await apiComprasService.createCompra(compraData as any)
      
      toast.success(`¡Compra #${compraCreada.numero_compra} registrada exitosamente! Stock actualizado.`)
      
      // Reiniciar el formulario para permitir otra compra
      reiniciarFormulario()
      
      // Scroll al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      console.error('Error al guardar la compra:', error)
      const errorMessage = error.response?.data?.message || 'Error al guardar la compra. Por favor intente nuevamente.'
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Nueva Compra</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Registre una nueva compra de mercadería a proveedores
        </p>
      </div>

      <div className="space-y-6">
        {/* Fila de Empresa, Sucursal y Proveedor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Empresa (Solo SuperAdmin) */}
          {isSuperAdmin && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-sm font-medium mb-2">Empresa</h2>
                <EmpresaSelector
                  empresas={empresas}
                  empresaSeleccionada={empresaSeleccionada}
                  onEmpresaChange={setEmpresaSeleccionada}
                />
              </CardContent>
            </Card>
          )}

          {/* Sucursal */}
          {empresaSeleccionada && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-sm font-medium mb-2">Sucursal</h2>
                {sucursales.length === 1 ? (
                  <div className="h-9 flex items-center px-3 border rounded-md bg-muted text-xs">
                    <p className="font-medium">{sucursales[0].nombre}</p>
                  </div>
                ) : (
                  <SucursalSelector
                    sucursales={sucursales}
                    sucursalSeleccionada={sucursalSeleccionada}
                    onSucursalChange={setSucursalSeleccionada}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Proveedor */}
          {sucursalSeleccionada && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-sm font-medium mb-2">Proveedor</h2>
                <ProveedorSelector
                  proveedor={proveedores}
                  proveedorSeleccionado={proveedorSeleccionado}
                  onProveedorChange={setProveedorSeleccionado}
                  empresaSeleccionada={empresaSeleccionada}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Datos adicionales */}
        {proveedorSeleccionado && (
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Ingrese el número de la factura que le emitió el proveedor
                  </p>
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
        )}

        {/* Detalles de Compra */}
        {proveedorSeleccionado && (
          <div className="space-y-6">
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Costos adicionales</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={agregarCostoAdicional}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {costosAdicionales.length > 0 ? (
                  <div className="space-y-2">
                    {costosAdicionales.map((costo) => (
                      <div key={costo.id} className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Concepto (Flete, IIBB, etc.)"
                          value={costo.concepto}
                          onChange={(e) =>
                            actualizarCostoAdicional(costo.id, 'concepto', e.target.value)
                          }
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Monto"
                          value={costo.monto}
                          onChange={(e) =>
                            actualizarCostoAdicional(costo.id, 'monto', Number(e.target.value))
                          }
                          className="w-full sm:w-32"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => eliminarCostoAdicional(costo.id)}
                          className="self-start sm:self-auto"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin costos adicionales. Haga clic en "Agregar" para incluir fletes, percepciones, etc.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Resumen y Acciones */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Finalizar compra</CardTitle>
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
                    {totales.totalCostosAdicionales > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Costos Adicionales:</span>
                        <span className="font-medium">{formatCurrency(totales.totalCostosAdicionales)}</span>
                      </div>
                    )}
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
                    onClick={cancelarCompra}
                    disabled={submitting}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={guardarCompra}
                    disabled={submitting || detalles.length === 0}
                    size="lg"
                    className="w-full sm:w-auto sm:min-w-[180px]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Registrar compra'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
