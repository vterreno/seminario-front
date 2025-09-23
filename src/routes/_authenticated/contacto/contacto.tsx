import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/contacto/contacto')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/contacto/contacto"!</div>
}
