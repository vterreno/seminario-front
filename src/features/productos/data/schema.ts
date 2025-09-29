import { z } from 'zod'

// 🔹 Schema que refleja exactamente lo que envía el backend
export const productoBackendSchema = z.object({
  id: z.number(),
  codigo: z.string(),
  nombre: z.string(),
  empresa_id: z.number(),
  empresa: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
  marca_id: z.number().nullable().optional(),
  marca: z
    .object({
      id: z.number(),
      nombre: z.string(),
    })
    .nullable()
    .optional(),
  categoria_id: z.number().nullable().optional(),
  categoria: z
    .object({
      id: z.number(),
      nombre: z.string(),
    })
    .nullable()
    .optional(),
  unidad_medida_id: z.number().nullable().optional(),
  unidadMedida: z
    .object({
      id: z.number(),
      nombre: z.string(),
      sigla: z.string(),
    })
    .nullable()
    .optional(),
  precio_costo: z.number(),
  precio_venta: z.number(),
  stock_apertura: z.number(),
  stock: z.number(),
  estado: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().optional().nullable(),
})
export type ProductoBackend = z.infer<typeof productoBackendSchema>

// 🔹 Schema principal para frontend
export const productoSchema = productoBackendSchema
export type Producto = z.infer<typeof productoSchema>

// 🔹 Schema específico para formularios CON coerce - SIN empresa_id
export const productoFormSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(50),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  marca_id: z.number().nullable().optional(),
  categoria_id: z.number().nullable().optional(),
  unidad_medida_id: z.number().nullable().optional(),
  precio_costo: z.coerce.number().min(0, 'Debe ser >= 0'),
  precio_venta: z.coerce.number().min(0, 'Debe ser >= 0'),
  stock_apertura: z.coerce.number().min(0, 'Debe ser >= 0'),
  stock: z.coerce.number().min(0, 'Debe ser >= 0'),
  estado: z.boolean(),
})
export type ProductoForm = z.infer<typeof productoFormSchema>

// 🔹 Schema para formulario de superadmin (CON empresa_id requerido)
export const productoFormSuperAdminSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(50),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  marca_id: z.number().nullable().optional(),
  categoria_id: z.number().nullable().optional(),
  unidad_medida_id: z.number().nullable().optional(),
  precio_costo: z.coerce.number().min(0, 'Debe ser >= 0'),
  precio_venta: z.coerce.number().min(0, 'Debe ser >= 0'),
  stock_apertura: z.coerce.number().min(0, 'Debe ser >= 0'),
  stock: z.coerce.number().min(0, 'Debe ser >= 0'),
  estado: z.boolean(),
  empresa_id: z.coerce.number().min(1, 'Debe seleccionar una empresa'),
})
export type ProductoFormSuperAdmin = z.infer<typeof productoFormSuperAdminSchema>

// 🔹 Schema unificado para el formulario
export const productoFormUnifiedSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(50),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  marca_id: z.number().nullable().optional(),
  categoria_id: z.number().nullable().optional(),
  unidad_medida_id: z.number().nullable().optional(),
  precio_costo: z.coerce.number().min(0, 'Debe ser >= 0'),
  precio_venta: z.coerce.number().min(0, 'Debe ser >= 0'),
  stock_apertura: z.coerce.number().min(0, 'Debe ser >= 0'),
  stock: z.coerce.number().min(0, 'Debe ser >= 0'),
  estado: z.boolean(),
  empresa_id: z.coerce.number().min(1, 'Debe seleccionar una empresa').optional(),
})
export type ProductoFormUnified = z.infer<typeof productoFormUnifiedSchema>

// 🔹 Schemas para crear/actualizar desde API (SIN coerce)
export const createProductoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(50),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  marca_id: z.number().nullable().optional(),
  categoria_id: z.number().nullable().optional(),
  unidad_medida_id: z.number().nullable().optional(),
  precio_costo: z.number().min(0, 'Debe ser >= 0'),
  precio_venta: z.number().min(0, 'Debe ser >= 0'),
  stock_apertura: z.number().min(0, 'Debe ser >= 0'),
  stock: z.number().min(0, 'Debe ser >= 0'),
  estado: z.boolean(),
  empresa_id: z.number().min(1, 'Debe seleccionar una empresa'),
})
export type CreateProducto = z.infer<typeof createProductoSchema>

export const updateProductoSchema = z.object({
  id: z.number(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  marca_id: z.number().nullable().optional(),
  categoria_id: z.number().nullable().optional(),
  unidad_medida_id: z.number().nullable().optional(),
  precio_costo: z.number().min(0, 'Debe ser >= 0'),
  precio_venta: z.number().min(0, 'Debe ser >= 0'),
  estado: z.boolean(),
  empresa_id: z.number().min(1, 'Debe seleccionar una empresa'),
})
export type UpdateProducto = z.infer<typeof updateProductoSchema>

// ✅ Validadores
export const validateProducto = (data: unknown): Producto => productoSchema.parse(data)
export const validateProductoBackend = (data: unknown): ProductoBackend =>
  productoBackendSchema.parse(data)
export const validateProductoForm = (data: unknown): ProductoForm =>
  productoFormSchema.parse(data)
export const validateCreateProducto = (data: unknown): CreateProducto =>
  createProductoSchema.parse(data)
export const validateUpdateProducto = (data: unknown): UpdateProducto =>
  updateProductoSchema.parse(data)

// ✅ Mapeos
export const mapBackendProductoToFrontend = (b: ProductoBackend): Producto => ({
  ...b,
  empresa: b.empresa
    ? { id: b.empresa.id, name: b.empresa.name }
    : undefined,
})

export const mapFrontendProductoToBackend = (f: Producto): ProductoBackend => ({ ...f })

// ✅ Utilidades
export const isProductoActivo = (p: Producto): boolean =>
  p.estado && !p.deleted_at

export const formatProductoCreationDate = (p: Producto): string =>
  new Date(p.created_at).toLocaleDateString('es-ES')

