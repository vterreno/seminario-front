import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import apiProductoProveedorService, { ProductoProveedor } from '@/service/apiProductoProveedor.service'
import apiProductosService from '@/service/apiProductos.service'
import { Producto } from '@/features/productos/data/schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProductoProveedorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedorId: number
  producto: ProductoProveedor | null
  onSuccess: () => void
}

export function ProductoProveedorDialog({
  open,
  onOpenChange,
  proveedorId,
  producto,
  onSuccess,
}: ProductoProveedorDialogProps) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [selectedProductoId, setSelectedProductoId] = useState<string>('')
  const [precioProveedor, setPrecioProveedor] = useState('')
  const [codigoProveedor, setCodigoProveedor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      loadProductos()
      if (producto) {
        setSelectedProductoId(producto.producto_id.toString())
        setPrecioProveedor(producto.precio_proveedor.toString())
        setCodigoProveedor(producto.codigo_proveedor || '')
      } else {
        resetForm()
      }
    }
  }, [open, producto])

  const loadProductos = async () => {
    try {
      const data = await apiProductosService.getAllProductos()
      setProductos(data.filter(p => p.estado))
    } catch (error) {
      console.error('Error al cargar productos:', error)
      toast.error('Error al cargar productos')
    }
  }

  const resetForm = () => {
    setSelectedProductoId('')
    setPrecioProveedor('')
    setCodigoProveedor('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProductoId) {
      toast.error('Debe seleccionar un producto')
      return
    }

    if (!precioProveedor || Number(precioProveedor) <= 0) {
      toast.error('Debe ingresar un precio válido')
      return
    }

    setSubmitting(true)
    try {
      if (producto) {
        // Actualizar
        await apiProductoProveedorService.update(producto.id, {
          precio_proveedor: Number(precioProveedor),
          codigo_proveedor: codigoProveedor || undefined,
        })
        toast.success('Producto actualizado correctamente')
      } else {
        // Crear
        await apiProductoProveedorService.create({
          producto_id: Number(selectedProductoId),
          proveedor_id: proveedorId,
          precio_proveedor: Number(precioProveedor),
          codigo_proveedor: codigoProveedor || undefined,
        })
        toast.success('Producto agregado correctamente')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error al guardar:', error)
      toast.error(error?.response?.data?.message || 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {producto ? 'Editar Producto' : 'Agregar Producto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='producto'>Producto *</Label>
            <Select
              value={selectedProductoId}
              onValueChange={setSelectedProductoId}
              disabled={!!producto}
            >
              <SelectTrigger id='producto'>
                <SelectValue placeholder='Seleccione un producto' />
              </SelectTrigger>
              <SelectContent>
                {productos.map((p) => (
                  <SelectItem key={p.id} value={p.id!.toString()}>
                    {p.codigo} - {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='precio'>Precio Proveedor *</Label>
            <Input
              id='precio'
              type='number'
              step='0.01'
              min='0'
              value={precioProveedor}
              onChange={(e) => setPrecioProveedor(e.target.value)}
              placeholder='0.00'
              required
            />
          </div>

          <div>
            <Label htmlFor='codigo'>Código Proveedor</Label>
            <Input
              id='codigo'
              type='text'
              value={codigoProveedor}
              onChange={(e) => setCodigoProveedor(e.target.value)}
              placeholder='Código opcional del proveedor'
            />
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
