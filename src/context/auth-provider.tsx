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
    logout: () => { console.log("Logout function not implemented yet.");}
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
            roles: userData.roles,
        });

        setAuthenticated(true);
        return response;
        } catch (error: any) {
        if (error.response.status === 401) {
            throw new Error("Usuario o contraseña incorrectos");
        }

        throw new Error("Error en el servidor. Intente más tarde.");
        }
    };    
    const logout = () => {
        apiUserService.logout();
        // Limpiar datos del usuario del auth store
        auth.reset();
        // Resetear la sesión para forzar nueva validación en el próximo acceso
        resetSession();
    }
    
    return(
        <AuthContext.Provider value={{
            usuarios: [],
            eliminarUsuario: () => {},
            modificarUsuario: async (_id: number, _usuario: any) => {return {};},
            crearUsuario: async (_usuario: any) => {return {};},
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default DatosUsuariosProvider;