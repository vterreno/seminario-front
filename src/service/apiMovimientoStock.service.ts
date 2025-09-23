import {  MovimientoStock, MovimientoStockBackend, mapBackendMovimientoToFrontend, AjusteStockForm } from '@/features/productos/data/schema';
import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

class ApiMovimientoStockService {
    async obtenerMovimientos(productoId: number): Promise<MovimientoStock[]> {
        try {
            const response = await axiosService.get(`${rutasBack.movimientosStock.getMovimientosByProducto}/${productoId}`);
            const backendMovimientos: MovimientoStockBackend[] = response.data;
            return backendMovimientos.map(mapBackendMovimientoToFrontend);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener movimientos de stock";
            throw new Error(errorMessage);
        }
    }
    async realizarAjusteStock(productoId: number, ajusteData: AjusteStockForm): Promise<MovimientoStock> {
        try {
            const response = await axiosService.post(`${rutasBack.movimientosStock.ajusteStock}/${productoId}`, ajusteData);
            const backendMovimiento: MovimientoStockBackend = response.data;
            return mapBackendMovimientoToFrontend(backendMovimiento);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al realizar ajuste de stock";
            throw new Error(errorMessage);
        }
    }

}

export default new ApiMovimientoStockService();