import React, { createContext, useContext, useState } from 'react'
import { Role } from '../data/schema'

type RoleDialogType = 'add' | 'edit' | 'delete'

type RoleContextType = {
  open: RoleDialogType | null
  setOpen: (dialog: RoleDialogType | null) => void
  currentRow: Role | null
  setCurrentRow: (role: Role | null) => void
}

const RoleContext = createContext<RoleContextType | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<RoleDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Role | null>(null)

  return (
    <RoleContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRoles = () => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRoles debe ser usado dentro de RoleProvider')
  }
  return context
}
