import { mapBackendProductoToFrontend, Producto, ProductoBackend, ProductoForm } from '@/features/productos/data/schema';
import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

class ApiProductosService {
    async getAllProductos(): Promise<Producto[]> {
        try {
            const response = await axiosService.get(rutasBack.productos.getProductos);
            return response.data.map((producto: ProductoBackend) => mapBackendProductoToFrontend(producto));
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener todos los productos";
            throw new Error(errorMessage);
        }
    }

    async getProductosByEmpresa(empresaId: number): Promise<Producto[]> {
        try {
            const response = await axiosService.get(`${rutasBack.productos.getProductosByEmpresa}/${empresaId}`);
            return response.data.map((producto: ProductoBackend) => mapBackendProductoToFrontend(producto));
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener productos por empresa";
            throw new Error(errorMessage);
        }
    }

    async getProductoById(id: number): Promise<Producto> {
        try {
            const response = await axiosService.get(`${rutasBack.productos.getProductoPorId}/${id}`);
            return mapBackendProductoToFrontend(response.data);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener producto";
            throw new Error(errorMessage);
        }
    }

    async createProducto(productoData: ProductoForm): Promise<Producto> {
        try {
            const response = await axiosService.post(rutasBack.productos.postProducto, productoData);
            return mapBackendProductoToFrontend(response.data);
        } catch (error: any) {            
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al crear el producto";
            throw new Error(errorMessage);
        }
    }

    async updateProducto(id: number, productoData: Partial<ProductoForm>): Promise<Producto> {
        try {
            const response = await axiosService.put(`${rutasBack.productos.putProducto}/${id}`, productoData);
            return mapBackendProductoToFrontend(response.data);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar producto";
            throw new Error(errorMessage);
        }
    }

    async deleteProducto(id: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.productos.deleteProducto}/${id}`);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar producto";
            throw new Error(errorMessage);
        }
    }

    async bulkDeleteProductos(ids: number[]): Promise<void> {
        try {
            await axiosService.delete(rutasBack.productos.bulkDeleteProductos, {
                data: { ids }
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar productos masivamente";
            throw new Error(errorMessage);
        }
    }

    async bulkUpdateProductoStatus(ids: number[], estado: boolean): Promise<void> {
        try {
            await axiosService.put(rutasBack.productos.bulkUpdateStatus, {
                ids,
                estado
            });
        } catch (error: any) {
            // Intentar extraer el mensaje del backend de diferentes estructuras posibles
            const backendMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.response?.data;
            const errorMessage = typeof backendMessage === 'string' 
                ? backendMessage 
                : "Fallo al actualizar estado de productos masivamente"; 
            throw new Error(errorMessage);
        }
    }

}

export default new ApiProductosService();