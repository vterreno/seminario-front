import { ReactNode, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Puedes cambiar la lógica de verificación de token según tu implementación
const isAuthenticated = () => {
  // Ejemplo: verifica si existe un token en localStorage
  return Boolean(localStorage.getItem('token'));
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated()) {
      router.navigate({ to: '/sign-in' });
    }
  }, [router]);
  if (!isAuthenticated()) {
    return null;
  }
  return <>{children}</>;
};
