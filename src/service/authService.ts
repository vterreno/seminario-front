import { rutasBack } from '../config/env';

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
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return Promise.resolve();
}