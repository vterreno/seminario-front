import { createFileRoute } from '@tanstack/react-router'
import { Productos } from '@/features/productos'

export const Route = createFileRoute('/_authenticated/productos/productos/')({
    component: Productos,
})
