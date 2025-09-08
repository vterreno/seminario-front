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
    try {
      const response = await axiosService.get(`${rutasBack.roles.getRolesByEmpresa}/${empresaId}`)
      return response.data.map((role: any) => this.mapBackendPermissionsToFrontend(role))
    } catch (error) {
      console.error('Error fetching roles by empresa:', error)
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
      const permissions = await this.mapPermissionsToBackend(roleData.permisos)
      const response = await axiosService.post(rutasBack.roles.postRole, {
        nombre: roleData.nombre,
        empresa_id: roleData.empresa_id,
        permissions: permissions,
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
        updateData.permissions = await this.mapPermissionsToBackend(roleData.permisos)
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

  // Helper method to map frontend permissions to backend format
  private async mapPermissionsToBackend(permisos: any): Promise<number[]> {
    const permissionIds: number[] = []
    
    try {
      // Get all permissions from the API
      const allPermissions = await apiPermisosService.getAllPermisos()
      
      // Create a map of permission codes to IDs
      const permissionMap: { [key: string]: number } = {}
      allPermissions.forEach(permission => {
        permissionMap[permission.codigo] = permission.id
      })
      
      // Map the selected permissions to IDs
      Object.entries(permisos).forEach(([key, value]) => {
        if (value === true && permissionMap[key]) {
          permissionIds.push(permissionMap[key])
        }
      })
      
      return permissionIds
    } catch (error) {
      console.error('Error mapping permissions:', error)
      return []
    }
  }

  // Get all permissions for the frontend
  async getAllPermissions(): Promise<Permission[]> {
    return await apiPermisosService.getAllPermisos()
  }

  // Helper method to map backend role permissions to frontend format
  private mapBackendPermissionsToFrontend(backendRole: any): any {
    const defaultPermissions = {
      usuario_ver: false,
      usuario_agregar: false,
      usuario_modificar: false,
      usuario_borrar: false,
      roles_ver: false,
      roles_agregar: false,
      roles_modificar: false,
      roles_eliminar: false,
      proveedor_ver: false,
      proveedor_agregar: false,
      proveedor_modificar: false,
      proveedor_eliminar: false,
      cliente_ver: false,
      cliente_agregar: false,
      cliente_modificar: false,
      cliente_eliminar: false,
      producto_ver: false,
      producto_agregar: false,
      producto_modificar: false,
      producto_eliminar: false,
      compras_ver: false,
      compras_agregar: false,
      compras_modificar: false,
      compras_eliminar: false,
      ventas_ver: false,
      ventas_agregar: false,
      ventas_modificar: false,
      ventas_eliminar: false,
      ventas_acceso_caja: false,
      marca_ver: false,
      marca_agregar: false,
      marca_modificar: false,
      marca_eliminar: false,
      unidad_ver: false,
      unidad_agregar: false,
      unidad_modificar: false,
      unidad_eliminar: false,
      categoria_ver: false,
      categoria_agregar: false,
      categoria_modificar: false,
      categoria_eliminar: false,
      configuracion_empresa: false,
      sucursal_todas: false,
      lista_precios_predeterminada: false,
    }

    // If the role has permissions, map them
    if (backendRole.permissions && Array.isArray(backendRole.permissions)) {
      backendRole.permissions.forEach((permission: any) => {
        if (permission.codigo && defaultPermissions.hasOwnProperty(permission.codigo)) {
          defaultPermissions[permission.codigo as keyof typeof defaultPermissions] = true
        }
      })
    }

    // Map empresa information if it exists
    const empresaInfo = backendRole.empresa ? {
      id: backendRole.empresa.id,
      nombre: backendRole.empresa.nombre || backendRole.empresa.name
    } : undefined

    return {
      id: backendRole.id,
      nombre: backendRole.nombre,
      empresa_id: backendRole.empresa_id,
      empresa: empresaInfo,
      estado: backendRole.estado,
      created_at: backendRole.created_at,
      updated_at: backendRole.updated_at,
      deleted_at: backendRole.deleted_at,
      permisos: defaultPermissions
    }
  }
}

const apiRolesService = new ApiRolesService()
export default apiRolesService
