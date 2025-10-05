import { UnidadesMedida } from '@/features/unidades-medida';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/unidades-medida/')({
    component: () => <UnidadesMedida />,
})