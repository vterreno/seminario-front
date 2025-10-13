import { createContext, useContext, useState, type ReactNode } from 'react'
import { type ListaPrecios } from '../data/schema'

interface ListaPreciosContextType {
    listaPrecios: ListaPrecios[]
    setListaPrecios: (listas: ListaPrecios[]) => void
    selectedLista: ListaPrecios | null
    setSelectedLista: (lista: ListaPrecios | null) => void
    isAddDialogOpen: boolean
    setIsAddDialogOpen: (open: boolean) => void
    isEditDialogOpen: boolean
    setIsEditDialogOpen: (open: boolean) => void
    isDeleteDialogOpen: boolean
    setIsDeleteDialogOpen: (open: boolean) => void
    isManagePreciosDialogOpen: boolean
    setIsManagePreciosDialogOpen: (open: boolean) => void
    isSuperAdmin: boolean
    userEmpresaId?: number
}

const ListaPreciosContext = createContext<ListaPreciosContextType | undefined>(undefined)

export function useListaPreciosContext() {
    const context = useContext(ListaPreciosContext)
    if (!context) {
        throw new Error('useListaPreciosContext must be used within ListaPreciosProvider')
    }
    return context
}

interface ListaPreciosProviderProps {
    children: ReactNode
    listaPrecios: ListaPrecios[]
    setListaPrecios: (listas: ListaPrecios[]) => void
    isSuperAdmin: boolean
    userEmpresaId?: number
}

export function ListaPreciosProvider({
    children,
    listaPrecios,
    setListaPrecios,
    isSuperAdmin,
    userEmpresaId,
}: ListaPreciosProviderProps) {
    const [selectedLista, setSelectedLista] = useState<ListaPrecios | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isManagePreciosDialogOpen, setIsManagePreciosDialogOpen] = useState(false)

    return (
        <ListaPreciosContext.Provider
            value={{
                listaPrecios,
                setListaPrecios,
                selectedLista,
                setSelectedLista,
                isAddDialogOpen,
                setIsAddDialogOpen,
                isEditDialogOpen,
                setIsEditDialogOpen,
                isDeleteDialogOpen,
                setIsDeleteDialogOpen,
                isManagePreciosDialogOpen,
                setIsManagePreciosDialogOpen,
                isSuperAdmin,
                userEmpresaId,
            }}
        >
            {children}
        </ListaPreciosContext.Provider>
    )
}
