import { useState, useMemo, useEffect } from 'react'
import { Producto } from '@/features/productos/data/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Check, ChevronsUpDown, Tag } from 'lucide-react'
import { toast } from 'sonner'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import type { ListaPrecios } from '@/features/lista-precios/data/schema'

export interface DetalleVenta {
  id: string
  producto: Producto
  cantidad: number
  precio_unitario: number
  subtotal: number
  lista_precio_nombre?: string
}

interface DetallesVentaProps {
  productos: Producto[]
  detalles: DetalleVenta[]
  empresaId: number | null
  onAgregarDetalle: (producto: Producto, cantidad: number, precioUnitario: number, listaPrecioNombre?: string) => void
  onEliminarDetalle: (id: string) => void
  onActualizarCantidad: (id: string, cantidad: number) => void
}

export function DetallesVenta({
  productos,
  detalles,
  empresaId,
  onAgregarDetalle,
  onEliminarDetalle,
  onActualizarCantidad,
}: DetallesVentaProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('')
  const [cantidad, setCantidad] = useState<string>('1')
  const [openProducto, setOpenProducto] = useState(false)
  
  const [listasPrecios, setListasPrecios] = useState<ListaPrecios[]>([])
  const [listasDisponibles, setListasDisponibles] = useState<Array<{lista: ListaPrecios, precio: number}>>([])
  const [listaPrecioSeleccionada, setListaPrecioSeleccionada] = useState<string>('default')
  const [loadingListas, setLoadingListas] = useState(false)

  // ============= FUNCIÓN CLAVE: Calcular stock disponible =============
  const getStockDisponible = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId)
    if (!producto) return 0
    
    const stockOriginal = producto.stock || 0
    const cantidadEnDetalles = detalles
      .filter(d => d.producto.id === productoId)
      .reduce((sum, d) => sum + d.cantidad, 0)
    
    return stockOriginal - cantidadEnDetalles
  }

  // Filtrar productos con stock disponible > 0
  const productosConStock = useMemo(() => {
    return productos.filter(p => getStockDisponible(p.id!) > 0)
  }, [productos, detalles])

  const productoActual = useMemo(() => {
    return productos.find(p => p.id?.toString() === productoSeleccionado)
  }, [productos, productoSeleccionado])

  useEffect(() => {
    const cargarListasPrecios = async () => {
      if (!empresaId) {
        setListasPrecios([])
        return
      }

      try {
        setLoadingListas(true)
        const listas = await apiListaPreciosService.getListaPreciosByEmpresa(empresaId)
        setListasPrecios(listas.filter(l => l.estado))
      } catch (error: any) {
        console.error('Error al cargar listas de precios:', error)
        toast.error('Error al cargar listas de precios')
        setListasPrecios([])
      } finally {
        setLoadingListas(false)
      }
    }

    cargarListasPrecios()
  }, [empresaId])

  useEffect(() => {
    const cargarListasDelProducto = async () => {
      if (!productoActual) {
        setListasDisponibles([])
        setListaPrecioSeleccionada('default')
        return
      }

      try {
        const listasConProducto: Array<{lista: ListaPrecios, precio: number}> = []
        
        for (const lista of listasPrecios) {
          try {
            const productos = await apiListaPreciosService.getProductosByListaPrecios(lista.id)
            const productoEnLista = productos.find(p => p.id === productoActual.id)
            
            if (productoEnLista) {
              listasConProducto.push({
                lista: lista,
                precio: productoEnLista.precio ?? productoEnLista.precio_venta ?? productoActual.precio_venta
              })
            }
          } catch (error) {
            console.error(`Error al cargar productos de lista ${lista.id}:`, error)
          }
        }
        
        setListasDisponibles(listasConProducto)
        setListaPrecioSeleccionada('default')
      } catch (error) {
        console.error('Error al cargar listas del producto:', error)
        setListasDisponibles([])
      }
    }

    cargarListasDelProducto()
  }, [productoActual, listasPrecios])

  const precioActual = useMemo(() => {
    if (!productoActual) return 0
    
    if (listaPrecioSeleccionada === 'default') {
      return Number(productoActual.precio_venta) || 0
    }
    
    const listaSeleccionada = listasDisponibles.find(
      l => l.lista.id.toString() === listaPrecioSeleccionada
    )
    
    return Number(listaSeleccionada?.precio) || Number(productoActual.precio_venta) || 0
  }, [productoActual, listaPrecioSeleccionada, listasDisponibles])

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

    // ============= USAR getStockDisponible aquí =============
    const stockDisponible = getStockDisponible(producto.id!)
    if (stockDisponible < cantidadNum) {
      toast.error(`Stock insuficiente. Disponible: ${stockDisponible}`)
      return
    }

    const productoExistente = detalles.find(d => d.producto.id === producto.id)
    
    if (productoExistente) {
      const nuevaCantidad = productoExistente.cantidad + cantidadNum
      if (nuevaCantidad > stockDisponible) {
        toast.error(`Stock insuficiente. Disponible: ${stockDisponible}`)
        return
      }
      onActualizarCantidad(productoExistente.id, nuevaCantidad)
      toast.success('Cantidad actualizada')
    } else {
      let listaNombre: string | undefined
      if (listaPrecioSeleccionada !== 'default') {
        const lista = listasDisponibles.find(l => l.lista.id.toString() === listaPrecioSeleccionada)
        listaNombre = lista?.lista.nombre
      }
      
      onAgregarDetalle(producto, cantidadNum, precioActual, listaNombre)
    }

    setProductoSeleccionado('')
    setCantidad('1')
    setListaPrecioSeleccionada('default')
    setListasDisponibles([])
  }

  const handleCantidadChange = (detalleId: string, nuevaCantidad: string) => {
    const cantidadNum = Number(nuevaCantidad)
    if (!isNaN(cantidadNum) && cantidadNum > 0) {
      const detalle = detalles.find(d => d.id === detalleId)
      if (detalle) {
        // ============= USAR getStockDisponible aquí =============
        const stockDisponible = getStockDisponible(detalle.producto.id!)
        const cantidadOriginal = detalle.cantidad
        const cantidadAdicional = cantidadNum - cantidadOriginal
        
        if (stockDisponible >= cantidadAdicional) {
          onActualizarCantidad(detalleId, cantidadNum)
        } else {
          toast.error(`Stock insuficiente. Disponible: ${stockDisponible + cantidadOriginal}`)
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <Label className="text-sm font-medium block">
          Agregar Productos a la Venta
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-7">
            <Label htmlFor="producto-combobox" className="text-xs mb-2 block">
              Producto
            </Label>
            <Popover open={openProducto} onOpenChange={setOpenProducto}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProducto}
                  className="w-full justify-between h-10"
                  id="producto-combobox"
                >
                  {productoActual
                    ? productoActual.nombre
                    : 'Seleccione un producto'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                <Command>
                  <CommandInput placeholder="Buscar producto por nombre o código..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron productos con stock disponible.</CommandEmpty>
                    <CommandGroup>
                      {/* ============= FILTRADOS: Solo productos con stock > 0 ============= */}
                      {productosConStock.map((producto) => {
                        const stockDisponible = getStockDisponible(producto.id!)
                        return (
                          <CommandItem
                            key={producto.id}
                            value={`${producto.nombre} ${producto.codigo || ''}`}
                            onSelect={() => {
                              setProductoSeleccionado(producto.id!.toString())
                              setOpenProducto(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                productoSeleccionado === producto.id?.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="font-medium">{producto.nombre}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  ${Number(producto.precio_venta || 0).toFixed(2)}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  stockDisponible > 10 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : stockDisponible > 0 
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  Stock: {stockDisponible}
                                </span>
                              </div>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-3">
            <Label htmlFor="cantidad" className="text-xs mb-2 block">
              Cantidad
            </Label>
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

        {productoActual && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">
                Seleccione el precio a aplicar
              </Label>
            </div>
            
            <RadioGroup 
              value={listaPrecioSeleccionada} 
              onValueChange={setListaPrecioSeleccionada}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="default" id="precio-default" />
                <Label 
                  htmlFor="precio-default" 
                  className="flex-1 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Precio de Venta</span>
                    <Badge variant="secondary" className="text-xs">Por defecto</Badge>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    ${Number(productoActual.precio_venta || 0).toFixed(2)}
                  </span>
                </Label>
              </div>

              {loadingListas ? (
                <div className="text-center text-sm text-muted-foreground py-2">
                  Cargando listas de precios...
                </div>
              ) : listasDisponibles.length > 0 ? (
                listasDisponibles.map(({ lista, precio }) => (
                  <div 
                    key={lista.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <RadioGroupItem value={lista.id.toString()} id={`lista-${lista.id}`} />
                    <Label 
                      htmlFor={`lista-${lista.id}`}
                      className="flex-1 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{lista.nombre}</span>
                        {lista.descripcion && (
                          <span className="text-xs text-muted-foreground">{lista.descripcion}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {precio < productoActual.precio_venta && (
                          <Badge variant="destructive" className="text-xs">
                            Descuento
                          </Badge>
                        )}
                        <span className="text-lg font-bold text-primary">
                          ${Number(precio).toFixed(2)}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-2 px-3 bg-muted/30 rounded-lg">
                  Este producto no está en ninguna lista de precios especial
                </div>
              )}
            </RadioGroup>

            <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Precio a aplicar:</span>
                <span className="text-xl font-bold text-primary">
                  ${Number(precioActual).toFixed(2)}
                </span>
              </div>
              {listaPrecioSeleccionada !== 'default' && (
                <div className="text-xs text-muted-foreground mt-1">
                  Con lista: {listasDisponibles.find(l => l.lista.id.toString() === listaPrecioSeleccionada)?.lista.nombre}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
                  <th className="text-left p-4 font-semibold text-sm">Lista de Precio</th>
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
                    <td className="p-4">
                      {detalle.lista_precio_nombre ? (
                        <Badge variant="outline" className="text-xs">
                          {detalle.lista_precio_nombre}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Precio Venta</span>
                      )}
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