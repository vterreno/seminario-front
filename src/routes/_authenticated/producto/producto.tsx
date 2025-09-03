import { createFileRoute } from '@tanstack/react-router'
import z from 'zod';

export const empresaSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
});
export const Route = createFileRoute('/_authenticated/producto/producto')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/producto/producto"!</div>
}
