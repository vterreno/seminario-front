import { useState, useMemo } from 'react'
import { Producto } from '@/features/productos/data/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'

export interface DetalleVenta {
  id: string
  producto: Producto
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface DetallesVentaProps {
  productos: Producto[]
  detalles: DetalleVenta[]
  onAgregarDetalle: (producto: Producto, cantidad: number) => void
  onEliminarDetalle: (id: string) => void
  onActualizarCantidad: (id: string, cantidad: number) => void
}

export function DetallesVenta({
  productos,
  detalles,
  onAgregarDetalle,
  onEliminarDetalle,
  onActualizarCantidad,
}: DetallesVentaProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('')
  const [cantidad, setCantidad] = useState<string>('1')
  const [busquedaProducto, setBusquedaProducto] = useState('')

  const productosFiltrados = useMemo(() => {
    if (!busquedaProducto.trim()) return productos

    const busquedaLower = busquedaProducto.toLowerCase().trim()
    return productos.filter((producto) => {
      const nombre = producto.nombre?.toLowerCase() || ''
      const codigo = producto.codigo?.toLowerCase() || ''
      
      return nombre.includes(busquedaLower) || codigo.includes(busquedaLower)
    })
  }, [productos, busquedaProducto])

  const handleAgregarProducto = () => {
    if (!productoSeleccionado) {
      toast.error('Debe seleccionar un producto')
      return
    }

    const cantidadNum = Number(cantidad)
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }

    const producto = productos.find(p => p.id?.toString() === productoSeleccionado)
    if (!producto) {
      toast.error('Producto no encontrado')
      return
    }

    // Verificar stock disponible
    const stockDisponible = producto.stock || 0
    if (stockDisponible < cantidadNum) {
      toast.error(`Stock insuficiente. Disponible: ${stockDisponible}`)
      return
    }

    // Verificar si el producto ya está en los detalles
    const productoExistente = detalles.find(d => d.producto.id === producto.id)
    
    if (productoExistente) {
      const nuevaCantidad = productoExistente.cantidad + cantidadNum
      if (stockDisponible < nuevaCantidad) {
        toast.error(`Stock insuficiente. Disponible: ${stockDisponible}`)
        return
      }
      onActualizarCantidad(productoExistente.id, nuevaCantidad)
      toast.success('Cantidad actualizada')
    } else {
      onAgregarDetalle(producto, cantidadNum)
    }

    // Limpiar formulario
    setProductoSeleccionado('')
    setCantidad('1')
    setBusquedaProducto('')
  }

  const handleCantidadChange = (detalleId: string, nuevaCantidad: string) => {
    const cantidadNum = Number(nuevaCantidad)
    if (!isNaN(cantidadNum) && cantidadNum > 0) {
      const detalle = detalles.find(d => d.id === detalleId)
      if (detalle && detalle.producto.stock >= cantidadNum) {
        onActualizarCantidad(detalleId, cantidadNum)
      } else {
        toast.error('Stock insuficiente')
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Formulario para agregar productos */}
      <div className="p-4 border rounded-lg bg-card">
        <h2 className='mb-4'>Productos</h2>
        
        <div className="space-y-3">
          {/* Buscador de Producto */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar producto por nombre o código..."
              value={busquedaProducto}
              onChange={(e) => {
                setBusquedaProducto(e.target.value)
                if (productoSeleccionado && e.target.value) {
                  setProductoSeleccionado('')
                }
              }}
              className="pl-9 h-10"
            />
          </div>

          {/* Selector, Cantidad y Botón en una fila */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Selector de Producto */}
            <div className="md:col-span-7">
              <Label htmlFor="producto" className="text-xs mb-2 block">Producto</Label>
              <Select
                value={productoSeleccionado}
                onValueChange={setProductoSeleccionado}
              >
                <SelectTrigger id="producto" className="h-10 w-full">
                  <SelectValue placeholder="Seleccione un producto" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {productosFiltrados.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      {busquedaProducto ? 'No se encontraron productos' : 'No hay productos disponibles'}
                    </div>
                  ) : (
                    productosFiltrados.map((producto) => (
                      <SelectItem 
                        key={producto.id} 
                        value={producto.id?.toString() || ''}
                        disabled={!producto.stock || producto.stock <= 0}
                      >
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="font-medium">{producto.nombre}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              ${Number(producto.precio_venta || 0).toFixed(2)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              producto.stock > 10 
                                ? 'bg-green-100 text-green-700' 
                                : producto.stock > 0 
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              Stock: {producto.stock}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Cantidad */}
            <div className="md:col-span-3">
              <Label htmlFor="cantidad" className="text-xs mb-2 block">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAgregarProducto()
                  }
                }}
                className="w-full h-10"
              />
            </div>

            {/* Botón Agregar */}
            <div className="md:col-span-2">
              <Label className="text-xs mb-2 block opacity-0">Acción</Label>
              <Button 
                onClick={handleAgregarProducto} 
                className="w-full h-10"
                disabled={!productoSeleccionado}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos agregados */}
      {detalles.length > 0 ? (
        <div className="border rounded-lg bg-card">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">
              Productos en la venta ({detalles.length} {detalles.length === 1 ? 'producto' : 'productos'})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">Producto</th>
                  <th className="text-right p-4 font-semibold text-sm">Precio Unit.</th>
                  <th className="text-center p-4 font-semibold text-sm w-32">Cantidad</th>
                  <th className="text-right p-4 font-semibold text-sm">Subtotal</th>
                  <th className="text-center p-4 font-semibold text-sm w-24">Acciones</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-border">
                    {detalles.map((detalle) => (
                        <tr key={detalle.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <p className="font-medium">{detalle.producto.nombre}</p>
                          </td>
                          <td className="p-4 text-right font-medium">
                            ${Number(detalle.precio_unitario || 0).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <Input
                                type="number"
                                min="1"
                                max={detalle.producto.stock}
                                value={detalle.cantidad}
                                onChange={(e) => handleCantidadChange(detalle.id, e.target.value)}
                                className="w-20 h-9 text-center"
                              />
                            </div>
                          </td>
                          <td className="p-4 text-right font-bold text-lg text-primary">
                            ${Number(detalle.subtotal || 0).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEliminarDetalle(detalle.id)}
                                className="h-9 w-9 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
                                title="Eliminar producto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground font-medium">No hay productos agregados</p>
            <p className="text-sm text-muted-foreground mt-1">Seleccione productos para agregar a la venta</p>
          </div>
        )}
    </div>
  )
}
