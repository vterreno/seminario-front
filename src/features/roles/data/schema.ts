import { z } from 'zod'

// Definición de todos los permisos disponibles
export const permissionsSchema = z.object({
  // Usuario
  usuario_ver: z.boolean().default(false),
  usuario_agregar: z.boolean().default(false),
  usuario_modificar: z.boolean().default(false),
  usuario_borrar: z.boolean().default(false),
  
  // Roles
  roles_ver: z.boolean().default(false),
  roles_agregar: z.boolean().default(false),
  roles_modificar: z.boolean().default(false),
  roles_eliminar: z.boolean().default(false),
  
  // Proveedor
  proveedor_ver: z.boolean().default(false),
  proveedor_agregar: z.boolean().default(false),
  proveedor_modificar: z.boolean().default(false),
  proveedor_eliminar: z.boolean().default(false),
  
  // Cliente
  cliente_ver: z.boolean().default(false),
  cliente_agregar: z.boolean().default(false),
  cliente_modificar: z.boolean().default(false),
  cliente_eliminar: z.boolean().default(false),
  
  // Producto
  producto_ver: z.boolean().default(false),
  producto_agregar: z.boolean().default(false),
  producto_modificar: z.boolean().default(false),
  producto_eliminar: z.boolean().default(false),
  
  // Compras
  compras_ver: z.boolean().default(false),
  compras_agregar: z.boolean().default(false),
  compras_modificar: z.boolean().default(false),
  compras_eliminar: z.boolean().default(false),
  
  // Ventas
  ventas_ver: z.boolean().default(false),
  ventas_agregar: z.boolean().default(false),
  ventas_modificar: z.boolean().default(false),
  ventas_eliminar: z.boolean().default(false),
  ventas_acceso_caja: z.boolean().default(false),
  
  // Marca
  marca_ver: z.boolean().default(false),
  marca_agregar: z.boolean().default(false),
  marca_modificar: z.boolean().default(false),
  marca_eliminar: z.boolean().default(false),
  
  // Unidad
  unidad_ver: z.boolean().default(false),
  unidad_agregar: z.boolean().default(false),
  unidad_modificar: z.boolean().default(false),
  unidad_eliminar: z.boolean().default(false),
  
  // Categoría
  categoria_ver: z.boolean().default(false),
  categoria_agregar: z.boolean().default(false),
  categoria_modificar: z.boolean().default(false),
  categoria_eliminar: z.boolean().default(false),
  
  // Configuraciones
  configuracion_empresa: z.boolean().default(false),
  
  // Sucursales
  sucursal_ver: z.boolean().default(false),
  sucursal_agregar: z.boolean().default(false),
  sucursal_modificar: z.boolean().default(false),
  sucursal_eliminar: z.boolean().default(false),
  
  // Listas de precios
  lista_precios_predeterminada: z.boolean().default(false),
  lista_precios_1: z.boolean().default(false),
  lista_precios_2: z.boolean().default(false),
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
  permisos: permissionsSchema,
  estado: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
})

export type Role = z.infer<typeof roleSchema>

// Schema para el formulario
export const roleFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  empresa_id: z.number().min(1, 'Debe seleccionar una empresa'),
  permisos: permissionsSchema,
  estado: z.boolean().optional().default(true),
  isEdit: z.boolean().optional().default(false),
})

export type RoleForm = z.infer<typeof roleFormSchema>

