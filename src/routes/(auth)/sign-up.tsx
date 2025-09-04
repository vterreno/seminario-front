import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignUp } from '@/features/auth/sign-up'
import { useSessionStore } from '@/stores/session-store'

export const Route = createFileRoute('/(auth)/sign-up')({
  beforeLoad: async () => {
    const sessionState = useSessionStore.getState();
    
    if (sessionState.isAuthenticated === true) {
      throw redirect({
        to: '/_authenticated',
      });
    }
  },
  component: SignUp,
})
