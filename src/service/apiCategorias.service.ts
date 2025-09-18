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
            console.log("Front 1 ", categoriaData)
            const response = await axiosService.post(rutasBack.categorias.postCategoria, categoriaData);
            return response.data;
        } catch (error) {
            console.error('Error creating categoria:', error);
            throw new Error('Failed to create categoria');
        }
    }

    async updateCategoria(id: number, categoriaData: any): Promise<Categoria> {
        try {
            const response = await axiosService.put(`${rutasBack.categorias.putCategoria}/${id}`, categoriaData);
            return response.data;
        } catch (error) {
            console.error('Error updating categoria:', error);
            throw new Error('Failed to update categoria');
        }
    }

    async deleteCategoria(id: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.categorias.deleteCategoria}/${id}`);
        } catch (error) {
            console.error('Error deleting categoria:', error);
            throw new Error('Failed to delete categoria');
        }
    }

    async bulkDeleteCategorias(ids: number[]): Promise<void> {
        try {
            await axiosService.delete(rutasBack.categorias.bulkDeleteCategorias, {
                data: { ids }
            })
        } catch (error) {
            console.error('Error bulk deleting categorias:', error)
            throw new Error('Failed to bulk delete categorias')
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