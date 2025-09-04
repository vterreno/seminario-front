import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';
class ApiUsers {
    async login(email: string, password: string): Promise<any> {
        try {
            const response = await axiosService.post(rutasBack.usuarios.login, { email, password });
            localStorage.setItem("access_token", response.data.accessToken)
            localStorage.setItem("refresh_token", response.data.refreshToken)
            return response.data;
        } catch (error) {
            console.error("Error during login:", error);
            throw new Error("Login failed");
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
    }
}

export default new ApiUsers();