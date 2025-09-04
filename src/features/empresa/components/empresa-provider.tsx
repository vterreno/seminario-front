import React, { createContext, useContext, useState } from 'react'
import { Empresa } from '../data/schema'

type EmpresaDialogType = 'add' | 'edit' | 'delete'

type EmpresaContextType = {
  open: EmpresaDialogType | null
  setOpen: (dialog: EmpresaDialogType | null) => void
  currentRow: Empresa | null
  setCurrentRow: (empresa: Empresa | null) => void
}

const EmpresaContext = createContext<EmpresaContextType | null>(null)

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<EmpresaDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Empresa | null>(null)

  return (
    <EmpresaContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </EmpresaContext.Provider>
  )
}

export const useEmpresa = () => {
  const context = useContext(EmpresaContext)
  if (!context) {
    throw new Error('useEmpresa debe ser usado dentro de EmpresaProvider')
  }
  return context
}
