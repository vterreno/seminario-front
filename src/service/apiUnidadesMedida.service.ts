import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

export interface UnidadMedida {
    id?: number;
    nombre: string;
    abreviatura: string;
    aceptaDecimales: boolean;
    empresaId?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface CreateUnidadMedidaDto {
    nombre: string;
    abreviatura: string;
    aceptaDecimales?: boolean;
}

export interface UpdateUnidadMedidaDto {
    nombre?: string;
    abreviatura?: string;
    aceptaDecimales?: boolean;
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
            const response = await axiosService.get(rutasBack.unidadesMedida.getUnidadesMedida);
            return response.data;
        } catch (error) {
            console.error("Error fetching unidades de medida:", error);
            throw new Error("Failed to fetch unidades de medida");
        }
    }

    async getUnidadesMedidaPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<UnidadMedida>> {
        try {
            const response = await axiosService.get(rutasBack.unidadesMedida.getUnidadesMedidaPaginated, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching paginated unidades de medida:", error);
            throw new Error("Failed to fetch paginated unidades de medida");
        }
    }

    async getUnidadMedidaById(id: number): Promise<UnidadMedida> {
        try {
            const response = await axiosService.get(`${rutasBack.unidadesMedida.getUnidadMedidaPorId}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching unidad de medida with id ${id}:`, error);
            throw new Error(`Failed to fetch unidad de medida with id ${id}`);
        }
    }

    async createUnidadMedida(unidadMedidaData: CreateUnidadMedidaDto): Promise<UnidadMedida> {
        try {
            const response = await axiosService.post(rutasBack.unidadesMedida.postUnidadMedida, unidadMedidaData);
            return response.data;
        } catch (error) {
            console.error("Error creating unidad de medida:", error);
            throw new Error("Failed to create unidad de medida");
        }
    }

    async updateUnidadMedida(id: number, unidadMedidaData: UpdateUnidadMedidaDto): Promise<UnidadMedida> {
        try {
            const response = await axiosService.put(`${rutasBack.unidadesMedida.putUnidadMedida}/${id}`, unidadMedidaData);
            return response.data;
        } catch (error) {
            console.error(`Error updating unidad de medida with id ${id}:`, error);
            throw new Error(`Failed to update unidad de medida with id ${id}`);
        }
    }

    async updateUnidadMedidaPartial(id: number, unidadMedidaData: Partial<UpdateUnidadMedidaDto>): Promise<UnidadMedida> {
        try {
            const response = await axiosService.patch(`${rutasBack.unidadesMedida.patchUnidadMedida}/${id}`, unidadMedidaData);
            return response.data;
        } catch (error) {
            console.error(`Error partially updating unidad de medida with id ${id}:`, error);
            throw new Error(`Failed to partially update unidad de medida with id ${id}`);
        }
    }

    async deleteUnidadMedida(id: number): Promise<{ message: string }> {
        try {
            const response = await axiosService.delete(`${rutasBack.unidadesMedida.deleteUnidadMedida}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting unidad de medida with id ${id}:`, error);
            throw new Error(`Failed to delete unidad de medida with id ${id}`);
        }
    }

    async deleteUnidadesMedida(ids: number[]): Promise<{ message: string }> {
        try {
            const response = await axiosService.delete(rutasBack.unidadesMedida.deleteUnidadesMedida, {
                data: { ids: ids }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting unidades de medida:", error);
            throw new Error("Failed to delete unidades de medida");
        }
    }

    async canDeleteUnidadMedida(id: number): Promise<CanDeleteResponse> {
        try {
            const response = await axiosService.get(`${rutasBack.unidadesMedida.canDeleteUnidadMedida}/${id}/can-delete`);
            return response.data;
        } catch (error) {
            console.error(`Error checking if unidad de medida with id ${id} can be deleted:`, error);
            throw new Error(`Failed to check if unidad de medida with id ${id} can be deleted`);
        }
    }
}

export default new ApiUnidadesMedida();