// Definición de grupos de permisos para la UI
export const permissionGroups = [
  {
    id: 'usuario',
    name: 'Usuario',
    permissions: [
      { key: 'usuario_ver', label: 'Ver usuario' },
      { key: 'usuario_agregar', label: 'Agregar usuario' },
      { key: 'usuario_modificar', label: 'Modificar usuario' },
      { key: 'usuario_borrar', label: 'Borrar usuario' },
    ]
  },
  {
    id: 'roles',
    name: 'Roles',
    permissions: [
      { key: 'roles_ver', label: 'Ver roles' },
      { key: 'roles_agregar', label: 'Agregar roles' },
      { key: 'roles_modificar', label: 'Modificar roles' },
      { key: 'roles_eliminar', label: 'Eliminar roles' },
    ]
  },
  {
    id: 'proveedor',
    name: 'Proveedor',
    permissions: [
      { key: 'proveedor_ver', label: 'Ver proveedor' },
      { key: 'proveedor_agregar', label: 'Agregar proveedor' },
      { key: 'proveedor_modificar', label: 'Modificar proveedor' },
      { key: 'proveedor_eliminar', label: 'Eliminar proveedor' },
    ]
  },
  {
    id: 'cliente',
    name: 'Cliente',
    permissions: [
      { key: 'cliente_ver', label: 'Ver cliente' },
      { key: 'cliente_agregar', label: 'Agregar cliente' },
      { key: 'cliente_modificar', label: 'Modificar cliente' },
      { key: 'cliente_eliminar', label: 'Eliminar cliente' },
    ]
  },
  {
    id: 'producto',
    name: 'Producto',
    permissions: [
      { key: 'producto_ver', label: 'Ver producto' },
      { key: 'producto_agregar', label: 'Agregar producto' },
      { key: 'producto_modificar', label: 'Modificar producto' },
      { key: 'producto_eliminar', label: 'Eliminar producto' },
    ]
  },
  {
    id: 'compras',
    name: 'Compras',
    permissions: [
      { key: 'compras_ver', label: 'Ver compras' },
      { key: 'compras_agregar', label: 'Agregar compra' },
      { key: 'compras_modificar', label: 'Modificar compra' },
      { key: 'compras_eliminar', label: 'Eliminar compra' },
    ]
  },
  {
    id: 'ventas',
    name: 'Ventas',
    permissions: [
      { key: 'ventas_ver', label: 'Ver venta' },
      { key: 'ventas_agregar', label: 'Agregar venta' },
      { key: 'ventas_modificar', label: 'Modificar venta' },
      { key: 'ventas_eliminar', label: 'Eliminar venta' },
      { key: 'ventas_acceso_caja', label: 'Acceso a caja' },
    ]
  },
  {
    id: 'marca',
    name: 'Marca',
    permissions: [
      { key: 'marca_ver', label: 'Ver marca' },
      { key: 'marca_agregar', label: 'Agregar marca' },
      { key: 'marca_modificar', label: 'Modificar marca' },
      { key: 'marca_eliminar', label: 'Eliminar marca' },
    ]
  },
  {
    id: 'unidad',
    name: 'Unidad',
    permissions: [
      { key: 'unidad_ver', label: 'Ver unidad' },
      { key: 'unidad_agregar', label: 'Agregar unidad' },
      { key: 'unidad_modificar', label: 'Modificar unidad' },
      { key: 'unidad_eliminar', label: 'Eliminar unidad' },
    ]
  },
  {
    id: 'categoria',
    name: 'Categoría',
    permissions: [
      { key: 'categoria_ver', label: 'Ver categoría' },
      { key: 'categoria_agregar', label: 'Agregar categoría' },
      { key: 'categoria_modificar', label: 'Modificar categoría' },
      { key: 'categoria_eliminar', label: 'Eliminar categoría' },
    ]
  },
  {
    id: 'configuracion',
    name: 'Configuraciones',
    permissions: [
      { key: 'configuracion_empresa', label: 'Acceder a la configuración de empresa' },
    ]
  },
  {
    id: 'sucursales',
    name: 'Sucursales',
    permissions: [
      { key: 'sucursal_ver', label: 'Ver sucursales' },
      { key: 'sucursal_agregar', label: 'Agregar sucursal' },
      { key: 'sucursal_modificar', label: 'Modificar sucursal' },
      { key: 'sucursal_eliminar', label: 'Eliminar sucursal' },
    ]
  },
  {
    id: 'listas_precios',
    name: 'Acceder lista de precios',
    permissions: [
      { key: 'lista_precios_predeterminada', label: 'Lista de precios predeterminada' },
      { key: 'lista_precios_1', label: 'Lista 1' },
      { key: 'lista_precios_2', label: 'Lista 2' },
    ]
  },
] as const

export type PermissionKey = keyof Permissions
