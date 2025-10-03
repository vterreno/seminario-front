import { mapBackendListaPreciosToFrontend, ListaPrecios, ListaPreciosBackend, ListaPreciosForm } from '@/features/lista-precios/data/schema';
import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

class ApiListaPreciosService {
    async getAllListaPrecios(): Promise<ListaPrecios[]> {
        try {
            const response = await axiosService.get(rutasBack.listaPrecios.getListaPrecios);
            return response.data.map((lista: ListaPreciosBackend) => mapBackendListaPreciosToFrontend(lista));
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener todas las listas de precios";
            throw new Error(errorMessage);
        }
    }

    async getListaPreciosByEmpresa(empresaId: number): Promise<ListaPrecios[]> {
        try {
            const response = await axiosService.get(`${rutasBack.listaPrecios.getListaPreciosByEmpresa}/${empresaId}`);
            return response.data.map((lista: ListaPreciosBackend) => mapBackendListaPreciosToFrontend(lista));
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener listas de precios por empresa";
            throw new Error(errorMessage);
        }
    }

    async getListaPreciosById(id: number): Promise<ListaPrecios> {
        try {
            const response = await axiosService.get(`${rutasBack.listaPrecios.getListaPreciosPorId}/${id}`);
            return mapBackendListaPreciosToFrontend(response.data);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener lista de precios";
            throw new Error(errorMessage);
        }
    }

    async getProductosByListaPrecios(id: number): Promise<any[]> {
        try {
            const response = await axiosService.get(`${rutasBack.listaPrecios.getProductosByListaPrecios}/${id}/productos`);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener productos de la lista de precios";
            throw new Error(errorMessage);
        }
    }

    async createListaPrecios(listaPreciosData: ListaPreciosForm): Promise<ListaPrecios> {
        console.log(listaPreciosData)
        try {
            const response = await axiosService.post(rutasBack.listaPrecios.postListaPrecios, listaPreciosData);
            return mapBackendListaPreciosToFrontend(response.data);
        } catch (error: any) {            
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al crear la lista de precios";
            throw new Error(errorMessage);
        }
    }

    async updateListaPrecios(id: number, listaPreciosData: Partial<ListaPreciosForm>): Promise<ListaPrecios> {
        try {
            const response = await axiosService.put(`${rutasBack.listaPrecios.putListaPrecios}/${id}`, listaPreciosData);
            return mapBackendListaPreciosToFrontend(response.data);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar lista de precios";
            throw new Error(errorMessage);
        }
    }

    async deleteListaPrecios(id: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.listaPrecios.deleteListaPrecios}/${id}`);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar lista de precios";
            throw new Error(errorMessage);
        }
    }

    async bulkDeleteListaPrecios(ids: number[]): Promise<void> {
        try {
            await axiosService.delete(rutasBack.listaPrecios.bulkDeleteListaPrecios, {
                data: { ids }
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar listas de precios masivamente";
            throw new Error(errorMessage);
        }
    }

    async bulkUpdateListaPreciosStatus(ids: number[], estado: boolean): Promise<void> {
        try {
            await axiosService.put(rutasBack.listaPrecios.bulkUpdateStatus, {
                ids,
                estado
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.response?.data;
            const errorMessage = typeof backendMessage === 'string' 
                ? backendMessage 
                : "Fallo al actualizar estado de listas de precios masivamente"; 
            throw new Error(errorMessage);
        }
    }

    // Agregar productos a una lista de precios
    async addProductosToListaPrecios(listaId: number, productoIds: number[]): Promise<void> {
        try {
            await axiosService.post(`${rutasBack.listaPrecios.getListaPreciosPorId}/${listaId}/productos`, {
                productoIds
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al agregar productos a la lista de precios";
            throw new Error(errorMessage);
        }
    }

    // Eliminar un producto de una lista de precios
    async removeProductoFromListaPrecios(listaId: number, productoId: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.listaPrecios.getListaPreciosPorId}/${listaId}/productos/${productoId}`);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar producto de la lista de precios";
            throw new Error(errorMessage);
        }
    }

    // Actualizar el precio específico de un producto en una lista de precios
    async updateProductoPrecioInLista(listaId: number, productoId: number, precio: number): Promise<void> {
        try {
            await axiosService.put(`${rutasBack.listaPrecios.getListaPreciosPorId}/${listaId}/productos/${productoId}/precio`, {
                precio
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar precio del producto en la lista";
            throw new Error(errorMessage);
        }
    }
}

const apiListaPreciosService = new ApiListaPreciosService();
export default apiListaPreciosService;
