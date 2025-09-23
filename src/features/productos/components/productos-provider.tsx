import React, { createContext, useContext, useState } from 'react'
import { Producto } from '../data/schema'

type ProductoDialogType = 'add' | 'edit' | 'delete' | 'historial' | 'ajuste'

type ProductoContextType = {
    open: ProductoDialogType | null
    setOpen: (dialog: ProductoDialogType | null) => void
    currentRow: Producto | null
    setCurrentRow: (producto: Producto | null) => void
}

const ProductoContext = createContext<ProductoContextType | null>(null)

export function ProductosProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState<ProductoDialogType | null>(null)
    const [currentRow, setCurrentRow] = useState<Producto | null>(null)

    return (
        <ProductoContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
        {children}
        </ProductoContext.Provider>
    )
}

export const useProductos = () => {
    const context = useContext(ProductoContext)
    if (!context) {
        throw new Error('useMarcas debe ser usado dentro de MarcasProvider')
    }
    return context
}
