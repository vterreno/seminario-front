import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';
class ApiUsers {
    async login(email: string, password: string): Promise<any> {
        try {
        const response = await axiosService.post(rutasBack.usuarios.login, { email, password });
        localStorage.setItem("access_token", response.data.accessToken);
        localStorage.setItem("refresh_token", response.data.refreshToken);

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
            const token = localStorage.getItem("access_token");
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
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            return false;
        }
    }

    logout(): void {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
    }

    async cambiarContraseña(email: string, contrasena: string){
        try {
            const response = await axiosService.patch(rutasBack.usuarios.cambiarContrasena, { contrasena, email });
            localStorage.setItem("access_token", response.data.accessToken)
            localStorage.setItem("refresh_token", response.data.refreshToken)
            return response.data;
        } catch (error) {
            console.error("Error during change:", error);
            throw new Error("Change failed");
        }
    }
}

export default new ApiUsers();