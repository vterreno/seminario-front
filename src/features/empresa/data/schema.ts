import { z } from 'zod'

export const empresaStatusSchema = z.enum(['active', 'inactive'])
export type EmpresaStatus = z.infer<typeof empresaStatusSchema>

export const empresaSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  estado: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Empresa = z.infer<typeof empresaSchema>

export const empresaFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  estado: z.boolean().optional().default(true),
  isEdit: z.boolean().optional().default(false),
})

export type EmpresaForm = z.infer<typeof empresaFormSchema>
