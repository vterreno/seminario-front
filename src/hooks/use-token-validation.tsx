import { useNavigate } from '@tanstack/react-router';
import { useSessionStore } from '@/stores/session-store';
import apiUserService from '@/service/apiUser.service';

export const useAuthSession = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    isValidating, 
    setAuthenticated, 
    setValidating, 
    resetSession 
  } = useSessionStore();

  const validateTokenOnce = async (): Promise<boolean> => {
    // Si ya se validó anteriormente, usar el estado en memoria
    if (isAuthenticated !== null) {
      return isAuthenticated;
    }

    setValidating(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setAuthenticated(false);
        return false;
      }

      const isValid = await apiUserService.validateToken();
      setAuthenticated(isValid);
      
      return isValid;
    } catch (error) {
      console.error('Error validating token:', error);
      setAuthenticated(false);
      return false;
    }
  };

  const logout = () => {
    apiUserService.logout();
    resetSession();
    navigate({ to: '/sign-in', replace: true });
  };

  return {
    isAuthenticated,
    isValidating,
    validateTokenOnce,
    logout,
    resetSession,
  };
};
