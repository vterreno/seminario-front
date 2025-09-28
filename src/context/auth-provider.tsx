import { DatosUsuariosContextType } from "@/interface/DatosUsuariosContextType.interface";
import apiUserService from "@/service/apiUser.service";
import { useSessionStore } from "@/stores/session-store";
import { useAuthStore } from "@/stores/auth-store";
import { createContext, ReactNode } from "react";
import axiosService from "@/api/apiClient";
import { rutasBack } from "@/config/env";

export const AuthContext = createContext<DatosUsuariosContextType>({
    usuarios: [],
    eliminarUsuario: () => {},
    modificarUsuario: async (_id: number, _usuario: any) => {return {};},
    crearUsuario: async (_usuario: any) => {return {};},
    login: async (_email: string, _password: string) => {return {};},
    register: async(_empresa: string, _nombre: string, _apellido: string, _email: string, _password: string) => {return {};},
    logout: () => { console.log("Logout function not implemented yet.");}
    cambiarContrasena: async (_email: string, _nuevaContrasena: string) => {return {};}
})

interface DatosUsuariosProviderProps {
    children: ReactNode;
}


export const DatosUsuariosProvider = ({ children }: DatosUsuariosProviderProps) => {
    const { setAuthenticated, resetSession } = useSessionStore();
    const { auth } = useAuthStore();
    
    const login = async (email: string, password: string) => {
        try {
            const response = await apiUserService.login(email, password);

            // Obtener datos completos del usuario después del login
            const userDataResponse = await axiosService.get(rutasBack.usuarios.me);
            const userData = userDataResponse.data;
            
            auth.setUser({
                name: userData.name,
                email: userData.email,
                empresa: userData.empresa,
                roles: userData.roles,
            });
            setAuthenticated(true);
            return response;
        } catch (error: any) {
            console.error("Error en login:", error);
            
            // Primero intentar obtener el mensaje del backend
            const backendMessage = error.response?.data?.message;
            
            if (backendMessage) {
                // Si hay un mensaje del backend, usarlo directamente
                throw new Error(backendMessage);
            }
            
            // Si no hay mensaje del backend, usar mensajes por defecto según el tipo de error
            if (error.response) {
                // El servidor respondió con un código de estado de error
                if (error.response.status === 401) {
                    throw new Error("Usuario o contraseña incorrectos");
                } else if (error.response.status === 400) {
                    throw new Error("Datos inválidos");
                } else {
                    throw new Error("Error en el servidor. Intente más tarde.");
                }
            } else if (error.request) {
                // La petición se hizo pero no se recibió respuesta
                throw new Error("No se pudo conectar con el servidor");
            } else {
                // Error en la configuración de la petición
                throw new Error("Error inesperado. Intente más tarde.");
            }
        }
    };


    const register = async (empresa: string, nombre: string, apellido: string, email: string, password: string) => {
        try {
            await apiUserService.register(empresa, nombre, apellido, email, password);
            // Obtener datos completos del usuario después del registro
            const userDataResponse = await axiosService.get(rutasBack.usuarios.me);
            const userData = userDataResponse.data;
            
            auth.setUser({
                name: userData.name,
                email: userData.email,
                empresa: userData.empresa,
                roles: userData.roles,
            });
            setAuthenticated(true);
        } catch (error: any) {     
            // El error que llega desde apiUserService ya tiene el mensaje correcto
            throw new Error(error.message || "Error al registrar usuario");
        }
    };  

    const logout = () => {
        apiUserService.logout();
        // Limpiar datos del usuario del auth store
        auth.reset();
        // Resetear la sesión para forzar nueva validación en el próximo acceso
        resetSession();
    }

    const cambiarContrasena = async (email: string, nuevaContrasena: string) => {
        try {
            const response = await apiUserService.cambiarContraseña(email, nuevaContrasena);
            
            // Obtener datos completos del usuario después del cambio de contraseña
            const userDataResponse = await axiosService.get(rutasBack.usuarios.me);
            const userData = userDataResponse.data;
            auth.setUser({
                name: userData.name,
                email: userData.email,
                empresa: userData.empresa,
                roles: userData.roles,
            });

            setAuthenticated(true);
            return response;
        } catch (error: any) {
            throw new Error('Error al cambiar la contraseña');
        }
    };

    
    return(
        <AuthContext.Provider value={{
            usuarios: [],
            eliminarUsuario: () => {},
            modificarUsuario: async (_id: number, _usuario: any) => {return {};},
            crearUsuario: async (_usuario: any) => {return {};},
            login,
            register,
            logout,
            cambiarContrasena
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default DatosUsuariosProvider;