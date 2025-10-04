import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';
import { STORAGE_KEYS } from '../lib/constants';
import { setStorageItem, removeStorageItem, getStorageItem } from '../hooks/use-local-storage';
import { User, UserForm } from '../features/users/data/schema';

class ApiUsers {
    async login(email: string, password: string): Promise<any> {
        try {
        const response = await axiosService.post(rutasBack.usuarios.login, {email, password });
        setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
        setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);

        return response.data;
        } catch (error: any) {
        if (error.response.status === 401) {
            throw new Error("Usuario o contraseña incorrectos");
        }
        throw new Error("Error en el servidor. Intente más tarde.");
        }
    }

    async register(empresa: string, nombre: string, apellido: string, email: string, password: string ): Promise<any> {
        try {
        const response = await axiosService.post(rutasBack.usuarios.register, {empresa, nombre, apellido, email, password});
            setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
            setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);

            return response.data;
        } catch (error: any) {   
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || "Fallo al crear usuario";
            throw new Error(errorMessage);
        }
        
    }
    
    async validateToken(): Promise<boolean> {
        try {
            const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, null);
            if (!token) {
                return false;
            }

            const response = await axiosService.get(rutasBack.usuarios.validateToken, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.status === 200;
        } catch (error) {
            console.error("Token validation failed:", error);
            // Si el token no es válido, lo removemos del localStorage
            removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
            removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
            return false;
        }
    }

    logout(): void {
        removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
        removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
        removeStorageItem(STORAGE_KEYS.USER_DATA);
    }

    async cambiarContraseña(email: string, contrasena: string){
        try {
            const response = await axiosService.patch(rutasBack.usuarios.cambiarContrasena, { contrasena, email });
            setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
            setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
            return response.data;
        } catch (error) {
            throw new Error("Change failed");
        }
    }

    // CRUD operations for users
    async getAllUsers(): Promise<User[]> {
        try {
            const response = await axiosService.get(rutasBack.usuarios.getUsuarios);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    async getUserById(id: number): Promise<User> {
        try {
            const response = await axiosService.get(`${rutasBack.usuarios.getUsuarioPorId}${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user by id:', error);
            throw new Error('Failed to fetch user');
        }
    }

    async createUser(userData: UserForm): Promise<User> {
        try { 
            // Convertir role_id y empresa_id a número si son string
            if (userData.role_id && typeof userData.role_id === 'string') {
                userData.role_id = parseInt(userData.role_id);
            }
            
            if (userData.empresa_id && typeof userData.empresa_id === 'string') {
                userData.empresa_id = parseInt(userData.empresa_id);
            }
            
            const response = await axiosService.post(rutasBack.usuarios.postUsuario, userData);

            return response.data;
        } catch (error: any) {
            console.error('Error creating user:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data.message || 'Error al crear usuario');
            }
            throw new Error('Error al crear usuario');
        }
    }

    async updateUser(id: number, userData: Partial<UserForm>): Promise<User> {
        try {
            const response = await axiosService.put(`${rutasBack.usuarios.putUsuario}${id}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Error al actualizar usuario');
        }
    }

    async deleteUser(id: number): Promise<void> {
        try {
            await axiosService.delete(`${rutasBack.usuarios.deleteUsuario}${id}`);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Error al eliminar usuario');
        }
    }

    async getMe(): Promise<any> {
        try {
            const response = await axiosService.get(rutasBack.usuarios.me);
            return response.data;
        } catch (error) {
            console.error('Error fetching current user:', error);
            throw new Error('Error al obtener el usuario actual');
        }
    }

    // Bulk actions methods
    async updateUserStatus(id: number, status: boolean): Promise<any> {
        try {
            const response = await axiosService.patch(`${rutasBack.usuarios.updateUserStatus}${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating user status:', error);
            throw new Error('Error al actualizar estado del usuario');
        }
    }

    async updateUsersStatus(userIds: number[], status: boolean): Promise<any> {
        try { 
            // Asegurar que todos los IDs sean números
            const numericUserIds = userIds.map(id => typeof id === 'string' ? parseInt(id) : id);
            
            const response = await axiosService.patch(rutasBack.usuarios.bulkUpdateUserStatus, {
                userIds: numericUserIds,
                status
            });
        
            return response.data;
        } catch (error: any) {
            console.error('Error updating users status:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data.message || 'Error al actualizar estado de los usuarios');
            }
            throw new Error('Error al actualizar estado de los usuarios');
        }
    }

    async deleteUsers(userIds: number[]): Promise<any> {
        try {
            const response = await axiosService.delete(rutasBack.usuarios.bulkDeleteUsers, {
                data: { userIds }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting users:', error);
            throw new Error('Error al eliminar usuarios');
        }
    }

}

export default new ApiUsers();