import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';
import { 
    Marca, 
    MarcaBackend, 
    MarcaForm,
    MarcaFormSuperAdmin,
    mapBackendMarcaToFrontend
} from '../features/marcas/data/schema';

class ApiMarcasService {
    async getAllMarcas(): Promise<Marca[]> {
        try {
            const response = await axiosService.get(rutasBack.marcas.getMarcas);
            return response.data.map((marca: MarcaBackend) => mapBackendMarcaToFrontend(marca));
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener todas las marcas";
            throw new Error(errorMessage);
        }
    }

    async getMarcasByEmpresa(empresaId: number): Promise<Marca[]> {
        try {
            const response = await axiosService.get(`${rutasBack.marcas.getMarcasByEmpresa}/${empresaId}`);
            return response.data.map((marca: MarcaBackend) => mapBackendMarcaToFrontend(marca));
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener marcas por empresa";
            throw new Error(errorMessage);
        }
    }

    async getMarcaById(id: number): Promise<Marca> {
        try {
            const response = await axiosService.get(`${rutasBack.marcas.getMarcaPorId}/${id}`);
            return mapBackendMarcaToFrontend(response.data);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al obtener marca";
            throw new Error(errorMessage);
        }
    }

    async createMarca(marcaData: MarcaForm | MarcaFormSuperAdmin): Promise<Marca> {
        try {
            const response = await axiosService.post(rutasBack.marcas.postMarca, marcaData);
            return mapBackendMarcaToFrontend(response.data);
        } catch (error: any) {            
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al crear marca";
            throw new Error(errorMessage);
        }
    }

    async updateMarca(id: number, marcaData: Partial<MarcaForm | MarcaFormSuperAdmin>): Promise<Marca> {
        try {
            const response = await axiosService.put(`${rutasBack.marcas.putMarca}/${id}`, marcaData);
            return mapBackendMarcaToFrontend(response.data);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar marca";
            throw new Error(errorMessage);
        }
    }

    async deleteMarca(id: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.marcas.deleteMarca}/${id}`);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar marca";
            throw new Error(errorMessage);
        }
    }

    async bulkDeleteMarcas(ids: number[]): Promise<void> {
        try {
            await axiosService.delete(rutasBack.marcas.bulkDeleteMarcas, {
                data: { ids }
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar marcas masivamente";
            throw new Error(errorMessage);
        }
    }

    async bulkUpdateMarcaStatus(ids: number[], estado: boolean): Promise<void> {
        try {
            await axiosService.put(rutasBack.marcas.bulkUpdateStatus, {
                ids,
                estado
            });
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al actualizar estado de marcas masivamente";
            throw new Error(errorMessage);
        }
    }

}

export default new ApiMarcasService();