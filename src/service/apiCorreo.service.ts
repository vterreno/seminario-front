import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

class ApiCorreo {
    async send(to: string): Promise<any> {
        try {
            const response = await axiosService.post(rutasBack.correo.sendMail, {to,});
            return response.data;
        } catch (error) {
            console.error("Error al enviar correo:", error);
            throw new Error("Fallo el envío de correo");
        }
    }
}

export default new ApiCorreo();