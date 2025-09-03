import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/compras/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/compras/"!</div>
}
