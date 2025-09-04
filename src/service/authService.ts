export async function login(email: string, password: string) {
    const response = await fetch("https://tu-backend.com/api/auth/login", {
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
  // Si tu backend requiere un endpoint para cerrar sesión, consúmelo aquí
    return await fetch("https://tu-backend.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });
}