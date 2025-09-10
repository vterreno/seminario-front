import Bienvenida from '@/features/bienvenida'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/bienvenida')({
    component: RouteComponent,
})

function RouteComponent() {
    return <Bienvenida />
}