import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'
import { Bienvenida } from '@/features/bienvenida'
import { usePermissions } from '@/hooks/use-permissions'

function AuthenticatedHome() {
  const { canViewDashboard } = usePermissions()

  if (canViewDashboard) {
    return <Dashboard />
  }

  return <Bienvenida />
}

export const Route = createFileRoute('/_authenticated/')({
  component: AuthenticatedHome,
})
