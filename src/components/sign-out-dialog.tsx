import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { useSessionStore } from '@/stores/session-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import apiUserService from '@/service/apiUser.service'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()
  const { resetSession } = useSessionStore()

  const handleSignOut = () => {
    // Limpiar tokens del localStorage
    apiUserService.logout();
    // Resetear store de auth
    auth.reset();
    // Resetear sesión para forzar nueva validación
    resetSession();
    
    // Preserve current location for redirect after sign-in
    const currentPath = location.href
    navigate({
      to: '/sign-in',
      search: { redirect: currentPath },
      replace: true,
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Cerrar sesion'
      desc='¿Seguro que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.'
      confirmText='Cerrar sesion'
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
