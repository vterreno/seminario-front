/**
 * Tipos y interfaces para el módulo de nueva venta
 */

import { Producto } from '@/features/productos/data/schema'

/**
 * Representa un detalle de venta en la interfaz
 */
export interface DetalleVenta {
  /** ID temporal único para identificación en la UI */
  id: string
  /** Referencia al producto */
  producto: Producto
  /** Cantidad del producto */
  cantidad: number
  /** Precio unitario del producto al momento de la venta */
  precio_unitario: number
  /** Subtotal calculado (cantidad * precio_unitario) */
  subtotal: number
}

/**
 * Tipos de métodos de pago disponibles
 */
export type MetodoPago = 'efectivo' | 'transferencia'

/**
 * Datos para crear una nueva venta
 */
export interface NuevaVentaData {
  numero_venta: number
  fecha_venta: string
  contacto_id: number
  sucursal_id: number
  monto_total: number
  detalles: DetalleVentaBackend[]
  pago: PagoVentaData
  isEdit?: boolean
}

/**
 * Estructura del detalle de venta para el backend
 */
export interface DetalleVentaBackend {
  producto_id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
}

/**
 * Datos del pago de la venta
 */
export interface PagoVentaData {
  fecha_pago: string
  monto_pago: number
  metodo_pago: MetodoPago
}

/**
 * Props para los selectores de empresa
 */
export interface EmpresaSelectorProps {
  empresas: Array<{ id: number; name: string; estado: boolean }>
  empresaSeleccionada: number | null
  onEmpresaChange: (empresaId: number) => void
}

/**
 * Props para los selectores de sucursal
 */
export interface SucursalSelectorProps {
  sucursales: Array<{
    id?: number
    nombre: string
    codigo?: string
    estado: boolean
  }>
  sucursalSeleccionada: number | null
  onSucursalChange: (sucursalId: number) => void
}

/**
 * Props para los selectores de cliente
 */
export interface ClienteSelectorProps {
  clientes: Array<{
    id?: number
    nombre: string
    email?: string
    telefono?: string
    estado: boolean
    rol: string
  }>
  clienteSeleccionado: number | null
  onClienteChange: (clienteId: number) => void
}

/**
 * Props para el componente de detalles de venta
 */
export interface DetallesVentaProps {
  productos: Producto[]
  detalles: DetalleVenta[]
  onAgregarDetalle: (producto: Producto, cantidad: number) => void
  onEliminarDetalle: (id: string) => void
  onActualizarCantidad: (id: string, cantidad: number) => void
}

/**
 * Props para el selector de método de pago
 */
export interface MetodoPagoSelectorProps {
  metodoPago: MetodoPago | null
  onMetodoPagoChange: (metodo: MetodoPago) => void
}
