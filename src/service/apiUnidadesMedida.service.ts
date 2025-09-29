import axiosService from '../api/apiClient'
import { rutasBack } from '../config/env'

interface UnidadMedida {
  id: number
  nombre: string
  abreviatura: string
  aceptaDecimales: boolean
  empresa_id?: number
  empresa?: {
    id: number
    name: string
  }
}

interface CreateUnidadMedidaData {
  nombre: string
  abreviatura: string
  aceptaDecimales?: boolean
  empresa_id?: number // Para superadmin
}

interface UpdateUnidadMedidaData {
  nombre?: string
  abreviatura?: string
  aceptaDecimales?: boolean
  empresa_id?: number // Para superadmin
}

interface Empresa {
  id: number
  name: string
  estado: boolean
}

class ApiUnidadesMedida {
  async getAll(): Promise<UnidadMedida[]> {
    try {
      const response = await axiosService.get(rutasBack.unidadesMedida.getAll)
      return response.data
    } catch (error: any) {
      console.error('Error fetching unidades de medida:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener unidades de medida')
    }
  }

  async getById(id: number): Promise<UnidadMedida> {
    try {
      const response = await axiosService.get(`${rutasBack.unidadesMedida.getById}${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching unidad de medida by id:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener unidad de medida')
    }
  }

  async create(data: CreateUnidadMedidaData): Promise<UnidadMedida> {
    try {
      const response = await axiosService.post(rutasBack.unidadesMedida.create, data)
      return response.data
    } catch (error: any) {
      console.error('Error creating unidad de medida:', error)
      throw new Error(error.response?.data?.message || 'Error al crear unidad de medida')
    }
  }

  async update(id: number, data: UpdateUnidadMedidaData): Promise<UnidadMedida> {
    try {
      const response = await axiosService.patch(`${rutasBack.unidadesMedida.update}${id}`, data)
      return response.data
    } catch (error: any) {
      console.error('Error updating unidad de medida:', error)
      throw new Error(error.response?.data?.message || 'Error al actualizar unidad de medida')
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axiosService.delete(`${rutasBack.unidadesMedida.delete}${id}`)
    } catch (error: any) {
      console.error('Error deleting unidad de medida:', error)
      throw new Error(error.response?.data?.message || 'Error al eliminar unidad de medida')
    }
  }

  async deleteMultiple(ids: number[]): Promise<{ message?: string }> {
    console.log('Deleting unidades with IDs:', ids)
    try {
      const response = await axiosService.delete(rutasBack.unidadesMedida.bulkDelete, {
        data: { ids }
      })
      console.log('Delete result:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error in deleteMultiple:', error)
      throw new Error(error.response?.data?.message || 'Error al eliminar unidades de medida')
    }
  }

  async canDelete(id: number): Promise<{ canDelete: boolean; message?: string }> {
    try {
      const response = await axiosService.get(`${rutasBack.unidadesMedida.canDelete}${id}/can-delete`)
      return response.data
    } catch (error: any) {
      console.error('Error checking if can delete:', error)
      throw new Error(error.response?.data?.message || 'Error al verificar si se puede eliminar')
    }
  }

  // Método para obtener empresas (para superadmin)
  async getEmpresas(): Promise<Empresa[]> {
    try {
      const response = await axiosService.get(rutasBack.empresas.getEmpresas)
      return response.data
    } catch (error: any) {
      console.error('Error fetching empresas:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener empresas')
    }
  }
}

const apiUnidadesMedida = new ApiUnidadesMedida()
export default apiUnidadesMedida
export type { UnidadMedida, CreateUnidadMedidaData, UpdateUnidadMedidaData, Empresa }