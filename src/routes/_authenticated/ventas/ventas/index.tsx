import { Ventas } from '@/features/ventas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ventas/ventas/')({
  component: Ventas,
})


