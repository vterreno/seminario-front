import axios from 'axios';
import { getAccessToken, clearAuthData } from '@/lib/auth-utils';
import { useSessionStore } from '@/stores/session-store';

const axiosService = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
    'Content-Type': 'application/json',
},
});

//Interceptor para agregar el token a cada request
axiosService.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores de autenticación
axiosService.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Manejo específico de errores HTTP
        if (error.response?.status === 401) {
            // Token expirado o inválido
            clearAuthData();
            // Resetear sesión para forzar nueva validación
            useSessionStore.getState().resetSession();
            // Redirigir al login
            if (window.location.pathname !== '/sign-in') {
                window.location.href = '/sign-in';
            }
        } else if (error.response?.status === 403) {
            // Error de permisos - el mensaje del backend ya debería ser descriptivo
            console.error('Access forbidden:', error.response.data?.message || 'No tiene permisos para realizar esta acción');
        } else if (error.response?.status === 404) {
            // Recurso no encontrado - el mensaje del backend ya debería ser descriptivo
            console.error('Resource not found:', error.response.data?.message || 'Recurso no encontrado');
        } else if (error.response?.status === 409) {
            // Conflicto - el mensaje del backend ya debería ser descriptivo
            console.error('Conflict error:', error.response.data?.message || 'Conflicto en la operación');
        } else if (error.response?.status >= 500) {
            // Errores del servidor
            console.error('Server error:', error.response.data?.message || 'Error interno del servidor');
        } else if (!error.response) {
            // Error de red o conexión
            console.error('Network error:', 'No se pudo conectar con el servidor');
        }
        
        return Promise.reject(error);
    }
);
export default axiosService;