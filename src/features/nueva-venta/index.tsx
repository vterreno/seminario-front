import { useState, useEffect, useMemo } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Empresa } from '@/service/apiEmpresa.service'
import { Sucursal } from '@/features/sucursales/data/schema'
import { Contacto } from '@/service/apiContactos.service'
import { Producto } from '@/features/productos/data/schema'
import apiEmpresaService from '@/service/apiEmpresa.service'
import apiSucursalesService from '@/service/apiSucursales.service'
import apiContactosService from '@/service/apiContactos.service'
import apiProductosService from '@/service/apiProductos.service'
import apiVentasService from '@/service/apiVentas.service'
import { Loader2 } from 'lucide-react'
import { EmpresaSelector } from './components/empresa-selector'
import { SucursalSelector } from './components/sucursal-selector'
import { ClienteSelector } from './components/cliente-selector'
import { DetallesVenta, type DetalleVenta } from './components/detalles-venta'
import { MetodoPagoSelector } from './components/metodo-pago-selector'

export function NuevaVenta() {
  const { isSuperAdmin } = usePermissions()
  const { auth } = useAuthStore()
  
  // Estados de datos
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [clientes, setClientes] = useState<Contacto[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  
  // Estados de selección
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<number | null>(null)
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | null>(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null)
  const [detalles, setDetalles] = useState<DetalleVenta[]>([])
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | null>(null)
  
  // Estados de carga
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true)
        
        if (isSuperAdmin) {
          // SuperAdmin: solo cargar todas las empresas
          const empresasData = await apiEmpresaService.getAllEmpresas()
          setEmpresas(empresasData.filter(e => e.estado))
        } else {
          // Usuario normal: usar empresa del usuario y cargar sucursales
          if (auth.user?.empresa?.id) {
            const empresaId = auth.user.empresa.id
            setEmpresaSeleccionada(empresaId)
            
            try {
              // Cargar sucursales de la empresa del usuario
              const sucursalesData = await apiSucursalesService.getAllSucursales()
              // Filtrar sucursales por empresa del usuario
              const sucursalesDeEmpresa = sucursalesData.filter(
                s => s.estado && s.empresa_id === empresaId
              )
              setSucursales(sucursalesDeEmpresa)
              
              // Si solo hay una sucursal, seleccionarla automáticamente
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

  // Cargar sucursales cuando se selecciona una empresa (solo SuperAdmin)
  useEffect(() => {
    const cargarSucursales = async () => {
      if (empresaSeleccionada && isSuperAdmin) {
        try {
          // SuperAdmin puede ver todas las sucursales
          const sucursalesData = await apiSucursalesService.getAllSucursales()
          // Filtrar por empresa seleccionada
          const sucursalesDeEmpresa = sucursalesData.filter(
            s => s.estado && s.empresa_id === empresaSeleccionada
          )
          setSucursales(sucursalesDeEmpresa)
          
          // Si solo hay una sucursal, seleccionarla automáticamente
          if (sucursalesDeEmpresa.length === 1 && sucursalesDeEmpresa[0].id) {
            setSucursalSeleccionada(sucursalesDeEmpresa[0].id)
          } else {
            setSucursalSeleccionada(null)
          }
          
          // Limpiar selección de cliente cuando cambia la empresa
          setClienteSeleccionado(null)
          setDetalles([])
        } catch (error) {
          console.error('Error al cargar sucursales:', error)
          toast.error('Error al cargar las sucursales')
        }
      }
    }

    cargarSucursales()
  }, [empresaSeleccionada, isSuperAdmin])

  // Cargar clientes y productos cuando se selecciona una empresa
  useEffect(() => {
    const cargarClientesYProductos = async () => {
      if (!empresaSeleccionada) {
        return
      }

      try {
        // Cargar clientes
        try {
          let clientesData: Contacto[] = []
          
          if (isSuperAdmin) {
            // SuperAdmin puede ver todos los clientes
            clientesData = await apiContactosService.getClientesAll()
          } else {
            // Usuario normal solo ve clientes de su empresa
            clientesData = await apiContactosService.getClientesAll()
          }
          
          // Filtrar clientes por empresa seleccionada
          const clientesFiltrados = clientesData.filter(c => 
            c.estado && 
            (c.rol === 'cliente' || c.rol === 'ambos') &&
            c.empresa_id === empresaSeleccionada
          )
          
          setClientes(clientesFiltrados)
        } catch (error) {
          console.error('Error al cargar clientes:', error)
          toast.error('No tienes permisos para ver los clientes')
          setClientes([])
        }

        // Cargar productos
        try {
          let productosData: Producto[] = []
          
          if (isSuperAdmin) {
            // SuperAdmin puede usar el endpoint específico por empresa
            productosData = await apiProductosService.getProductosByEmpresa(empresaSeleccionada)
          } else {
            // Usuario normal obtiene todos sus productos y filtra por empresa
            const todosLosProductos = await apiProductosService.getAllProductos()
            productosData = todosLosProductos.filter(p => p.empresa_id === empresaSeleccionada)
          }
          
          setProductos(productosData.filter(p => p.estado))
        } catch (error) {
          console.error('Error al cargar productos:', error)
          toast.error('No tienes permisos para ver los productos')
          setProductos([])
        }
      } catch (error) {
        console.error('Error general al cargar datos:', error)
      }
    }

    cargarClientesYProductos()
  }, [empresaSeleccionada, isSuperAdmin])

  // Calcular monto total
  const montoTotal = useMemo(() => {
    return detalles.reduce((total, detalle) => total + detalle.subtotal, 0)
  }, [detalles])

  // Agregar detalle de venta
  const agregarDetalle = (producto: Producto, cantidad: number) => {
    const precioUnitario = Number(producto.precio_venta || 0)
    const nuevoDetalle: DetalleVenta = {
      id: `${Date.now()}-${Math.random()}`,
      producto,
      cantidad,
      precio_unitario: precioUnitario,
      subtotal: precioUnitario * cantidad
    }
    
    setDetalles(prev => [...prev, nuevoDetalle])
    toast.success('Producto agregado')
  }

  // Eliminar detalle
  const eliminarDetalle = (id: string) => {
    setDetalles(prev => prev.filter(d => d.id !== id))
    toast.success('Producto eliminado')
  }

  // Actualizar cantidad de un detalle
  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDetalle(id)
      return
    }
    
    setDetalles(prev => prev.map(detalle => {
      if (detalle.id === id) {
        return {
          ...detalle,
          cantidad: nuevaCantidad,
          subtotal: detalle.precio_unitario * nuevaCantidad
        }
      }
      return detalle
    }))
  }

  // Validar formulario
  const validarFormulario = (): boolean => {
    if (!empresaSeleccionada) {
      toast.error('Debe seleccionar una empresa')
      return false
    }

    if (!sucursalSeleccionada) {
      toast.error('Debe seleccionar una sucursal')
      return false
    }

    if (!clienteSeleccionado) {
      toast.error('Debe seleccionar un cliente')
      return false
    }

    if (detalles.length === 0) {
      toast.error('Debe agregar al menos un producto')
      return false
    }

    if (!metodoPago) {
      toast.error('Debe seleccionar un método de pago')
      return false
    }

    return true
  }

  // Crear venta
  const crearVenta = async () => {
    if (!validarFormulario()) return

    try {
      setSubmitting(true)
      
      // Fecha actual en formato ISO
      const fechaVenta = new Date().toISOString()

      // Estructura según el DTO de CreateVentaDto
      const ventaData = {
        fecha_venta: fechaVenta,
        detalles: detalles.map(d => ({
          producto_id: d.producto.id,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal
        })),
        monto_total: montoTotal,
        contacto_id: clienteSeleccionado!,
        sucursal_id: sucursalSeleccionada!,
        pago: {
          fecha_pago: fechaVenta,
          monto_pago: montoTotal,
          metodo_pago: metodoPago!,
          sucursal_id: sucursalSeleccionada!
        }
      }

      await apiVentasService.createVenta(ventaData)
      
      toast.success('Venta creada exitosamente')
      
      // Limpiar formulario
      setClienteSeleccionado(null)
      setDetalles([])
      setMetodoPago(null)
      
    } catch (error: any) {
      console.error('Error al crear venta:', error)
      toast.error(error.message || 'Error al crear la venta')
    } finally {
      setSubmitting(false)
    }
  }

  // Cancelar venta
  const cancelarVenta = () => {
    setClienteSeleccionado(null)
    setDetalles([])
    setMetodoPago(null)
    toast.info('Venta cancelada')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Venta</h1>
        <p className="text-muted-foreground">
          Complete los datos para registrar una nueva venta
        </p>
      </div>

      <div className="space-y-6">
        {/* Fila de Empresa, Sucursal y Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Empresa (Solo SuperAdmin) */}
          {isSuperAdmin && (
            <Card className="shadow-sm">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-medium">Empresa</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
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
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-medium">Sucursal</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
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

          {/* Cliente */}
          {sucursalSeleccionada && (
            <Card className="shadow-sm">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-medium">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                <ClienteSelector
                  clientes={clientes}
                  clienteSeleccionado={clienteSeleccionado}
                  onClienteChange={setClienteSeleccionado}
                  empresaSeleccionada={empresaSeleccionada}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detalles de Venta */}
        {clienteSeleccionado && (
          <div className="space-y-6">
            <DetallesVenta
              productos={productos}
              detalles={detalles}
              onAgregarDetalle={agregarDetalle}
              onEliminarDetalle={eliminarDetalle}
              onActualizarCantidad={actualizarCantidad}
            />

            {/* Método de Pago y Acciones - Siempre visible cuando hay cliente */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Finalizar Venta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Método de Pago */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Método de Pago</Label>
                    <MetodoPagoSelector
                      metodoPago={metodoPago}
                      onMetodoPagoChange={setMetodoPago}
                    />
                  </div>

                  {/* Resumen del Total */}
                  <div>
                    <div className="w-full bg-green-50 dark:bg-green-950 rounded-lg p-4 border-2 border-green-600 dark:border-green-700 h-full flex flex-col justify-center">
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">Total a pagar</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                        ${Number(montoTotal || 0).toFixed(2)}
                      </p>
                      {detalles.length > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                          {detalles.length} {detalles.length === 1 ? 'producto' : 'productos'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={cancelarVenta}
                    disabled={submitting}
                    size="lg"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={crearVenta}
                    disabled={submitting || !metodoPago || detalles.length === 0}
                    size="lg"
                    className="min-w-[160px]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Confirmar Venta'
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
