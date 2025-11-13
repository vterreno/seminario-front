import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import apiMarcasService from '@/service/apiMarcas.service'
import apiCategoriasService from '@/service/apiCategorias.service'
import apiUnidadesMedidaService from '@/service/apiUnidadesMedida.service'

interface NuevoProductoProveedorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedorId: number
  onSuccess: (productoData: any) => void
}

export function NuevoProductoProveedorDialog({
  open,
  onOpenChange,
  proveedorId,
  onSuccess,
}: NuevoProductoProveedorDialogProps) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [marcaId, setMarcaId] = useState<string>('')
  const [categoriaId, setCategoriaId] = useState<string>('')
  const [unidadMedidaId, setUnidadMedidaId] = useState<string>('')
  const [precioProveedor, setPrecioProveedor] = useState('')
  const [codigoProveedor, setCodigoProveedor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [marcas, setMarcas] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      loadData()
      resetForm()
    }
  }, [open])

  const loadData = async () => {
    try {
      const [marcasData, categoriasData, unidadesData] = await Promise.all([
        apiMarcasService.getAllMarcas(),
        apiCategoriasService.getAllCategorias(),
        apiUnidadesMedidaService.getAllUnidadesMedida(),
      ])
      setMarcas(marcasData.filter((m: any) => m.estado))
      setCategorias(categoriasData.filter((c: any) => c.estado))
      setUnidadesMedida(unidadesData.filter((u: any) => u.estado))
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  const resetForm = () => {
    setCodigo('')
    setNombre('')
    setMarcaId('')
    setCategoriaId('')
    setUnidadMedidaId('')
    setPrecioProveedor('')
    setCodigoProveedor('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo.trim()) {
      toast.error('El código es requerido')
      return
    }

    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!precioProveedor || Number(precioProveedor) <= 0) {
      toast.error('Debe ingresar un precio válido del proveedor')
      return
    }

    setSubmitting(true)
    try {
      // Preparar los datos del nuevo producto
      const nuevoProductoData = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        marca_id: marcaId ? Number(marcaId) : null,
        categoria_id: categoriaId ? Number(categoriaId) : null,
        unidad_medida_id: unidadMedidaId ? Number(unidadMedidaId) : null,
        precio_proveedor: Number(precioProveedor),
        codigo_proveedor: codigoProveedor.trim() || undefined,
        proveedor_id: proveedorId,
      }

      onSuccess(nuevoProductoData)
      onOpenChange(false)
      toast.success('Producto agregado al proveedor. Se creará en el stock al registrar la compra.')
    } catch (error: any) {
      console.error('Error al guardar:', error)
      toast.error('Error al guardar el producto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Nuevo Producto del Proveedor</DialogTitle>
          <p className='text-sm text-muted-foreground'>
            Este producto se agregará al catálogo del proveedor y se creará en el stock al registrar la compra
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='codigo'>Código *</Label>
              <Input
                id='codigo'
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder='Ej: PROD001'
                required
              />
            </div>

            <div>
              <Label htmlFor='nombre'>Nombre *</Label>
              <Input
                id='nombre'
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder='Ej: Producto X'
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <Label htmlFor='marca'>Marca</Label>
              <Select value={marcaId} onValueChange={setMarcaId}>
                <SelectTrigger id='marca'>
                  <SelectValue placeholder='Seleccionar' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Sin marca</SelectItem>
                  {marcas.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='categoria'>Categoría</Label>
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger id='categoria'>
                  <SelectValue placeholder='Seleccionar' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Sin categoría</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='unidad'>Unidad de Medida</Label>
              <Select value={unidadMedidaId} onValueChange={setUnidadMedidaId}>
                <SelectTrigger id='unidad'>
                  <SelectValue placeholder='Seleccionar' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Sin unidad</SelectItem>
                  {unidadesMedida.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.nombre} ({u.abreviatura})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='precioProveedor'>Precio Proveedor *</Label>
              <Input
                id='precioProveedor'
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
              <Label htmlFor='codigoProveedor'>Código del Proveedor</Label>
              <Input
                id='codigoProveedor'
                value={codigoProveedor}
                onChange={(e) => setCodigoProveedor(e.target.value)}
                placeholder='Código opcional'
              />
            </div>
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
              {submitting ? 'Guardando...' : 'Agregar Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
