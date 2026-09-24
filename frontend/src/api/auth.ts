import {
  API_URL,
  NETWORK_ERROR_MESSAGE,
  authedRequest,
  setAccessToken,
  type SessionResponse,
} from "./http";

export type LoginResponse = SessionResponse;

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  if (res.status === 429) {
    throw new Error("Demasiados intentos. Espera unos minutos antes de volver a intentarlo.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Error al iniciar sesión";
    throw new Error(msg);
  }

  setAccessToken((data as LoginResponse).token);
  return data as LoginResponse;
};

export const logout = async (): Promise<void> => {
  setAccessToken(null);
  try {
    await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    // Sin conexión: la sesión local ya se cerró; la cookie expira sola.
  }
};

export const logoutAllDevices = async (): Promise<void> => {
  await authedRequest<{ ok: true }>("/api/auth/logout-all", { method: "POST" });
  setAccessToken(null);
};
