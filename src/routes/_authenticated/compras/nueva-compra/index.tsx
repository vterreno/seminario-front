import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/compras/nueva-compra/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/compras/nueva-compra/"!</div>
}
