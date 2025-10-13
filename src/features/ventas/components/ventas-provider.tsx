import React, { createContext, useContext, useState } from 'react'
import { Venta } from '../data/schema'

type VentaDialogType = 'add' | 'edit' | 'delete' | 'view'

type VentaContextType = {
  open: VentaDialogType | null
  setOpen: (dialog: VentaDialogType | null) => void
  currentRow: Venta | null
  setCurrentRow: (venta: Venta | null) => void
}

const VentaContext = createContext<VentaContextType | null>(null)

export function VentasProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<VentaDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Venta | null>(null)

  return (
    <VentaContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </VentaContext.Provider>
  )
}

export const useVentas = () => {
  const context = useContext(VentaContext)
  if (!context) {
    throw new Error('useVentas debe ser usado dentro de VentasProvider')
  }
  return context
}
