import axiosService from '../api/apiClient';
import { rutasBack } from '../config/env';

class ApiCorreo {
    async send(to: string): Promise<any> {
        console.log(to)
        try {
            const response = await axiosService.post(rutasBack.correo.sendMail, {to});
            return response.data;
        } catch (error) {
            console.error("Error al enviar correo:", error);
            throw new Error("Fallo el envío de correo");
        }
    }
    async verify(email: string, code: string): Promise<any> {
        try {
            const response = await axiosService.post(rutasBack.correo.verifyCode, { email, code });
            return response;
        } catch (error) {
            console.error("Error al verificar código:", error);
            throw new Error("Fallo la verificación del código");
        }
    }
}

export default new ApiCorreo();