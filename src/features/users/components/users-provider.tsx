import React, { useState, useEffect } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type User } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  onSuccess?: () => void
  setOnSuccess: (fn: (() => void) | undefined) => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children, onSuccess }: { children: React.ReactNode, onSuccess?: () => void }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | undefined>()

  useEffect(() => {
    setOnSuccessCallback(() => onSuccess)
  }, [onSuccess])

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow, onSuccess: onSuccessCallback, setOnSuccess: setOnSuccessCallback }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
