import { z } from 'zod'

// ============================================
// SCHEMAS DE ENTIDADES RELACIONADAS
// ============================================

// Schema de Producto (simplificado para la compra)
export const ProductoSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string(),
  precio_venta: z.number().optional(),
  precio_costo: z.number().optional(),
  stock: z.number().optional(),
  estado: z.boolean().optional(),
  empresa_id: z.number().optional().nullable(),
  marca_id: z.number().optional().nullable(),
})

export type Producto = z.infer<typeof ProductoSchema>

// Schema de Contacto (simplificado)
export const ContactoSchema = z.object({
  id: z.number(),
  nombre: z.string().optional().nullable(),
  apellido: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  razon_social: z.string().optional().nullable(),
  nombre_razon_social: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Contacto = z.infer<typeof ContactoSchema>

// Schema de Sucursal (simplificado)
export const SucursalSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  empresa_id: z.number().optional(),
  estado: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Sucursal = z.infer<typeof SucursalSchema>

// ============================================
// SCHEMAS DE ESTADO COMPRA
// ============================================

export const EstadoCompraEnum = z.enum(['pendiente_pago', 'pagada', 'cancelada'])
export type EstadoCompra = z.infer<typeof EstadoCompraEnum>

// ============================================
// SCHEMAS DE DETALLE COMPRA
// ============================================

// Schema principal de Detalle Compra
export const DetalleCompraSchema = z.object({
  id: z.number().optional(),
  producto_id: z.number(),
  producto: z.object({
    producto: ProductoSchema.optional()
  }).optional(),
  cantidad: z.number(),
  precio_unitario: z.number(),
  subtotal: z.number(),
  compra_id: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type DetalleCompra = z.infer<typeof DetalleCompraSchema>

// Schema para el formulario de Detalle Compra
export const DetalleCompraFormSchema = z.object({
  producto_id: z.number().positive('El producto es requerido'),
  cantidad: z.number()
    .positive('La cantidad debe ser mayor a 0')
    .int('La cantidad debe ser un número entero'),
  precio_unitario: z.number()
    .positive('El precio unitario debe ser mayor a 0'),
  subtotal: z.number()
    .positive('El subtotal debe ser mayor a 0'),
})

export type DetalleCompraForm = z.infer<typeof DetalleCompraFormSchema>

// ============================================
// SCHEMAS DE COMPRA
// ============================================

// Schema principal de Compra
export const CompraSchema = z.object({
  id: z.number().optional(),
  numero_compra: z.number(),
  fecha_compra: z.string().or(z.date()),
  detalles: z.array(DetalleCompraSchema).optional(),
  monto_total: z.number(),
  contacto_id: z.number().optional().nullable(),
  contacto: ContactoSchema.optional().nullable(),
  sucursal_id: z.number().optional(),
  sucursal: SucursalSchema.optional(),
  estado: z.string(), // Acepta cualquier string del backend
  numero_factura: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Compra = z.infer<typeof CompraSchema>

// Schema para el formulario de Compra (Create)
// Nota: numero_compra se genera automáticamente en el backend
export const CompraFormSchema = z.object({
  fecha_compra: z.string().min(1, 'La fecha de compra es requerida'),
  detalles: z.array(DetalleCompraFormSchema)
    .min(1, 'Debe agregar al menos un detalle de compra'),
  monto_total: z.number()
    .positive('El monto total debe ser mayor a 0'),
  contacto_id: z.number().positive('El contacto es requerido'),
  sucursal_id: z.number().positive('La sucursal es requerida'),
  estado: EstadoCompraEnum,
  numero_factura: z.string().optional(),
  observaciones: z.string().optional(),
})

export type CompraForm = z.infer<typeof CompraFormSchema>

// Schema para actualizar Compra
export const UpdateCompraFormSchema = CompraFormSchema.partial()

export type UpdateCompraForm = z.infer<typeof UpdateCompraFormSchema>

// ============================================
// VALIDACIONES ADICIONALES
// ============================================

// Validación personalizada para verificar que el subtotal sea correcto
export const validateSubtotal = (detalle: DetalleCompraForm): boolean => {
  const calculatedSubtotal = detalle.cantidad * detalle.precio_unitario
  return Math.abs(calculatedSubtotal - detalle.subtotal) < 0.01 // Tolerancia para decimales
}

// Validación personalizada para verificar que el monto total sea correcto
export const validateMontoTotal = (compra: CompraForm): boolean => {
  const calculatedTotal = compra.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)
  return Math.abs(calculatedTotal - compra.monto_total) < 0.01 // Tolerancia para decimales
}

// Schema con validaciones adicionales completas
export const CompraFormSchemaCompleto = CompraFormSchema.refine(
  (data) => {
    // Validar todos los subtotales
    return data.detalles.every(detalle => validateSubtotal(detalle))
  },
  {
    message: 'Uno o más subtotales no coinciden con cantidad × precio unitario',
    path: ['detalles'],
  }
).refine(
  (data) => validateMontoTotal(data),
  {
    message: 'El monto total no coincide con la suma de los detalles',
    path: ['monto_total'],
  }
)

export type CompraFormCompleto = z.infer<typeof CompraFormSchemaCompleto>
