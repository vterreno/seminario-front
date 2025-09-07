import { z } from 'zod'

// Schema principal de la sucursal
export const sucursalSchema = z.object({
  id: z.number().optional(),
  nombre: z.string(),
  codigo: z.string(),
  direccion: z.string(),
  estado: z.boolean(),
  empresa_id: z.number().optional(),
  empresa: z.object({
    id: z.number(),
    name: z.string(),
    estado: z.boolean(),
  }).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Sucursal = z.infer<typeof sucursalSchema>

// Schema para el formulario
export const sucursalFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres').max(20, 'El código no puede exceder 20 caracteres'),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(200, 'La dirección no puede exceder 200 caracteres'),
  estado: z.boolean(),
  empresa_id: z.number().optional(),
  isEdit: z.boolean(),
})

export type SucursalForm = z.infer<typeof sucursalFormSchema>
