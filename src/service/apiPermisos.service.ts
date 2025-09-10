import axiosService from '@/api/apiClient'
import { rutasBack } from '@/config/env'

export interface Permission {
  id: number
  nombre: string
  codigo: string
  created_at?: string
  updated_at?: string
}

class ApiPermisosService {
  async getAllPermisos(): Promise<Permission[]> {
    try {
      const response = await axiosService.get(rutasBack.permisos.getPermisos)
      return response.data
    } catch (error) {
      console.error('Error fetching permissions:', error)
      throw new Error('Failed to fetch permissions')
    }
  }
}

const apiPermisosService = new ApiPermisosService()
export default apiPermisosService
