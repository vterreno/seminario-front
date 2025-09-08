import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  apellido: z.string(),
  email: z.string(),
  status: z.boolean(),
  role: z.object({
    id: z.number(),
    nombre: z.string(),
  }).optional(),
  empresa: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

// Form schema for creating/updating users
export const userFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  role_id: z.number().optional(),
  empresa_id: z.number().optional(),
  status: z.boolean().optional(),
})

export type UserForm = z.infer<typeof userFormSchema>
