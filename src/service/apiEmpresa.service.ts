import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

export interface Empresa {
    id?: number;
    name: string;
    estado: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface CreateEmpresaDto {
    name: string;
    estado?: boolean;
}

export interface UpdateEmpresaDto {
    name?: string;
    estado?: boolean;
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

class ApiEmpresa {
    async getAllEmpresas(): Promise<Empresa[]> {
        try {
            const response = await axiosService.get(rutasBack.empresas.getEmpresas);
            return response.data;
        } catch (error) {
            console.error("Error fetching empresas:", error);
            throw new Error("Failed to fetch empresas");
        }
    }

    async getEmpresasPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Empresa>> {
        try {
            const response = await axiosService.get(rutasBack.empresas.getEmpresasPaginated, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching paginated empresas:", error);
            throw new Error("Failed to fetch paginated empresas");
        }
    }

    async getEmpresaById(id: number): Promise<Empresa> {
        try {
            const response = await axiosService.get(`${rutasBack.empresas.getEmpresaPorId}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching empresa with id ${id}:`, error);
            throw new Error(`Failed to fetch empresa with id ${id}`);
        }
    }

    async createEmpresa(empresaData: CreateEmpresaDto): Promise<Empresa> {
        try {
            const response = await axiosService.post(rutasBack.empresas.postEmpresa, empresaData);
            return response.data;
        } catch (error) {
            console.error("Error creating empresa:", error);
            throw new Error("Failed to create empresa");
        }
    }

    async updateEmpresa(id: number, empresaData: UpdateEmpresaDto): Promise<Empresa> {
        try {
            const response = await axiosService.put(`${rutasBack.empresas.putEmpresa}/${id}`, empresaData);
            return response.data;
        } catch (error) {
            console.error(`Error updating empresa with id ${id}:`, error);
            throw new Error(`Failed to update empresa with id ${id}`);
        }
    }

    async updateEmpresaPartial(id: number, empresaData: Partial<UpdateEmpresaDto>): Promise<Empresa> {
        try {
            const response = await axiosService.patch(`${rutasBack.empresas.patchEmpresa}/${id}`, empresaData);
            return response.data;
        } catch (error) {
            console.error(`Error partially updating empresa with id ${id}:`, error);
            throw new Error(`Failed to partially update empresa with id ${id}`);
        }
    }

    async deleteEmpresa(id: number): Promise<{ message: string }> {
        try {
            const response = await axiosService.delete(`${rutasBack.empresas.deleteEmpresa}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting empresa with id ${id}:`, error);
            throw new Error(`Failed to delete empresa with id ${id}`);
        }
    }

    async deleteEmpresas(ids: number[]): Promise<{ message: string }> {
        try {
            const response = await axiosService.post(rutasBack.empresas.deleteEmpresas, {
                ids: ids
            });
            return response.data;
        }
        catch (error) {
            console.error("Error deleting empresas:", error);
            throw new Error("Failed to delete empresas");
        }
    }
}

export default new ApiEmpresa();
