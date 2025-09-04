import { DatosUsuariosContextType } from "@/interface/DatosUsuariosContextType.interface";
import apiUserService from "@/service/apiUser.service";
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
    
    const login = async (email: string, password: string) => {
        try {
            const response = await apiUserService.login(email, password);
            return response;
        } catch (error) {
            console.error("Error during login:", error);
            throw new Error("Login failed");
        }
    }
    return(
        <AuthContext.Provider value={{
            usuarios: [],
            eliminarUsuario: () => {},
            modificarUsuario: async (_id: number, _usuario: any) => {return {};},
            crearUsuario: async (_usuario: any) => {return {};},
            login,
            logout: () => { console.log("Logout function not implemented yet.");}
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default DatosUsuariosProvider;