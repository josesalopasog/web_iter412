import type { AuthUser } from "../auth/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      "No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo en unos minutos."
    );
  }

  if (res.status === 429) {
    throw new Error("Demasiados intentos. Espera unos minutos antes de volver a intentarlo.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Error al iniciar sesión";
    throw new Error(msg);
  }

  return data as LoginResponse;
};
