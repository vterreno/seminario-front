import { UnidadesMedida } from '@/features/unidades-medida'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const unidadesMedidaSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),

  // Filtros
  nombre: z.string().optional().catch(''),
  abreviatura: z.string().optional().catch(''),
  aceptaDecimales: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/unidades-medida/')({
  validateSearch: unidadesMedidaSearchSchema,
  component: UnidadesMedida,
})