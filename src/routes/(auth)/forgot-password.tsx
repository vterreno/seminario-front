import { createFileRoute, redirect } from '@tanstack/react-router'
import { ForgotPassword } from '@/features/auth/forgot-password'
import { useSessionStore } from '@/stores/session-store'

export const Route = createFileRoute('/(auth)/forgot-password')({
  beforeLoad: async () => {
    const sessionState = useSessionStore.getState();
    
    if (sessionState.isAuthenticated === true) {
      throw redirect({
        to: '/_authenticated',
      });
    }
  },
  component: ForgotPassword,
})
