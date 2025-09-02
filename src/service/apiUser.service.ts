import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';
class ApiUsers {
    async login(email: string, password: string): Promise<any> {
        try {
            const response = await axiosService.post(rutasBack.usuarios.login, { email, password });
            return response.data;
        } catch (error) {
            console.error("Error during login:", error);
            throw new Error("Login failed");
        }
    }
}

export default new ApiUsers();