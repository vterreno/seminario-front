import { createFileRoute } from '@tanstack/react-router'
import { ProductosProveedor } from '@/features/productos-proveedor'

export const Route = createFileRoute('/_authenticated/productos-proveedor/$proveedorId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { proveedorId } = Route.useParams()
  
  return <ProductosProveedor proveedorId={parseInt(proveedorId)} />
}
