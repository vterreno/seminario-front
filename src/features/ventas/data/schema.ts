import { z } from 'zod'

// ============================================
// SCHEMAS DE ENTIDADES RELACIONADAS
// ============================================

// Schema de Producto (simplificado para la venta)
export const ProductoSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string(),
  precio_venta: z.number(),
  precio_costo: z.number(),
  stock: z.number(),
  estado: z.boolean(),
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
  nombre_razon_social: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Contacto = z.infer<typeof ContactoSchema>

// Schema de Empresa (simplificado)
export const EmpresaSchema = z.object({
  id: z.number(),
  name: z.string(),
  estado: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Empresa = z.infer<typeof EmpresaSchema>

// Schema de Sucursal (simplificado)
export const SucursalSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  empresa_id: z.number().optional(),
  empresa: EmpresaSchema.optional(),
  estado: z.boolean().optional(),
  numero_venta: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Sucursal = z.infer<typeof SucursalSchema>

// ============================================
// SCHEMAS DE PAGO
// ============================================

export const MetodoPagoEnum = z.enum(['efectivo', 'transferencia'])
export type MetodoPago = z.infer<typeof MetodoPagoEnum>

// Schema principal de Pago
export const PagoSchema = z.object({
  id: z.number().optional(),
  fecha_pago: z.string().or(z.date()),
  monto_pago: z.number(),
  metodo_pago: MetodoPagoEnum,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Pago = z.infer<typeof PagoSchema>

// Schema para el formulario de Pago
export const PagoFormSchema = z.object({
  fecha_pago: z.string().min(1, 'La fecha de pago es requerida'),
  monto_pago: z.number().positive('El monto debe ser mayor a 0'),
  metodo_pago: MetodoPagoEnum,
  sucursal_id: z.number().positive('La sucursal es requerida'),
})

export type PagoForm = z.infer<typeof PagoFormSchema>

// ============================================
// SCHEMAS DE DETALLE VENTA
// ============================================

// Schema principal de Detalle Venta
export const DetalleVentaSchema = z.object({
  id: z.number().optional(),
  producto_id: z.number(),
  producto: ProductoSchema.optional(),
  cantidad: z.number(),
  precio_unitario: z.number(),
  subtotal: z.number(),
  venta_id: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type DetalleVenta = z.infer<typeof DetalleVentaSchema>

// Schema para el formulario de Detalle Venta
export const DetalleVentaFormSchema = z.object({
  producto_id: z.number().positive('El producto es requerido'),
  cantidad: z.number()
    .positive('La cantidad debe ser mayor a 0')
    .int('La cantidad debe ser un número entero'),
  precio_unitario: z.number()
    .positive('El precio unitario debe ser mayor a 0'),
  subtotal: z.number()
    .positive('El subtotal debe ser mayor a 0'),
})

export type DetalleVentaForm = z.infer<typeof DetalleVentaFormSchema>

// ============================================
// SCHEMAS DE VENTA
// ============================================

// Schema principal de Venta
export const VentaSchema = z.object({
  id: z.number().optional(),
  numero_venta: z.number(),
  fecha_venta: z.string().or(z.date()),
  detalles: z.array(DetalleVentaSchema),
  monto_total: z.number(),
  contacto_id: z.number().optional().nullable(),
  contacto: ContactoSchema.optional().nullable(),
  sucursal_id: z.number(),
  sucursal: SucursalSchema.optional(),
  empresa_id: z.number().optional().nullable(),
  empresa: EmpresaSchema.optional().nullable(),
  pago_id: z.number().optional(),
  pago: PagoSchema.optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Venta = z.infer<typeof VentaSchema>

// Schema para el formulario de Venta (Create)
// Nota: numero_venta se genera automáticamente en el backend
export const VentaFormSchema = z.object({
  fecha_venta: z.string().min(1, 'La fecha de venta es requerida'),
  detalles: z.array(DetalleVentaFormSchema)
    .min(1, 'Debe agregar al menos un detalle de venta'),
  monto_total: z.number()
    .positive('El monto total debe ser mayor a 0'),
  contacto_id: z.number().optional().nullable(),
  sucursal_id: z.number().positive('La sucursal es requerida'),
  pago: PagoFormSchema,
})

export type VentaForm = z.infer<typeof VentaFormSchema>

// Schema para actualizar Venta
export const UpdateVentaFormSchema = VentaFormSchema.partial()

export type UpdateVentaForm = z.infer<typeof UpdateVentaFormSchema>

// ============================================
// VALIDACIONES ADICIONALES
// ============================================

// Validación personalizada para verificar que el subtotal sea correcto
export const validateSubtotal = (detalle: DetalleVentaForm): boolean => {
  const calculatedSubtotal = detalle.cantidad * detalle.precio_unitario
  return Math.abs(calculatedSubtotal - detalle.subtotal) < 0.01 // Tolerancia para decimales
}

// Validación personalizada para verificar que el monto total sea correcto
export const validateMontoTotal = (venta: VentaForm): boolean => {
  const calculatedTotal = venta.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)
  return Math.abs(calculatedTotal - venta.monto_total) < 0.01 // Tolerancia para decimales
}

// Validación personalizada para verificar que el monto de pago coincida con el total
export const validateMontoPago = (venta: VentaForm): boolean => {
  return Math.abs(venta.pago.monto_pago - venta.monto_total) < 0.01 // Tolerancia para decimales
}

// Schema con validaciones adicionales completas
export const VentaFormSchemaCompleto = VentaFormSchema.refine(
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
).refine(
  (data) => validateMontoPago(data),
  {
    message: 'El monto de pago debe coincidir con el monto total de la venta',
    path: ['pago', 'monto_pago'],
  }
)

export type VentaFormCompleto = z.infer<typeof VentaFormSchemaCompleto>
