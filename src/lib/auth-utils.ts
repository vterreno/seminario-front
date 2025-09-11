import apiUserService from '@/service/apiUser.service';
import { STORAGE_KEYS } from '@/lib/constants';
import { getStorageItem, removeStorageItem } from '@/hooks/use-local-storage';

interface UserData {
  name: string
  email: string
  empresa: {
    id: number | null
    nombre: string | null
  }
  roles: Array<{
    id: number
    nombre: string
    permissions: Array<{
      id: number
      nombre: string
      codigo: string
    }>
  }>
}

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

/**
 * Verifica si el usuario tiene un permiso específico
 */
export const hasPermission = (permissionCode: string): boolean => {
  const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null;
  
  if (!userData || !userData.roles) {
    return false;
  }

  return userData.roles.some(role =>
    role.permissions.some(permission => permission.codigo === permissionCode)
  );
};

/**
 * Obtiene los datos del usuario desde localStorage
 */
export const getUserData = (): UserData | null => {
  return getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null;
};
