import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'
import apiContactosService, { Contacto } from '@/service/apiContactos.service'
import apiProductoProveedorService, { ProductoProveedor } from '@/service/apiProductoProveedor.service'
import { ProductosProveedorTable } from './components/productos-proveedor-table'
import { ProductoProveedorDialog } from './components/producto-proveedor-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'

export function ProductosProveedor({ proveedorId }: { proveedorId: number }) {
  const navigate = useNavigate()
  const [proveedor, setProveedor] = useState<Contacto | null>(null)
  const [productos, setProductos] = useState<ProductoProveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<ProductoProveedor | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [productoToDelete, setProductoToDelete] = useState<ProductoProveedor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [proveedorData, productosData] = await Promise.all([
        apiContactosService.getContactoById(proveedorId),
        apiProductoProveedorService.getProductosByProveedor(proveedorId),
      ])
      setProveedor(proveedorData)
      setProductos(productosData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [proveedorId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEdit = (producto: ProductoProveedor) => {
    setSelectedProducto(producto)
    setOpenDialog(true)
  }

  const handleDelete = (producto: ProductoProveedor) => {
    setProductoToDelete(producto)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!productoToDelete) return

    setIsDeleting(true)
    try {
      await apiProductoProveedorService.delete(productoToDelete.id)
      toast.success('Producto eliminado del proveedor')
      await loadData()
      setConfirmDeleteOpen(false)
      setProductoToDelete(null)
    } catch (error: any) {
      console.error('Error al eliminar:', error)
      toast.error(error?.response?.data?.message || 'Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddNew = () => {
    setSelectedProducto(null)
    setOpenDialog(true)
  }

  if (loading) {
    return (
      <Main>
        <div className="flex items-center justify-center h-full">
          <p>Cargando...</p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6'>
          <Button
            variant='ghost'
            onClick={() => navigate({ to: '/contactos' })}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a Contactos
          </Button>

          <div className='flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Productos de {proveedor?.nombre_razon_social}
              </h2>
              <p className='text-muted-foreground'>
                Gestione los productos y precios ofrecidos por este proveedor
              </p>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className='mr-2 h-4 w-4' />
              Agregar Producto
            </Button>
          </div>
        </div>

        <ProductosProveedorTable
          data={productos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <ProductoProveedorDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          proveedorId={proveedorId}
          producto={selectedProducto}
          onSuccess={loadData}
        />

        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Confirmar eliminación"
          desc={`¿Está seguro que desea eliminar "${productoToDelete?.producto?.nombre}" de este proveedor? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          destructive
          isLoading={isDeleting}
          handleConfirm={confirmDelete}
        />
      </Main>
    </>
  )
}
