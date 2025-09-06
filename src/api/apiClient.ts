import axios from 'axios';
import { getAccessToken, clearAuthData } from '@/lib/auth-utils';
import { useSessionStore } from '@/stores/session-store';

const axiosService = axios.create({
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
        if (error.response?.status === 401 ) {
            // Token expirado o inválido
            clearAuthData();
            // Resetear sesión para forzar nueva validación
            useSessionStore.getState().resetSession();
            // Redirigir al login
            if (window.location.pathname !== '/sign-in') {
                window.location.href = '/sign-in';
            }
        }
        return Promise.reject(error);
    }
);
export default axiosService;