import { z } from 'zod'

// 🔹 Schema del producto dentro de lista de precios
export const productoListaPrecioSchema = z.object({
  id: z.number(),
  codigo: z.string(),
  nombre: z.string(),
  precio: z.number().default(0), // Precio específico de la lista (si existe, por ahora igual a precio_venta)
  precio_venta: z.number().default(0), // Precio de venta predeterminado del producto
  marca: z
    .object({
      id: z.number(),
      nombre: z.string(),
    })
    .nullable()
    .optional(),
  categoria: z
    .object({
      id: z.number(),
      nombre: z.string(),
    })
    .nullable()
    .optional(),
  unidadMedida: z
    .object({
      id: z.number(),
      nombre: z.string(),
      sigla: z.string(),
    })
    .nullable()
    .optional(),
  estado: z.boolean(),
  stock: z.number().optional(),
})
export type ProductoListaPrecio = z.infer<typeof productoListaPrecioSchema>

// 🔹 Schema que refleja exactamente lo que envía el backend
export const listaPreciosBackendSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  estado: z.boolean(),
  empresa_id: z.number(),
  empresa: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
  productos: z.array(productoListaPrecioSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().optional().nullable(),
})
export type ListaPreciosBackend = z.infer<typeof listaPreciosBackendSchema>

// 🔹 Schema principal para frontend
export const listaPreciosSchema = listaPreciosBackendSchema
export type ListaPrecios = z.infer<typeof listaPreciosSchema>

// 🔹 Schema específico para formularios CON coerce - SIN empresa_id
export const listaPreciosFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  descripcion: z.string().optional(),
  estado: z.boolean(),
  productos: z.array(z.number()).optional(), // IDs de productos
})
export type ListaPreciosForm = z.infer<typeof listaPreciosFormSchema>

// 🔹 Schema para formulario de superadmin (CON empresa_id requerido)
export const listaPreciosFormSuperAdminSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  descripcion: z.string().optional(),
  estado: z.boolean(),
  empresa_id: z.coerce.number().min(1, 'Debe seleccionar una empresa'),
  productos: z.array(z.number()).optional(), // IDs de productos
})
export type ListaPreciosFormSuperAdmin = z.infer<typeof listaPreciosFormSuperAdminSchema>

// 🔹 Schema unificado para el formulario
export const listaPreciosFormUnifiedSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  descripcion: z.string().optional(),
  estado: z.boolean(),
  empresa_id: z.coerce.number().min(1, 'Debe seleccionar una empresa').optional(),
  productos: z.array(z.number()).optional(), // IDs de productos
})
export type ListaPreciosFormUnified = z.infer<typeof listaPreciosFormUnifiedSchema>

// 🔹 Función auxiliar para mapear backend a frontend
export function mapBackendListaPreciosToFrontend(backend: ListaPreciosBackend): ListaPrecios {
  return {
    ...backend,
  }
}
