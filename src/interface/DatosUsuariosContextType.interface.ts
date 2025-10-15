export interface DatosUsuariosContextType {
    usuarios: any[];
    eliminarUsuario: (id: number) => void;
    modificarUsuario: (id: number, usuario: any) => Promise<any>;
    crearUsuario: (usuario: any) => Promise<any>;
    login: (email: string, password: string) => Promise<any>;
    register: (empresa: string, nombre: string, apellido: string, email: string, password: string) => Promise<any>;
    logout: () => void;
    cambiarContrasena: (email: string, nuevaContrasena: string) => Promise<any>;
    refreshUserData: () => Promise<void>;
}