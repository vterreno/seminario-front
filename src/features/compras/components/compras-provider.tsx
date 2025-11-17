import React, { createContext, useContext, useState } from 'react'
import { Compra } from '../data/schema'

type CompraDialogType = 'add' | 'edit' | 'delete' | 'view' | 'pay' | 'modify'

type CompraContextType = {
  open: CompraDialogType | null
  setOpen: (dialog: CompraDialogType | null) => void
  currentRow: Compra | null
  setCurrentRow: (compra: Compra | null) => void
}

const CompraContext = createContext<CompraContextType | null>(null)

export function ComprasProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<CompraDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Compra | null>(null)

  return (
    <CompraContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CompraContext.Provider>
  )
}

export const useCompras = () => {
  const context = useContext(CompraContext)
  if (!context) {
    throw new Error('useCompras debe ser usado dentro de ComprasProvider')
  }
  return context
}
