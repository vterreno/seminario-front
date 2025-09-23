import { createFileRoute } from '@tanstack/react-router'
import { Marcas } from '@/features/marcas'

export const Route = createFileRoute('/_authenticated/productos/marcas/')({
    component: Marcas,
})
