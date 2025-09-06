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
    empresas: {
        getEmpresas: `${baseUrl}/empresa/all`,
        getEmpresasPaginated: `${baseUrl}/empresa`,
        postEmpresa: `${baseUrl}/empresa`,
        putEmpresa: `${baseUrl}/empresa`,
        patchEmpresa: `${baseUrl}/empresa`,
        deleteEmpresa: `${baseUrl}/empresa`,
        getEmpresaPorId: `${baseUrl}/empresa`,
    },
    correo: {
        sendMail: `${baseUrl}/mail-service/send`,
        verifyCode: `${baseUrl}/mail-service/verify`,
    }
};
