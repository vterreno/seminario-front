import { createFileRoute } from '@tanstack/react-router'
import { ListasPreciosPage } from '@/features/lista-precios'

export const Route = createFileRoute('/_authenticated/ventas/lista-precios/')({
  component: ListasPreciosPage,
})
