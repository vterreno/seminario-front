import { Role, RoleForm } from '@/features/roles/data/schema'
import axiosService from '@/api/apiClient'
import { rutasBack } from '@/config/env'
import apiPermisosService, { Permission } from './apiPermisos.service'

class ApiRolesService {
  async getAllRoles(): Promise<Role[]> {
    try {
      const response = await axiosService.get(rutasBack.roles.getRoles)
      return response.data.map((role: any) => this.mapBackendPermissionsToFrontend(role))
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw new Error('Failed to fetch roles')
    }
  }

  async getRolesByEmpresa(empresaId: number): Promise<Role[]> {
    const url = `${rutasBack.roles.getRolesByEmpresa}/${empresaId}`;
    try {
      const response = await axiosService.get(url)
      return response.data.map((role: any) => this.mapBackendPermissionsToFrontend(role))
    } catch (error) {
      throw new Error('Failed to fetch roles by empresa')
    }
  }

  async getRoleById(id: number): Promise<Role> {
    try {
      const response = await axiosService.get(`${rutasBack.roles.getRolePorId}/${id}`)
      return this.mapBackendPermissionsToFrontend(response.data)
    } catch (error) {
      console.error('Error fetching role by id:', error)
      throw new Error('Failed to fetch role')
    }
  }

  async createRole(roleData: RoleForm): Promise<Role> {
    try {
      const permissionIds = roleData.permisos?.map(p => p.id) || []
      const response = await axiosService.post(rutasBack.roles.postRole, {
        nombre: roleData.nombre,
        empresa_id: roleData.empresa_id,
        permissions: permissionIds,
        estado: roleData.estado
      })
      return this.mapBackendPermissionsToFrontend(response.data)
    } catch (error) {
      console.error('Error creating role:', error)
      throw new Error('Failed to create role')
    }
  }

  async updateRole(id: number, roleData: Partial<RoleForm>): Promise<Role> {
    try {
      const updateData: any = {
        nombre: roleData.nombre,
        empresa_id: roleData.empresa_id,
        estado: roleData.estado
      }
      
      if (roleData.permisos) {
        updateData.permissions = roleData.permisos.map(p => p.id)
      }
      
      const response = await axiosService.put(`${rutasBack.roles.putRole}/${id}`, updateData)
      return this.mapBackendPermissionsToFrontend(response.data)
    } catch (error) {
      console.error('Error updating role:', error)
      throw new Error('Failed to update role')
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      await axiosService.delete(`${rutasBack.roles.deleteRole}/${id}`)
    } catch (error) {
      console.error('Error deleting role:', error)
      throw new Error('Failed to delete role')
    }
  }

  async bulkDeleteRoles(ids: number[]): Promise<void> {
    try {
      await axiosService.delete(rutasBack.roles.bulkDeleteRoles, {
        data: { ids }
      })
    } catch (error) {
      console.error('Error bulk deleting roles:', error)
      throw new Error('Failed to bulk delete roles')
    }
  }

  async bulkUpdateRoleStatus(ids: number[], estado: boolean): Promise<void> {
    try {
      await axiosService.put(rutasBack.roles.bulkUpdateStatus, {
        ids,
        estado
      })
    } catch (error) {
      console.error('Error bulk updating role status:', error)
      throw new Error('Failed to bulk update role status')
    }
  }

  async updateRolePartial(id: number, data: Partial<Role>): Promise<Role> {
    try {
      const response = await axiosService.patch(`${rutasBack.roles.putRole}/${id}`, data)
      return this.mapBackendPermissionsToFrontend(response.data)
    } catch (error) {
      console.error('Error updating role partially:', error)
      throw new Error('Failed to update role')
    }
  }

  // Get all permissions for the frontend
  async getAllPermissions(): Promise<Permission[]> {
    return await apiPermisosService.getAllPermisos()
  }

  // Helper method to map backend role permissions to frontend format
  private mapBackendPermissionsToFrontend(backendRole: any): any {
    // Map empresa information if it exists
    const empresaInfo = backendRole.empresa ? {
      id: backendRole.empresa.id,
      nombre: backendRole.empresa.nombre || backendRole.empresa.name
    } : undefined

    // Map permissions to the format expected by the frontend
    const permisos = backendRole.permissions && Array.isArray(backendRole.permissions)
      ? backendRole.permissions.map((permission: any) => ({
          id: permission.id,
          nombre: permission.nombre,
          codigo: permission.codigo,
          created_at: permission.created_at,
          updated_at: permission.updated_at
        }))
      : []

    const mappedRole = {
      id: backendRole.id,
      nombre: backendRole.nombre,
      empresa_id: backendRole.empresa_id,
      empresa: empresaInfo,
      estado: backendRole.estado,
      created_at: backendRole.created_at,
      updated_at: backendRole.updated_at,
      deleted_at: backendRole.deleted_at,
      permisos: permisos
    }
    
    return mappedRole
  }
}

const apiRolesService = new ApiRolesService()
export default apiRolesService
