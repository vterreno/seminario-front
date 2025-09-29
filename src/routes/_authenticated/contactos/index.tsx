import { Contactos } from '@/features/contactos'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const contactosSearchSchema = z.object({
  q: z.string().optional().catch(''),
  estado: z.enum(['activos','inactivos','todos']).optional().catch('activos')
})

export const Route = createFileRoute('/_authenticated/contactos/')({
  validateSearch: contactosSearchSchema,
  component: Contactos,
})

