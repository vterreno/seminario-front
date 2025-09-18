import { z } from 'zod'

// Schema principal de la categoria
export const CategoriaSchema = z.object({
  id: z.number().optional(),
  nombre: z.string(),
  descripcion: z.string(),
  estado: z.boolean(),
  empresa_id: z.number(),
  empresa: z.object({
    id: z.number(),
    name: z.string(), 
  }),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Categoria = z.infer<typeof CategoriaSchema>

// Schema para el formulario
export const CategoriaFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').max(200, 'La descripción no puede exceder 200 caracteres'),
  estado: z.boolean().optional().default(true),
  empresa_id: z.number().optional(),
  isEdit: z.boolean(),
})

export type CategoriaForm = z.infer<typeof CategoriaFormSchema>
