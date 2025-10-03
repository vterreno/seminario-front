import { z } from 'zod'

export const unidadMedidaStatusSchema = z.enum(['active', 'inactive'])
export type UnidadMedidaStatus = z.infer<typeof unidadMedidaStatusSchema>

export const empresaSchema = z.object({
  id: z.number(),
  name: z.string(),
  estado: z.boolean(),
})

export type Empresa = z.infer<typeof empresaSchema>

export const unidadMedidaSchema = z.object({
  id: z.number().optional(),
  nombre: z.string(),
  abreviatura: z.string(),
  aceptaDecimales: z.boolean(),
  estado: z.boolean(),
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
  aceptaDecimales: z.boolean(),
  empresa_id: z.number().min(1, 'Debe seleccionar una empresa'),
  estado: z.boolean(),
  isEdit: z.boolean(),
})

export type UnidadMedidaForm = {
  nombre: string;
  abreviatura: string;
  aceptaDecimales: boolean;
  empresa_id: number;
  estado: boolean;
  isEdit: boolean;
}