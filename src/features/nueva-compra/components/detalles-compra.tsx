import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Plus } from 'lucide-react'
import { DetallesCompraProps } from '../types'
import { Producto } from '@/features/productos/data/schema'

const IVA_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 10.5, label: '10.5%' },
  { value: 21, label: '21%' },
  { value: 27, label: '27%' },
]

export function DetallesCompra({
  productos,
  detalles,
  onAgregarDetalle,
  onEliminarDetalle,
  onActualizarCantidad,
  onActualizarCosto,
  onActualizarIva,
}: DetallesCompraProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState<number>(1)
  const [costoUnitario, setCostoUnitario] = useState<number>(0)
  const [ivaPorcentaje, setIvaPorcentaje] = useState<number>(21)

  const handleAgregar = () => {
    if (!productoSeleccionado || cantidad <= 0 || costoUnitario <= 0) {
      return
    }

    onAgregarDetalle(productoSeleccionado, cantidad, costoUnitario, ivaPorcentaje)
    
    // Resetear formulario
    setProductoSeleccionado(null)
    setCantidad(1)
    setCostoUnitario(0)
    setIvaPorcentaje(21)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Formulario de agregar producto - Mejorado */}
          <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Producto a la Compra
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <Label htmlFor="producto" className="text-sm font-medium">
                  Producto *
                </Label>
                <Select
                  value={productoSeleccionado?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const producto = productos.find((p) => p.id?.toString() === value)
                    setProductoSeleccionado(producto || null)
                    // Autocompletar con el precio de costo del producto
                    if (producto?.precio_costo) {
                      setCostoUnitario(Number(producto.precio_costo))
                    }
                  }}
                >
                  <SelectTrigger id="producto" className="mt-1">
                    <SelectValue placeholder="Seleccione un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id?.toString() || ''}>
                        <div className="flex flex-col">
                          <span className="font-medium">{producto.nombre}</span>
                          <span className="text-xs text-muted-foreground">Código: {producto.codigo}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cantidad" className="text-sm font-medium">
                  Cantidad *
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="mt-1"
                  placeholder="1"
                />
              </div>

              <div>
                <Label htmlFor="costo" className="text-sm font-medium">
                  Costo Unitario *
                </Label>
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(Number(e.target.value))}
                  placeholder="0.00"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-0.5">Sin IVA</p>
              </div>

              <div>
                <Label htmlFor="iva" className="text-sm font-medium">
                  IVA % *
                </Label>
                <Select
                  value={ivaPorcentaje.toString()}
                  onValueChange={(value) => setIvaPorcentaje(Number(value))}
                >
                  <SelectTrigger id="iva" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IVA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAgregar}
                  disabled={!productoSeleccionado || cantidad <= 0 || costoUnitario <= 0}
                  className="w-full h-10"
                  size="default"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla de detalles */}
          {detalles.length > 0 && (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Producto</TableHead>
                    <TableHead className="text-center min-w-[100px]">Cantidad</TableHead>
                    <TableHead className="text-right min-w-[120px]">Costo Unit.</TableHead>
                    <TableHead className="text-center min-w-[100px]">IVA %</TableHead>
                    <TableHead className="text-right min-w-[100px]">IVA $</TableHead>
                    <TableHead className="text-right min-w-[120px]">Subtotal</TableHead>
                    <TableHead className="text-right min-w-[120px]">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((detalle) => (
                    <TableRow key={detalle.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{detalle.producto.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {detalle.producto.codigo}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="1"
                          value={detalle.cantidad}
                          onChange={(e) =>
                            onActualizarCantidad(detalle.id, Number(e.target.value))
                          }
                          className="w-20 text-center"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detalle.costo_unitario}
                          onChange={(e) =>
                            onActualizarCosto(detalle.id, Number(e.target.value))
                          }
                          className="w-24 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Select
                          value={detalle.iva_porcentaje.toString()}
                          onValueChange={(value) =>
                            onActualizarIva(detalle.id, Number(value))
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {IVA_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detalle.iva_monto)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detalle.subtotal)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(detalle.total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEliminarDetalle(detalle.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {detalles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay productos agregados. Seleccione un producto y presione "Agregar".
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
