import { DatosUsuariosContextType } from "@/interface/DatosUsuariosContextType.interface";
import apiUserService from "@/service/apiUser.service";
import { useSessionStore } from "@/stores/session-store";
import { createContext, ReactNode } from "react";

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
    
    const login = async (email: string, password: string) => {
        try {
            const response = await apiUserService.login(email, password);
            // Establecer la sesión como autenticada después del login exitoso
            setAuthenticated(true);
            return response;
        } catch (error) {
            console.error("Error during login:", error);
            throw new Error("Login failed");
        }
    }

    const logout = () => {
        apiUserService.logout();
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