import React, { createContext, useContext, useState } from 'react'
import { UnidadMedida } from '../data/schema'

type UnidadMedidaDialogType = 'add' | 'edit' | 'delete'

type UnidadMedidaContextType = {
  open: UnidadMedidaDialogType | null
  setOpen: (dialog: UnidadMedidaDialogType | null) => void
  currentRow: UnidadMedida | null
  setCurrentRow: (unidadMedida: UnidadMedida | null) => void
}

const UnidadMedidaContext = createContext<UnidadMedidaContextType | null>(null)

export function UnidadMedidaProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<UnidadMedidaDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<UnidadMedida | null>(null)

  return (
    <UnidadMedidaContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UnidadMedidaContext.Provider>
  )
}

export const useUnidadMedida = () => {
  const context = useContext(UnidadMedidaContext)
  if (!context) {
    throw new Error('useUnidadMedida debe ser usado dentro de UnidadMedidaProvider')
  }
  return context
}