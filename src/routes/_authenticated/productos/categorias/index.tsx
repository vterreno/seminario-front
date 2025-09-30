import { createFileRoute } from '@tanstack/react-router'
import { Categorias } from '@/features/categorias'

export const Route = createFileRoute('/_authenticated/productos/categorias/')({
  component: Categorias,
})


