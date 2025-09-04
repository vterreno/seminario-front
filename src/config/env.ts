let baseUrl = 'http://localhost:3001';

export const rutasBack = {
    usuarios: {
        getUsuarios: `${baseUrl}/users/all`,
        postUsuario: `${baseUrl}/users/`,
        putUsuario: `${baseUrl}/users/`,
        deleteUsuario: `${baseUrl}/users/`,
        getUsuarioPorId: `${baseUrl}/users/`,
        me: `${baseUrl}/users/me`,
        login: `${baseUrl}/users/login`,
        register: `${baseUrl}/users/register`,
        cambiarContrasena: `${baseUrl}/users/cambiar-contrasena`,
        validateToken: `${baseUrl}/users/validate-token`,
    },
    correo: {
        sendMail: `${baseUrl}/mail-service/send`,
    }
};
