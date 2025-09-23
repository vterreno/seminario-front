import { z } from 'zod'

// Schema para Producto del backend (para mapeo desde API)
export const productoBackendSchema = z.object({
    id: z.number(),
    codigo: z.string(),
    nombre: z.string(),
    empresa_id: z.number(),
    empresa: z.object({
        id: z.number(),
        name: z.string()
    }).optional(),
    marca_id: z.number().nullable().optional(),
    marca: z.object({
        id: z.number(),
        nombre: z.string()
    }).nullable().optional(),
    // Preparado para futuro
    categoria_id: z.number().nullable().optional(),
    categoria: z.object({
        id: z.number(),
        nombre: z.string()
    }).nullable().optional(),
    unidad_medida_id: z.number().nullable().optional(),
    unidadMedida: z.object({
        id: z.number(),
        nombre: z.string(),
        sigla: z.string()
    }).nullable().optional(),
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

// Schema principal de la producto (para frontend)
export const productoSchema = z.object({
    id: z.number(),
    codigo: z.string(),
    nombre: z.string(),
    empresa_id: z.number(),
    empresa: z.object({
        id: z.number(),
        name: z.string()
    }).optional(),
    marca_id: z.number().nullable().optional(),
    marca: z.object({
        id: z.number(),
        nombre: z.string()
    }).nullable().optional(),
    // Preparado para futuro
    categoria_id: z.number().nullable().optional(),
    categoria: z.object({
        id: z.number(),
        nombre: z.string()
    }).nullable().optional(),
    unidad_medida_id: z.number().nullable().optional(),
    unidadMedida: z.object({
        id: z.number(),
        nombre: z.string(),
        sigla: z.string()
    }).nullable().optional(),
    precio_costo: z.number(),
    precio_venta: z.number(),
    stock_apertura: z.number(),
    stock: z.number(),
    estado: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().optional().nullable(),
})

export type Producto = z.infer<typeof productoSchema>

// Schema para el formulario
export const productoFormSchema = z.object({
    codigo: z.string().min(1, 'El código es requerido').max(50, 'El código no puede exceder 50 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    marca_id: z.number().nullable().optional(),
    categoria_id: z.number().nullable().optional(),
    unidad_medida_id: z.number().nullable().optional(),
    precio_costo: z.number().min(0, 'El precio de costo debe ser mayor o igual a 0'),
    precio_venta: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
    stock_apertura: z.number().min(0, 'El stock de apertura debe ser mayor o igual a 0'),
    stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
    estado: z.boolean(),
})

export type ProductoForm = z.infer<typeof productoFormSchema>

// Schema para el formulario cuando es superadmin (incluye empresa_id)
export const productoFormSuperAdminSchema = z.object({
    codigo: z.string().min(1, 'El código es requerido').max(50, 'El código no puede exceder 50 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    marca_id: z.number().nullable().optional(),
    categoria_id: z.number().nullable().optional(),
    unidad_medida_id: z.number().nullable().optional(),
    precio_costo: z.number().min(0, 'El precio de costo debe ser mayor o igual a 0'),
    precio_venta: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
    stock_apertura: z.number().min(0, 'El stock de apertura debe ser mayor o igual a 0'),
    stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
    empresa_id: z.number().min(1, 'Debe seleccionar una empresa'),
    estado: z.boolean(),
})

export type ProductoFormSuperAdmin = z.infer<typeof productoFormSuperAdminSchema>

// Definición para crear producto
export const createProductoSchema = z.object({
    codigo: z.string().min(1, 'El código es requerido').max(50, 'El código no puede exceder 50 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    marca_id: z.number().nullable().optional(),
    precio_costo: z.number().min(0, 'El precio de costo debe ser mayor o igual a 0'),
    precio_venta: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
    stock_apertura: z.number().min(0, 'El stock de apertura debe ser mayor o igual a 0'),
    stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
})

export type CreateProducto = z.infer<typeof createProductoSchema>

// Definición para actualizar producto
export const updateProductoSchema = z.object({
    id: z.number(),
    codigo: z.string().min(1, 'El código es requerido').max(50, 'El código no puede exceder 50 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    marca_id: z.number().nullable().optional(),
    precio_costo: z.number().min(0, 'El precio de costo debe ser mayor o igual a 0'),
    precio_venta: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
    stock_apertura: z.number().min(0, 'El stock de apertura debe ser mayor o igual a 0'),
    stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
    estado: z.boolean(),
})

export type UpdateProducto = z.infer<typeof updateProductoSchema>

// Funciones de utilidad para validación y transformación
export const validateProducto = (data: unknown): Producto => {
    return productoSchema.parse(data)
}

export const validateProductoBackend = (data: unknown): ProductoBackend => {
    return productoBackendSchema.parse(data)
}

export const validateProductoForm = (data: unknown): ProductoForm => {
    return productoFormSchema.parse(data)
}

export const validateCreateProducto = (data: unknown): CreateProducto => {
    return createProductoSchema.parse(data)
}

export const validateUpdateProducto = (data: unknown): UpdateProducto => {
    return updateProductoSchema.parse(data)
}

// Función de transformación de backend a frontend
export const mapBackendProductoToFrontend = (backendProducto: ProductoBackend): Producto => {
    const empresaInfo = backendProducto.empresa ? {
        id: backendProducto.empresa.id,
        name: backendProducto.empresa.name
    } : undefined;

    return {
        id: backendProducto.id,
        codigo: backendProducto.codigo,
        nombre: backendProducto.nombre,
        empresa_id: backendProducto.empresa_id,
        empresa: empresaInfo,
        marca_id: backendProducto.marca_id,
        marca: backendProducto.marca,
        categoria_id: backendProducto.categoria_id,
        categoria: backendProducto.categoria,
        unidad_medida_id: backendProducto.unidad_medida_id,
        unidadMedida: backendProducto.unidadMedida,
        precio_costo: backendProducto.precio_costo,
        precio_venta: backendProducto.precio_venta,
        stock_apertura: backendProducto.stock_apertura,
        stock: backendProducto.stock,
        estado: backendProducto.estado,
        created_at: backendProducto.created_at,
        updated_at: backendProducto.updated_at,
        deleted_at: backendProducto.deleted_at
    };
}

// Función de transformación de frontend a backend (si es necesaria)
export const mapFrontendProductoToBackend = (frontendProducto: Producto): ProductoBackend => {
    return {
        id: frontendProducto.id,
        codigo: frontendProducto.codigo,
        nombre: frontendProducto.nombre,
        empresa_id: frontendProducto.empresa_id,
        empresa: frontendProducto.empresa,
        marca_id: frontendProducto.marca_id,
        marca: frontendProducto.marca,
        categoria_id: frontendProducto.categoria_id,
        categoria: frontendProducto.categoria,
        unidad_medida_id: frontendProducto.unidad_medida_id,
        unidadMedida: frontendProducto.unidadMedida,
        precio_costo: frontendProducto.precio_costo,
        precio_venta: frontendProducto.precio_venta,
        stock_apertura: frontendProducto.stock_apertura,
        stock: frontendProducto.stock,
        estado: frontendProducto.estado,
        created_at: frontendProducto.created_at,
        updated_at: frontendProducto.updated_at,
        deleted_at: frontendProducto.deleted_at
    };
}

// Funciones de utilidad para operaciones comunes
export const isProductoActivo = (producto: Producto): boolean => {
    return producto.estado && !producto.deleted_at
}

export const formatProductoCreationDate = (producto: Producto): string => {
    return new Date(producto.created_at).toLocaleDateString('es-ES')
}

export const formatProductoUpdateDate = (producto: Producto): string => {
    return new Date(producto.updated_at).toLocaleDateString('es-ES')
}

// Schemas para movimientos de stock

export const movimientoStockBackendSchema = z.object({
    id: z.number(),
    producto_id: z.number(),
    tipo_movimiento: z.string(), // 'STOCK_APERTURA', 'VENTA', 'COMPRA', 'AJUSTE_MANUAL'
    descripcion: z.string(),
    fecha: z.string(),
    cantidad: z.number(),
    stock_resultante: z.number(),
    created_at: z.string(),
    updated_at: z.string()
})

export type MovimientoStockBackend = z.infer<typeof movimientoStockBackendSchema>

export const movimientoStockSchema = z.object({
    id: z.number(),
    producto_id: z.number(),
    tipo_movimiento: z.string(),
    descripcion: z.string(),
    fecha: z.string(),
    cantidad: z.number(),
    stock_resultante: z.number(),
    created_at: z.string(),
    updated_at: z.string()
})

export type MovimientoStock = z.infer<typeof movimientoStockSchema>

// Schema para el formulario de ajuste de stock
export const ajusteStockFormSchema = z.object({
    tipo_ajuste: z.enum(['aumento', 'disminucion'], {
        message: 'Debe seleccionar un tipo de ajuste'
    }),
    cantidad: z.number()
        .min(1, 'La cantidad debe ser mayor a 0')
        .max(99999, 'La cantidad no puede ser mayor a 99999'),
    motivo: z.string()
        .min(3, 'El motivo debe tener al menos 3 caracteres')
        .max(500, 'El motivo no puede exceder 500 caracteres')
})

export type AjusteStockForm = z.infer<typeof ajusteStockFormSchema>

// Mapeo de backend a frontend para movimientos de stock
export const mapBackendMovimientoToFrontend = (backendMovimiento: MovimientoStockBackend): MovimientoStock => {
    return {
        id: backendMovimiento.id,
        producto_id: backendMovimiento.producto_id,
        tipo_movimiento: backendMovimiento.tipo_movimiento,
        descripcion: backendMovimiento.descripcion,
        fecha: backendMovimiento.fecha,
        cantidad: backendMovimiento.cantidad,
        stock_resultante: backendMovimiento.stock_resultante,
        created_at: backendMovimiento.created_at,
        updated_at: backendMovimiento.updated_at
    }
}

// Funciones de utilidad para movimientos de stock
export const formatTipoMovimiento = (tipo: string): string => {
    const tipos = {
        'STOCK_APERTURA': 'Stock de apertura',
        'VENTA': 'Venta',
        'COMPRA': 'Compra',
        'AJUSTE_MANUAL': 'Ajuste manual'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
}

export const formatCantidadMovimiento = (cantidad: number): string => {
    return cantidad >= 0 ? `+${cantidad}` : `${cantidad}`
}

export const getMovimientoStockColor = (tipo: string): string => {
    const colores = {
        'STOCK_APERTURA': 'text-blue-600',
        'VENTA': 'text-red-600',
        'COMPRA': 'text-green-600',
        'AJUSTE_MANUAL': 'text-orange-600'
    }
    return colores[tipo as keyof typeof colores] || 'text-gray-600'
}

// Funciones de validación
export const validateMovimientoStock = (data: unknown): MovimientoStock => {
    return movimientoStockSchema.parse(data)
}

export const validateMovimientoStockBackend = (data: unknown): MovimientoStockBackend => {
    return movimientoStockBackendSchema.parse(data)
}

export const validateAjusteStockForm = (data: unknown): AjusteStockForm => {
    return ajusteStockFormSchema.parse(data)
}
