import { Dashboard } from '@/features/dashboard'
import { Bienvenida } from '@/features/bienvenida'
import { usePermissions } from '@/hooks/use-permissions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { canViewDashboard } = usePermissions()
  return canViewDashboard ? <Dashboard /> : <Bienvenida />
}
  