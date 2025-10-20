import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';
import { Venta, VentaForm } from '@/features/ventas/data/schema';

class ApiVentasService {
    async getAllVentas(): Promise<Venta[]> {
        try {
            const response = await axiosService.get(rutasBack.ventas.getVentas);
            console.log('Response data:', response.data); // Log the response data for debugging
            return response.data
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener todos los ventas";
            throw new Error(errorMessage);
        }
    }

    async getVentasBySucursal(sucursalId: number): Promise<Venta[]> {
        try {
            const response = await axiosService.get(`${rutasBack.ventas.getVentasBySucursal}/${sucursalId}`);
            return response.data
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener ventas por sucursal";
            throw new Error(errorMessage);
        }
    }

    async getVentasByEmpresa(empresaId: number): Promise<Venta[]> {
        try {
            const response = await axiosService.get(`${rutasBack.ventas.getVentasByEmpresa}/${empresaId}`);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener ventas por empresa";
            throw new Error(errorMessage);
        }
    }

    async getVentaById(id: number): Promise<Venta> {
        try {
            const response = await axiosService.get(`${rutasBack.ventas.getVentaPorId}/${id}`);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener venta";
            throw new Error(errorMessage);
        }
    }

    async createVenta(ventaData: VentaForm): Promise<Venta> {
        try {
            const response = await axiosService.post(rutasBack.ventas.postVenta, ventaData);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al crear la venta";
            throw new Error(errorMessage);
        }
    }

    async updateVenta(id: number, ventaData: Partial<VentaForm>): Promise<Venta> {
        try {
            const response = await axiosService.put(`${rutasBack.ventas.putVenta}/${id}`, ventaData);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar la venta";
            throw new Error(errorMessage);
        }
    }

    async deleteVenta(id: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.ventas.deleteVenta}/${id}`);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar la venta";
            throw new Error(errorMessage);
        }
    }

    async bulkDeleteVentas(ids: number[]): Promise<void> {
        try {
            await axiosService.delete(rutasBack.ventas.bulkDeleteVentas, {
                data: { ids }
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar ventas masivamente";
            throw new Error(errorMessage);
        }
    }


}

export default new ApiVentasService();