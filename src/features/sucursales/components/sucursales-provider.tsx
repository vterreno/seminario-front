import React, { createContext, useContext, useState } from 'react'
import { Sucursal } from '../data/schema'

type SucursalDialogType = 'add' | 'edit' | 'delete'

type SucursalContextType = {
  open: SucursalDialogType | null
  setOpen: (dialog: SucursalDialogType | null) => void
  currentRow: Sucursal | null
  setCurrentRow: (sucursal: Sucursal | null) => void
}

const SucursalContext = createContext<SucursalContextType | null>(null)

export function SucursalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<SucursalDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Sucursal | null>(null)

  return (
    <SucursalContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SucursalContext.Provider>
  )
}

export const useSucursales = () => {
  const context = useContext(SucursalContext)
  if (!context) {
    throw new Error('useSucursales debe ser usado dentro de SucursalProvider')
  }
  return context
}
