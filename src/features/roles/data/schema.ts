import { z } from 'zod'

// Definición de la estructura de permisos que viene del backend
export const permissionsSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type Permissions = z.infer<typeof permissionsSchema>

// Schema para la empresa asociada al rol
export const empresaRoleSchema = z.object({
  id: z.number(),
  nombre: z.string(),
}).optional()

// Schema principal del rol
export const roleSchema = z.object({
  id: z.number().optional(),
  nombre: z.string(),
  empresa_id: z.number(),
  empresa: empresaRoleSchema,
  permisos: z.array(permissionsSchema),
  estado: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Role = z.infer<typeof roleSchema>

// Schema para el formulario
export const roleFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  empresa_id: z.number().optional(),
  permisos: z.array(permissionsSchema).optional().default([]),
  estado: z.boolean().optional().default(true),
  isEdit: z.boolean().optional().default(false),
}).refine((data) => {
  // Validar que empresa_id esté definida cuando se envía el formulario
  return data.empresa_id !== undefined && data.empresa_id > 0;
}, {
  message: 'Debe seleccionar una empresa',
  path: ['empresa_id'],
})

export type RoleForm = z.infer<typeof roleFormSchema>

export type PermissionKey = keyof Permissions
