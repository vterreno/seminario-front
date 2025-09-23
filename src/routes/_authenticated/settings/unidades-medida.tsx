import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { UnidadesMedida } from '@/features/unidades-medida'

const unidadMedidaSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(10),
  nombre: z.string().optional().catch(''),
  abreviatura: z.string().optional().catch(''),
  aceptaDecimales: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute(
  '/_authenticated/settings/unidades-medida',
)({
  validateSearch: unidadMedidaSearchSchema,
  component: UnidadesMedida,
})
