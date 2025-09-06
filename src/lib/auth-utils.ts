import apiUserService from '@/service/apiUser.service';
import { STORAGE_KEYS } from '@/lib/constants';
import { getStorageItem, removeStorageItem } from '@/hooks/use-local-storage';

/**
 * Verifica si hay un token en localStorage
 */
export const hasToken = (): boolean => {
  return Boolean(getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, null));
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
  removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Obtiene el token de acceso del localStorage
 */
export const getAccessToken = (): string | null => {
  return getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, null);
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
