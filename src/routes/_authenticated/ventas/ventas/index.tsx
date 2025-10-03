import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ventas/ventas/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/venta/venta/"!</div>
}
