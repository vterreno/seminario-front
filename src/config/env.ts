let baseUrl = 'http://localhost:3001';

export const rutasBack = {
    usuarios: {
        getUsuarios: `${baseUrl}/users/all`,
        postUsuario: `${baseUrl}/users/`,
        putUsuario: `${baseUrl}/users/`,
        deleteUsuario: `${baseUrl}/users/`,
        getUsuarioPorId: `${baseUrl}/users/`,
        login: `${baseUrl}/users/login`,
        register: `${baseUrl}/users/register`,
        cambiarContrasena: `${baseUrl}/users/cambiar-contrasena`,
    },

};
