import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/sign-in'
import { useSessionStore } from '@/stores/session-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: async () => {
    const sessionState = useSessionStore.getState();
    
    // Si ya hay una sesión autenticada activa, redirigir
    if (sessionState.isAuthenticated === true) {
      throw redirect({
        to: '/_authenticated',
      });
    }
  },
  component: SignIn,
  validateSearch: searchSchema,
})
