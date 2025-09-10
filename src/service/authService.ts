import { rutasBack } from '../config/env';
import { STORAGE_KEYS } from '@/lib/constants';
import { removeStorageItem } from '@/hooks/use-local-storage';

export async function login(email: string, password: string) {
    const response = await fetch(rutasBack.usuarios.login, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
    },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Credenciales inválidas");
    }

    return await response.json();
}

export async function logout() {
  // Limpiar localStorage - no necesitamos endpoint específico para logout
    removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
    return Promise.resolve();
}