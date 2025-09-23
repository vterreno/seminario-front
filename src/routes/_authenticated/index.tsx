import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'
import { Bienvenida } from '@/features/bienvenida'
import { usePermissions } from '@/hooks/use-permissions'

function AuthenticatedHome() {
  const { hasPermission } = usePermissions()
  
  // Si tiene permisos para ver el dashboard, mostrar el dashboard
  if (hasPermission('dashboard_ver')) {
    return <Dashboard />
  }
  
  // Si no tiene permisos para el dashboard, mostrar bienvenida
  return <Bienvenida />
}

export const Route = createFileRoute('/_authenticated/')({
  component: AuthenticatedHome,
})
