import React, { createContext, useContext, useState } from 'react'
import { Categoria } from '../data/schema'

type CategoriaDialogType = 'add' | 'edit' | 'delete'

type CategoriaContextType = {
  open: CategoriaDialogType | null
  setOpen: (dialog: CategoriaDialogType | null) => void
  currentRow: Categoria | null
  setCurrentRow: (categoria: Categoria | null) => void
}

const CategoriaContext = createContext<CategoriaContextType | null>(null)

export function CategoriasProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<CategoriaDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Categoria | null>(null)

  return (
    <CategoriaContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CategoriaContext.Provider>
  )
}

export const useCategorias = () => {
  const context = useContext(CategoriaContext)
  if (!context) {
    throw new Error('useCategorias debe ser usado dentro de CategoriasProvider')
  }
  return context
}
