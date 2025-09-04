import apiUserService from '@/service/apiUser.service';

/**
 * Verifica si hay un token en localStorage
 */
export const hasToken = (): boolean => {
  return Boolean(localStorage.getItem('access_token'));
};

/**
 * Valida el token contra el backend
 */
export const validateAuthToken = async (): Promise<boolean> => {
  try {
    if (!hasToken()) {
      return false;
    }
    
    return await apiUserService.validateToken();
  } catch (error) {
    console.error('Error validating auth token:', error);
    return false;
  }
};

/**
 * Limpia todos los datos de autenticación
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Obtiene el token de acceso del localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Verifica si el usuario está autenticado de forma completa
 * (tiene token Y es válido)
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  if (!hasToken()) {
    return false;
  }
  
  return await validateAuthToken();
};
