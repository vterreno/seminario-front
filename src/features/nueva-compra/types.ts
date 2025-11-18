/**
 * Tipos y interfaces para el módulo de nueva compra
 */

import { Producto } from '@/features/productos/data/schema'
import { Contacto } from '@/service/apiContactos.service'

/**
 * Representa un detalle de compra en la interfaz
 */
export interface DetalleCompra {
  /** ID temporal único para identificación en la UI */
  id: string
  /** Referencia al producto */
  producto: Producto
  /** Cantidad recibida del producto */
  cantidad: number
  /** Costo unitario sin IVA */
  costo_unitario: number
  /** Porcentaje de IVA aplicable */
  iva_porcentaje: number
  /** Monto de IVA calculado */
  iva_monto: number
  /** Subtotal sin IVA (cantidad * costo_unitario) */
  subtotal: number
  /** Total del ítem con IVA incluido */
  total: number
}

/**
 * Costos adicionales que pueden aplicarse a una compra
 */
export interface CostoAdicional {
  /** ID temporal único */
  id: string
  /** Descripción del costo (ej: Flete, IIBB, Percepción) */
  concepto: string
  /** Monto del costo adicional */
  monto: number
}

/**
 * Tipos de métodos de pago disponibles
 */
export type MetodoPago = 'efectivo' | 'transferencia'

/**
 * Datos del pago de la compra
 */
export interface PagoCompraData {
  fecha_pago: string
  monto_pago: number
  metodo_pago: MetodoPago
  sucursal_id: number
}

/**
 * Datos para crear una nueva compra
 */
export interface NuevaCompraData {
  numero_compra: number
  fecha_compra: string
  contacto_id: number
  sucursal_id: number
  monto_total: number
  estado: 'PENDIENTE_PAGO' | 'PAGADO' | 'RECIBIDO' | 'CANCELADO'
  detalles: DetalleCompraBackend[]
  numero_factura?: string
  observaciones?: string
  pago?: PagoCompraData
  costos_adicionales?: Array<{ concepto: string; monto: number }>
}

/**
 * Estructura del detalle de compra para el backend
 */
export interface DetalleCompraBackend {
  producto_proveedor_id?: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
}

/**
 * Props para el selector de proveedor
 */
export interface ProveedorSelectorProps {
  proveedores: Contacto[]
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
}

/**
 * Totales calculados de la compra
 */
export interface TotalesCompra {
  /** Subtotal sin IVA ni costos adicionales */
  subtotal: number
  /** Total de IVA de todos los ítems */
  totalIva: number
  /** Suma de costos adicionales */
  totalCostosAdicionales: number
  /** Monto total final */
  total: number
}

/**
 * Props para el componente de detalles de compra
 */
export interface DetallesCompraProps {
  productos: Producto[]
  detalles: DetalleCompra[]
  onAgregarDetalle: (producto: Producto, cantidad: number, costoUnitario: number, ivaPorcentaje: number) => void
  onEliminarDetalle: (id: string) => void
  onActualizarCantidad: (id: string, cantidad: number) => void
  onActualizarCosto: (id: string, costoUnitario: number) => void
  onActualizarIva: (id: string, ivaPorcentaje: number) => void
  onOpenNuevoProducto: () => void
}

/**
 * Props para el selector de sucursal
 */
export interface SucursalSelectorProps {
  sucursales: Array<{
    id?: number
    nombre: string
    codigo?: string
    estado: boolean
  }>
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
}
