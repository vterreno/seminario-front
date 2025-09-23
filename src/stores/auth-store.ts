import { create } from 'zustand'
import { STORAGE_KEYS } from '@/lib/constants'
import { setStorageItem, removeStorageItem, getStorageItem } from '@/hooks/use-local-storage'

interface AuthRole {
  id: number
  nombre: string
  permissions: Array<{
    id: number
    nombre: string
    codigo: string
  }>
}

interface Empresa {
  id: number
  nombre: string
}

interface AuthUser {
  name: string
  email: string
  empresa: Empresa
  roles: AuthRole[]
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // Initialize both user data and access token from localStorage with error handling
  const initUser = getStorageItem(STORAGE_KEYS.USER_DATA, null)
  const initToken = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, '')
  
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            setStorageItem(STORAGE_KEYS.USER_DATA, user)
          } else {
            removeStorageItem(STORAGE_KEYS.USER_DATA)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
          removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
          removeStorageItem(STORAGE_KEYS.USER_DATA)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
