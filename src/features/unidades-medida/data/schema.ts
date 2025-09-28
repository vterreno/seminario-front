import { z } from 'zod'

export const unidadMedidaStatusSchema = z.enum(['active', 'inactive'])
export type UnidadMedidaStatus = z.infer<typeof unidadMedidaStatusSchema>

export const unidadMedidaSchema = z.object({
  id: z.number().optional(),
  nombre: z.string(),
  abreviatura: z.string(),
  aceptaDecimales: z.boolean(),
  empresa_id: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type UnidadMedida = z.infer<typeof unidadMedidaSchema>

export const unidadMedidaFormSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  abreviatura: z.string()
    .min(1, 'La abreviatura es obligatoria')
    .max(10, 'La abreviatura no puede exceder 10 caracteres'),
  aceptaDecimales: z.boolean().optional().default(false),
  isEdit: z.boolean().optional().default(false),
})

export type UnidadMedidaForm = z.infer<typeof unidadMedidaFormSchema>