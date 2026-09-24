import type { AuthUser } from "../auth/types";

export const API_URL: string =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:5000" : "https://api.iter412.com");

export type SessionResponse = {
  token: string;
  user: AuthUser;
};

export const NETWORK_ERROR_MESSAGE =
  "No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo en unos minutos.";

export const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Inicia sesión de nuevo.";

// El access token vive solo en memoria (no en localStorage): un XSS no puede llevárselo
// para usarlo después. La sesión persistente es la cookie httpOnly de refresh.
let accessToken: string | null = null;
let sessionExpiredHandler: (() => void) | null = null;
let refreshInFlight: Promise<SessionResponse | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  sessionExpiredHandler = handler;
};

const readMessage = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => ({}));
  return typeof data?.message === "string" ? data.message : fallback;
};

/**
 * Pide un access token nuevo con la cookie de refresh.
 * Devuelve null si no hay sesión válida y lanza si no hubo conexión con el servidor.
 * Las llamadas simultáneas comparten una sola petición.
 */
export const refreshSession = (): Promise<SessionResponse | null> => {
  refreshInFlight ??= (async () => {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    if (!res.ok) {
      accessToken = null;
      return null;
    }

    const session = (await res.json()) as SessionResponse;
    accessToken = session.token;
    return session;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

const send = (path: string, init?: RequestInit) =>
  fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

/**
 * fetch autenticado: si el access token expiró (401) renueva la sesión y repite la petición una vez.
 * Si la sesión ya no es válida avisa al AuthContext para cerrar sesión.
 */
export const authedRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let res: Response;
  try {
    res = await send(path, init);
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  if (res.status === 401) {
    const session = await refreshSession();
    if (!session) {
      sessionExpiredHandler?.();
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }
    try {
      res = await send(path, init);
    } catch {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }
  }

  if (!res.ok) throw new Error(await readMessage(res, "Error de solicitud"));

  return (await res.json().catch(() => ({}))) as T;
};
