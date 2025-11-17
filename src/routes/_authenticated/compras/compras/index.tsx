import { Compras } from '@/features/compras'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/compras/compras/')({
  component: Compras,
})

