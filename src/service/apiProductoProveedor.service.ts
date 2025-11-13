import apiClient from '@/api/apiClient'

export interface ProductoProveedor {
  id: number
  producto_id: number
  proveedor_id: number
  precio_proveedor: number
  codigo_proveedor?: string
  producto?: {
    id: number
    codigo: string
    nombre: string
    precio_costo: number
    precio_venta: number
    stock: number
    estado: boolean
    marca?: {
      id: number
      nombre: string
    }
    categoria?: {
      id: number
      nombre: string
    }
    unidadMedida?: {
      id: number
      nombre: string
      abreviatura: string
    }
  }
  proveedor?: {
    id: number
    nombre_razon_social: string
    cuit_cuil_dni: string
  }
  created_at: string
  updated_at: string
}

export interface CreateProductoProveedorDto {
  producto_id: number
  proveedor_id: number
  precio_proveedor: number
  codigo_proveedor?: string
}

export interface UpdateProductoProveedorDto {
  precio_proveedor?: number
  codigo_proveedor?: string
}

class ApiProductoProveedorService {
  // Obtener todos los productos de un proveedor
  async getProductosByProveedor(proveedorId: number): Promise<ProductoProveedor[]> {
    const response = await apiClient.get(`/producto-proveedor/proveedor/${proveedorId}`)
    return response.data
  }

  // Obtener todos los proveedores de un producto
  async getProveedoresByProducto(productoId: number): Promise<ProductoProveedor[]> {
    const response = await apiClient.get(`/producto-proveedor/producto/${productoId}`)
    return response.data
  }

  // Obtener por ID
  async getById(id: number): Promise<ProductoProveedor> {
    const response = await apiClient.get(`/producto-proveedor/${id}`)
    return response.data
  }

  // Crear relación producto-proveedor
  async create(data: CreateProductoProveedorDto): Promise<ProductoProveedor> {
    const response = await apiClient.post('/producto-proveedor', data)
    return response.data
  }

  // Actualizar relación producto-proveedor
  async update(id: number, data: UpdateProductoProveedorDto): Promise<ProductoProveedor> {
    const response = await apiClient.put(`/producto-proveedor/${id}`, data)
    return response.data
  }

  // Eliminar relación producto-proveedor
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/producto-proveedor/${id}`)
  }
}

const apiProductoProveedorService = new ApiProductoProveedorService()
export default apiProductoProveedorService
