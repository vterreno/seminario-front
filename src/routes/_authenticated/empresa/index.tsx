import { Empresa } from '@/features/empresa';
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'


export const empresaSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),

  // Filtros por nombre y estado
  name: z.string().optional().catch(''),      // nombre de la empresa
  estado: z.boolean().optional().catch(true), // estado activo/inactivo
});

export const Route = createFileRoute('/_authenticated/empresa/')({
  validateSearch: empresaSearchSchema,
  component: Empresa,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/empresa/"!</div>
}
