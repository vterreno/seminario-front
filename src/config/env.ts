let baseUrl = 'http://localhost:3001';

export const rutasBack = {
    sucursales: {
        getSucursales: `${baseUrl}/sucursales/all`,
        getSucursalesByEmpresa: `${baseUrl}/sucursales/empresa`,
        postSucursal: `${baseUrl}/sucursales`,
        putSucursal: `${baseUrl}/sucursales`,
        patchSucursal: `${baseUrl}/sucursales`,
        deleteSucursal: `${baseUrl}/sucursales`,
        getSucursalPorId: `${baseUrl}/sucursales`,
        patchSucursalesStatus: `${baseUrl}/sucursales/bulk/status`,
        deleteSucursales: `${baseUrl}/sucursales/bulk/delete`,
    },
    usuarios: {
        getUsuarios: `${baseUrl}/users/all`,
        postUsuario: `${baseUrl}/users/create-user`,
        putUsuario: `${baseUrl}/users/`,
        deleteUsuario: `${baseUrl}/users/`,
        getUsuarioPorId: `${baseUrl}/users/`,
        me: `${baseUrl}/users/me`,
        login: `${baseUrl}/users/login`,
        register: `${baseUrl}/users/register`,
        cambiarContrasena: `${baseUrl}/users/cambiar-contrasena`,
        validateToken: `${baseUrl}/users/validate-token`,
        updateUserStatus: `${baseUrl}/users/`,
        bulkUpdateUserStatus: `${baseUrl}/users/bulk/status`,
        bulkDeleteUsers: `${baseUrl}/users/bulk/delete`,
    },
    empresas: {
        getEmpresas: `${baseUrl}/empresa/all`,
        getEmpresasPaginated: `${baseUrl}/empresa`,
        postEmpresa: `${baseUrl}/empresa`,
        putEmpresa: `${baseUrl}/empresa`,
        patchEmpresa: `${baseUrl}/empresa`,
        deleteEmpresa: `${baseUrl}/empresa`,
        getEmpresaPorId: `${baseUrl}/empresa`,
        deleteEmpresas: `${baseUrl}/empresa/bulk/delete`,
        updateMyCompany: `${baseUrl}/empresa/mi-empresa`,
    },
    correo: {
        sendMail: `${baseUrl}/mail-service/send`,
        verifyCode: `${baseUrl}/mail-service/verify`,
    },
    roles: {
        getRoles: `${baseUrl}/roles`,
        postRole: `${baseUrl}/roles`,
        putRole: `${baseUrl}/roles`,
        deleteRole: `${baseUrl}/roles`,
        getRolePorId: `${baseUrl}/roles`,
        getRolesByEmpresa: `${baseUrl}/roles/empresa`,
        bulkDeleteRoles: `${baseUrl}/roles/bulk/delete`,
        bulkUpdateStatus: `${baseUrl}/roles/bulk/status`,
    },
    permisos: {
        getPermisos: `${baseUrl}/permisos/all`,
    }
};
