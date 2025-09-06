import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';
import { STORAGE_KEYS } from '@/lib/constants';
import { setStorageItem, removeStorageItem, getStorageItem } from '@/hooks/use-local-storage';
class ApiUsers {
    async login(email: string, password: string): Promise<any> {
        try {
        const response = await axiosService.post(rutasBack.usuarios.login, { email, password });
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
            console.error("Error during change:", error);
            throw new Error("Change failed");
        }
    }
}

export default new ApiUsers();