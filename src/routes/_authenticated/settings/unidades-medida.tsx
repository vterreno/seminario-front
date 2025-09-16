import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/settings/unidades-medida',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/settings/unidades-medida"!</div>
}
