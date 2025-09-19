import React, { createContext, useContext, useState } from 'react'
import { Marca } from '../data/schema'

type MarcaDialogType = 'add' | 'edit' | 'delete'

type MarcaContextType = {
    open: MarcaDialogType | null
    setOpen: (dialog: MarcaDialogType | null) => void
    currentRow: Marca | null
    setCurrentRow: (marca: Marca | null) => void
}

const MarcaContext = createContext<MarcaContextType | null>(null)

export function MarcasProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState<MarcaDialogType | null>(null)
    const [currentRow, setCurrentRow] = useState<Marca | null>(null)

    return (
        <MarcaContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
        {children}
        </MarcaContext.Provider>
    )
}

export const useMarcas = () => {
    const context = useContext(MarcaContext)
    if (!context) {
        throw new Error('useMarcas debe ser usado dentro de MarcasProvider')
    }
    return context
}
