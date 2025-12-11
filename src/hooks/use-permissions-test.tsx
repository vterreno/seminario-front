import { useState, createContext, useContext, ReactNode } from 'react'
import { usePermissions as useOriginalPermissions } from '@/hooks/use-permissions'

interface PermissionOverride {
  enabled: boolean
  permissions: Record<string, boolean>
  isSuperAdmin?: boolean
  isCompanyAdmin?: boolean
}

interface PermissionTestContextType {
  override: PermissionOverride
  setOverride: (override: PermissionOverride) => void
  clearOverride: () => void
}

const PermissionTestContext = createContext<PermissionTestContextType | null>(null)

export function PermissionTestProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<PermissionOverride>({
    enabled: false,
    permissions: {},
    isSuperAdmin: undefined,
    isCompanyAdmin: undefined,
  })

  const clearOverride = () => {
    setOverride({
      enabled: false,
      permissions: {},
      isSuperAdmin: undefined,
      isCompanyAdmin: undefined,
    })
  }

  return (
    <PermissionTestContext.Provider value={{ override, setOverride, clearOverride }}>
      {children}
    </PermissionTestContext.Provider>
  )
}

export function usePermissionTest() {
  const context = useContext(PermissionTestContext)
  if (!context) {
    throw new Error('usePermissionTest must be used within a PermissionTestProvider')
  }
  return context
}

// Hook que puede sobrescribir permisos para testing
export function usePermissions() {
  const originalPermissions = useOriginalPermissions()
  const testContext = useContext(PermissionTestContext)

  // Si no hay contexto de testing o no está habilitado, usar permisos originales
  if (!testContext || !testContext.override.enabled) {
    return originalPermissions
  }

  const { override } = testContext

  // Crear versión sobrescrita de los métodos de permisos
  const hasPermission = (permission: string): boolean => {
    // Si se especifica isSuperAdmin en override, usarlo
    if (override.isSuperAdmin !== undefined && override.isSuperAdmin) {
      return true
    }
    
    return override.permissions[permission] === true
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (override.isSuperAdmin !== undefined && override.isSuperAdmin) {
      return true
    }
    
    return permissions.some(permission => override.permissions[permission] === true)
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (override.isSuperAdmin !== undefined && override.isSuperAdmin) {
      return true
    }
    
    return permissions.every(permission => override.permissions[permission] === true)
  }

  return {
    ...originalPermissions,
    userPermissions: override.permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin:
      override.isSuperAdmin !== undefined ? override.isSuperAdmin : originalPermissions.isSuperAdmin,
    isCompanyAdmin:
      override.isCompanyAdmin !== undefined ? override.isCompanyAdmin : originalPermissions.isCompanyAdmin,
    canViewDashboard:
      (override.isSuperAdmin ?? originalPermissions.isSuperAdmin) ||
      (override.isCompanyAdmin ?? originalPermissions.isCompanyAdmin),
  }
}
