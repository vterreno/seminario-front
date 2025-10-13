import { z } from 'zod'

// Schema para el detalle de venta
export const detalleVentaSchema = z.object({
  id: z.string(), // ID temporal para la interfaz
  producto_id: z.number(),
  producto: z.object({
    id: z.number(),
    nombre: z.string(),
    codigo: z.string(),
    precio_venta: z.number(),
    stock: z.number(),
  }),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  precio_unitario: z.number().positive('El precio debe ser mayor a 0'),
  subtotal: z.number(),
})

export type DetalleVentaSchema = z.infer<typeof detalleVentaSchema>

// Schema para el pago de la venta
export const pagoVentaSchema = z.object({
  fecha_pago: z.string(),
  monto_pago: z.number().positive('El monto debe ser mayor a 0'),
  metodo_pago: z.enum(['efectivo', 'transferencia']),
})

export type PagoVentaSchema = z.infer<typeof pagoVentaSchema>

// Schema para crear una nueva venta
export const nuevaVentaSchema = z.object({
  numero_venta: z.number(),
  fecha_venta: z.string(),
  contacto_id: z.number().positive('Debe seleccionar un cliente'),
  sucursal_id: z.number().positive('Debe seleccionar una sucursal'),
  monto_total: z.number().positive('El monto total debe ser mayor a 0'),
  detalles: z.array(
    z.object({
      producto_id: z.number(),
      cantidad: z.number().positive(),
      precio_unitario: z.number().positive(),
      subtotal: z.number(),
    })
  ).min(1, 'Debe agregar al menos un producto'),
  pago: pagoVentaSchema,
  isEdit: z.boolean().optional(),
})

export type NuevaVentaSchema = z.infer<typeof nuevaVentaSchema>

// Schema para la venta completa (respuesta del backend)
export const ventaSchema = z.object({
  id: z.number(),
  numero_venta: z.number(),
  fecha_venta: z.string(),
  contacto_id: z.number(),
  sucursal_id: z.number(),
  monto_total: z.number(),
  estado: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type VentaSchema = z.infer<typeof ventaSchema>

// Funciones de utilidad para validación
export const validateNuevaVenta = (data: unknown): NuevaVentaSchema => {
  return nuevaVentaSchema.parse(data)
}

export const validateDetalleVenta = (data: unknown): DetalleVentaSchema => {
  return detalleVentaSchema.parse(data)
}

export const validatePagoVenta = (data: unknown): PagoVentaSchema => {
  return pagoVentaSchema.parse(data)
}

// Funciones de utilidad para operaciones comunes
export const calcularSubtotal = (cantidad: number, precioUnitario: number): number => {
  return cantidad * precioUnitario
}

export const calcularMontoTotal = (detalles: DetalleVentaSchema[]): number => {
  return detalles.reduce((total, detalle) => total + detalle.subtotal, 0)
}

export const formatearMontoMoneda = (monto: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto)
}

export const formatearFechaVenta = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
