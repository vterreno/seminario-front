import { UnidadesMedida } from '@/features/unidades-medida';
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod';

export const unidadMedidaSearchSchema = z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(10),

    // Filtros opcionales
    nombre: z.string().optional().catch(''),               // nombre de la unidad de medida
    abreviatura: z.string().optional().catch(''),          // abreviatura de la unidad de medida
});

export type UnidadMedidaSearchParams = z.infer<typeof unidadMedidaSearchSchema>;

export const Route = createFileRoute('/_authenticated/unidades-medida/')({
    component: () => <UnidadesMedida />,
    validateSearch: unidadMedidaSearchSchema,
})