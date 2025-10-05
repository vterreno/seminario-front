import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

export interface Empresa {
    id: number;
    name: string;
    estado: boolean;
}

export interface UnidadMedida {
    id?: number;
    nombre: string;
    abreviatura: string;
    aceptaDecimales: boolean;
    estado: boolean;
    empresa_id?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface CreateUnidadMedidaDto {
    nombre: string;
    abreviatura: string;
    aceptaDecimales?: boolean;
    estado?: boolean;
    empresa_id: number;
}

export interface UpdateUnidadMedidaDto {
    nombre?: string;
    abreviatura?: string;
    aceptaDecimales?: boolean;
    estado?: boolean;
    empresa_id?: number;
}

export interface BulkDeleteUnidadMedidaDto {
    ids: number[];
}

export interface CanDeleteResponse {
    canDelete: boolean;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    links: {
        first: string;
        previous: string;
        next: string;
        last: string;
    };
}

class ApiUnidadesMedida {
    async getAllUnidadesMedida(): Promise<UnidadMedida[]> {
        try {
            const response = await axiosService.get(rutasBack.unidadesMedida.getUnidadMedida);
            return response.data
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener todas las unidades de medida";
            throw new Error(errorMessage);
        }
    }

    async getUnidadesMedidaByEmpresa(empresaId: number): Promise<UnidadMedida[]> {
        try {
            const response = await axiosService.get(`${rutasBack.unidadesMedida.getUnidadesMedidaByEmpresa}/${empresaId}`);
            return response.data
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener unidades de medida por empresa";
            throw new Error(errorMessage);
        }
    }

    async getUnidadMedidaById(id: number): Promise<UnidadMedida> {
        try {
            const response = await axiosService.get(`${rutasBack.unidadesMedida.getUnidadMedidaPorId}/${id}`);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener unidad de medida";
            throw new Error(errorMessage);
        }
    }

    async createUnidadMedida(unidadData: CreateUnidadMedidaDto): Promise<UnidadMedida> {
        try {
            const response = await axiosService.post(rutasBack.unidadesMedida.postUnidadMedida, unidadData);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al crear unidad de medida";
            throw new Error(errorMessage);
        }
    }

    async updateUnidadMedida(id: number, unidadData: Partial<CreateUnidadMedidaDto>): Promise<UnidadMedida> {
        try {
            const response = await axiosService.put(`${rutasBack.unidadesMedida.putUnidadMedida}/${id}`, unidadData);
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar unidad de medida";
            throw new Error(errorMessage);
        }
    }

    async deleteUnidadMedida(id: number): Promise<void> {
        try {
            const data = await axiosService.delete(`${rutasBack.unidadesMedida.deleteUnidadMedida}/${id}`);
            return data.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar unidad de medida";
            throw new Error(errorMessage);
        }
    }

    async bulkDeleteUnidadesMedida(ids: number[]): Promise<void> {
        try {
            await axiosService.delete(rutasBack.unidadesMedida.bulkDeleteUnidadesMedida, {
                data: { ids }
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar unidades de medida masivamente";
            throw new Error(errorMessage);
        }
    }

    async bulkUpdateUnidadMedidaStatus(ids: number[], estado: boolean): Promise<void> {
        try {
            await axiosService.put(rutasBack.unidadesMedida.bulkUpdateStatus, {
                ids,
                estado
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar estado de unidades de medida masivamente";
            throw new Error(errorMessage);
        }
    }
}

export default new ApiUnidadesMedida();