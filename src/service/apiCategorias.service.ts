import { Categoria } from '@/features/categorias/data/schema';
import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

class ApiCategoriasService {
    async getAllCategorias(): Promise<Categoria[]> {
    try {
        const response = await axiosService.get(rutasBack.categorias.getCategorias)
        return response.data
        } catch (error) {
        console.error('Error fetching categorias:', error)
        throw new Error('Failed to fetch categorias')
        }
    }

    async getCategoriasByEmpresa(empresaId: number): Promise<Categoria[]> {
    const url = `${rutasBack.categorias.getCategoriasByEmpresa}/${empresaId}`;
    try {
        const response = await axiosService.get(url)
        return response.data
        } catch (error) {
        throw new Error('Failed to fetch categorias by empresa')
        }
    }

    async createCategoria(categoriaData: any): Promise<Categoria> {
        try {
            const response = await axiosService.post(rutasBack.categorias.postCategoria, categoriaData);
            return response.data;
        } catch (error: any) {
            console.error('Error creating categoria:', error);
            
            // Manejo más robusto del mensaje de error desde el backend
            let errorMessage = 'Error al crear la categoría';
            
            if (error?.response?.data) {
                // NestJS BadRequestException estructura
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                // En caso de que el mensaje esté en otra estructura
                else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
                // Si viene como string directo
                else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }
            // Si no hay response (error de red, etc.)
            else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    }

    async updateCategoria(id: number, categoriaData: any): Promise<Categoria> {
        try {
            const response = await axiosService.put(`${rutasBack.categorias.putCategoria}/${id}`, categoriaData);
            return response.data;
        } catch (error: any) {
            console.error('Error updating categoria:', error);
            
            // Manejo más robusto del mensaje de error desde el backend
            let errorMessage = 'Error al actualizar la categoría';
            
            if (error?.response?.data) {
                // NestJS BadRequestException estructura
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                // En caso de que el mensaje esté en otra estructura
                else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
                // Si viene como string directo
                else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }
            // Si no hay response (error de red, etc.)
            else if (error.message) {
                errorMessage = error.message;
            }
            
            // Manejo específico para errores 500
            if (error?.response?.status === 500) {
                errorMessage = 'Error interno del servidor. Por favor, intenta nuevamente.';
            }
            
            throw new Error(errorMessage);
        }
    }

    async deleteCategoria(id: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.categorias.deleteCategoria}/${id}`);
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar marca";
            throw new Error(errorMessage);
        }
    }

    async bulkDeleteCategorias(ids: number[]): Promise<void> {
        try {
            await axiosService.delete(rutasBack.categorias.bulkDeleteCategorias, {
                data: { ids }
            })
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al eliminar categoría";
            throw new Error(errorMessage);
        }
    }

    async bulkUpdateCategoriaStatus(ids: number[], estado: boolean): Promise<void> {
        try {
            await axiosService.put(rutasBack.categorias.bulkUpdateStatus, {
                ids,
                estado
            })
        } catch (error) {
            console.error('Error bulk updating categoria status:', error)
            throw new Error('Failed to bulk update categoria status')
        }
    }
}

export default new ApiCategoriasService();