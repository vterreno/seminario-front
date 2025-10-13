import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'

interface UserData {
  name: string
  email: string
  empresa: {
    id: number | null
    nombre: string | null
  }
  roles: Array<{
    id: number
    nombre: string
    permissions?: Array<{
      id: number
      nombre: string
      codigo: string
    }>
    permisos?: Record<string, boolean>
  }>
}

/**
 * Hook para verificar permisos del usuario actual
 * Se suscribe al auth store para reaccionar a cambios en permisos
 */
export function usePermissions() {
  // Subscribirse al usuario del auth store para reaccionar a cambios
  const { auth } = useAuthStore()
  
  const userData = useMemo(() => {
    // Primero intentar obtener del store (más actualizado)
    if (auth.user) {
      return auth.user as UserData
    }
    // Fallback a localStorage si el store no está inicializado
    const data = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
    return data
  }, [auth.user])

  /**
   * Verifica si el usuario es superadmin (no tiene empresa asignada)
   */
  const isSuperAdmin = useMemo(() => {
    return !userData?.empresa?.id
  }, [userData])

  const userPermissions = useMemo(() => {
    if (!userData?.roles || userData.roles.length === 0) {
      return {}
    }
    
    // Combinar todos los permisos de todos los roles del usuario
    const allPermissions: Record<string, boolean> = {}
    userData.roles.forEach(role => {
      // Procesar permisos en formato Record<string, boolean> (para roles editados en frontend)
      if (role.permisos) {
        Object.entries(role.permisos).forEach(([key, value]) => {
          allPermissions[key] = allPermissions[key] || value
        })
      }
      
      // Procesar permisos en formato Array (para datos que vienen del backend)
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(permission => {
          if (permission.codigo) {
            allPermissions[permission.codigo] = true
          }
        })
      }
    })
    return allPermissions
  }, [userData])

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string): boolean => {
    // Si es superadmin, tiene acceso a todo
    if (isSuperAdmin) {
      return true
    }
    return userPermissions[permission] === true
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    // Si es superadmin, tiene acceso a todo
    if (isSuperAdmin) {
      return true
    }
    return permissions.some(permission => userPermissions[permission] === true)
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    // Si es superadmin, tiene acceso a todo
    if (isSuperAdmin) {
      return true
    }
    return permissions.every(permission => userPermissions[permission] === true)
  }

  return {
    userData,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    userEmpresaId: userData?.empresa?.id || null,
  }
}
