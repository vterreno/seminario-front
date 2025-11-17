import axiosService from "@/api/apiClient";
import { rutasBack } from "@/config/env";


export interface Compra {
  id: number;
  numero_compra: number;
  fecha_compra: string;
  monto_total: number;
  estado: string;
  numero_factura?: string;
  observaciones?: string;
  contacto?: {
    id: number;
    nombre: string;
    apellido: string;
    razon_social?: string;
  };
  sucursal?: {
    id: number;
    nombre: string;
  };
  detalles?: DetalleCompra[];
  created_at?: string;
  updated_at?: string;
}

export interface DetalleCompra {
  id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: {
    id: number;
    nombre: string;
    codigo: string;
  };
}

export interface CreateCompraPayload {
  fecha_compra: string;
  contacto_id: number;
  sucursal_id: number;
  monto_total: number;
  estado: string;
  numero_factura?: string;
  observaciones?: string;
  detalles: {
    producto_proveedor_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
}

export interface UpdateCompraPayload {
  fecha_compra?: string;
  monto_total?: number;
  numero_factura?: string;
  observaciones?: string;
  detalles?: {
    compra_id: number;
    producto_proveedor_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
}

export interface AsociarPagoPayload {
  fecha_pago: string;
  monto_pago: number;
  metodo_pago: 'efectivo' | 'transferencia';
  sucursal_id: number;
}

class ApiComprasService {
    async getAllCompras(): Promise<Compra[]> {
        try {
            const response = await axiosService.get(rutasBack.compras.getCompras);
            console.log('data', response.data)
            return response.data
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener todas las compras";
            throw new Error(errorMessage);
        }
    }

    async getComprasBySucursal(sucursalId: number): Promise<Compra[]> {
        try {
            const response = await axiosService.get(`${rutasBack.compras.getComprasBySucursal}/${sucursalId}`);
            return response.data
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener compras por sucursal";
            throw new Error(errorMessage);
        }
    }

    async getComprasByEmpresa(empresaId: number): Promise<Compra[]> {
        try {
            const response = await axiosService.get(`${rutasBack.compras.getComprasByEmpresa}/${empresaId}`);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener compras por empresa";
            throw new Error(errorMessage);
        }
    }

    async getCompraById(id: number): Promise<Compra> {
        try {
            const response = await axiosService.get(`${rutasBack.compras.getCompraPorId}/${id}`);
            console.log('detalle', response.data)
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener compra";
            throw new Error(errorMessage);
        }
    }

    async createCompra(compraData: CreateCompraPayload): Promise<Compra> {
        try {
            const response = await axiosService.post(rutasBack.compras.postCompra, compraData);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al crear la compra";
            throw new Error(errorMessage);
        }
    }

    async updateCompra(id: number, compraData: UpdateCompraPayload): Promise<Compra> {
        try {
            const response = await axiosService.put(`${rutasBack.compras.putCompra}/${id}`, compraData);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar la compra";
            throw new Error(errorMessage);
        }
    }

    async deleteCompra(id: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.compras.deleteCompra}/${id}`);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar la compra";
            throw new Error(errorMessage);
        }
    }

    async bulkDeleteCompras(ids: number[]): Promise<void> {
        try {
            await axiosService.delete(rutasBack.compras.bulkDeleteCompras, {
                data: { ids }
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar compras masivamente";
            throw new Error(errorMessage);
        }
    }

    async asociarPagoACompra(id: number, pagoData: AsociarPagoPayload): Promise<Compra> {
        try {
            const response = await axiosService.patch(`${rutasBack.compras.asociarPago}/${id}/asociar-pago`, pagoData);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al asociar el pago a la compra";
            throw new Error(errorMessage);
        }
    }

}

export default new ApiComprasService();