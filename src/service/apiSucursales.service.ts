import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';
import { Sucursal } from '../features/sucursales/data/schema';

export interface CreateSucursalDto {
    nombre: string;
    codigo: string;
    direccion: string;
    estado?: boolean;
    empresa_id?: number;
}

export interface UpdateSucursalDto {
    id: number;
    nombre?: string;
    codigo?: string;
    direccion?: string;
    estado?: boolean;
    empresa_id?: number;
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

class ApiSucursales {
    async getAllSucursales(): Promise<Sucursal[]> {
        try {
            const response = await axiosService.get(rutasBack.sucursales.getSucursales);
            return response.data;
        } catch (error) {
            console.error("Error fetching sucursales:", error);
            throw new Error("Failed to fetch sucursales");
        }
    }

    async getSucursalesByEmpresa(empresaId: number): Promise<Sucursal[]> {
        try {
            const response = await axiosService.get(`${rutasBack.sucursales.getSucursalesByEmpresa}/${empresaId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sucursales for empresa ${empresaId}:`, error);
            throw new Error(`Failed to fetch sucursales for empresa ${empresaId}`);
        }
    }

    async getSucursalesPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Sucursal>> {
        try {
            const response = await axiosService.get(rutasBack.sucursales.getSucursales, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching paginated sucursales:", error);
            throw new Error("Failed to fetch paginated sucursales");
        }
    }

    async getSucursalById(id: number): Promise<Sucursal> {
        try {
            const response = await axiosService.get(`${rutasBack.sucursales.getSucursalPorId}${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sucursal with id ${id}:`, error);
            throw new Error(`Failed to fetch sucursal with id ${id}`);
        }
    }

    async getEmpresas(): Promise<any[]> {
        try {
            const response = await axiosService.get(rutasBack.empresas.getEmpresas);
            return response.data;
        } catch (error) {
            console.error("Error fetching empresas for sucursales:", error);
            throw new Error("Failed to fetch empresas");
        }
    }

    async createSucursal(sucursalData: CreateSucursalDto): Promise<Sucursal> {
        try {
            const response = await axiosService.post(rutasBack.sucursales.postSucursal, sucursalData);
            return response.data;
        } catch (error) {
            console.error("Error creating sucursal:", error);
            throw new Error("Failed to create sucursal");
        }
    }

    async updateSucursal(id: number, sucursalData: UpdateSucursalDto): Promise<Sucursal> {
        try {
            const response = await axiosService.put(`${rutasBack.sucursales.putSucursal}/${id}`, sucursalData);
            return response.data;
        } catch (error) {
            console.error(`Error updating sucursal with id ${id}:`, error);
            throw new Error(`Failed to update sucursal with id ${id}`);
        }
    }

    async updateSucursalPartial(id: number, sucursalData: Partial<UpdateSucursalDto>): Promise<Sucursal> {
        try {
            const response = await axiosService.patch(`${rutasBack.sucursales.patchSucursal}/${id}`, sucursalData);
            return response.data;
        } catch (error) {
            console.error(`Error partially updating sucursal with id ${id}:`, error);
            throw new Error(`Failed to partially update sucursal with id ${id}`);
        }
    }

    async deleteSucursal(id: number): Promise<{ message: string }> {
        try {
            const response = await axiosService.delete(`${rutasBack.sucursales.deleteSucursal}/${id}`);
            return response.data; 
        } catch (error) {
            console.error(`Error deleting sucursal with id ${id}:`, error);
            throw new Error(`Failed to delete sucursal with id ${id}`);
        }
    }

    async deleteSucursales(ids: number[]): Promise<{ message: string }> {
        try {
            const response = await axiosService.post(rutasBack.sucursales.deleteSucursales, {
                ids: ids
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting sucursales:", error);
            throw new Error("Failed to delete sucursales");
        }
    }

    async updateSucursalesStatus(ids: number[], estado: boolean): Promise<{ message: string }> {
        try {
            console.log(ids, estado);
            const response = await axiosService.post(rutasBack.sucursales.patchSucursalesStatus, {
                ids: ids,
                estado: estado
            });
            return response.data;
        } catch (error) {
            console.error("Error updating sucursales status:", error);
            throw new Error("Failed to update sucursales status");
        }
    }
}

export default new ApiSucursales();
