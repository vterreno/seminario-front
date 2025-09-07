import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Sucursales } from '@/features/sucursales'

const searchSchema = z.object({
  page: z.number().min(1).catch(1),
  pageSize: z.number().min(1).max(100).catch(10),
  nombre: z.string().optional(),
  direccion: z.string().optional(),
  estado: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/settings/sucursales')({
  component: Sucursales,
  validateSearch: searchSchema,
})
