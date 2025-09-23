import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useSessionStore } from '@/stores/session-store'
import apiUserService from '@/service/apiUser.service'
import { STORAGE_KEYS } from '@/lib/constants'
import { getStorageItem } from '@/hooks/use-local-storage'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const sessionState = useSessionStore.getState();
    
    // Si ya se verificó la autenticación en esta sesión, usar ese resultado
    if (sessionState.isAuthenticated !== null) {
      if (!sessionState.isAuthenticated) {
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        });
      }
      return; // Ya está autenticado
    }

    // Primera validación en esta sesión
    try {
      const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, null);
      
      if (!token) {
        sessionState.setAuthenticated(false);
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        });
      }

      const isValid = await apiUserService.validateToken();
      sessionState.setAuthenticated(isValid);
      
      if (!isValid) {
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        });
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      sessionState.setAuthenticated(false);
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
})