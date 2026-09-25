import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
  logoutAllDevices as logoutAllRequest,
} from "../api/auth";
import { refreshSession, setAccessToken, setSessionExpiredHandler } from "../api/http";
import type { AuthUser } from "./types";

// Solo indica que este navegador tuvo una sesión: no contiene ningún dato sensible.
// Evita pedir un refresh (y ver un 401) a cada visitante anónimo de la página pública.
const SESSION_HINT_KEY = "iter412_session";
// Clave antigua, cuando el JWT completo se guardaba en localStorage.
const LEGACY_STORAGE_KEY = "iter412_auth";

const readSessionHint = () => {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    // Almacenamiento bloqueado (incógnito estricto, etc.): intentamos igual con la cookie.
    return true;
  }
};

const writeSessionHint = (active: boolean) => {
  try {
    if (active) localStorage.setItem(SESSION_HINT_KEY, "1");
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // Sin almacenamiento: la sesión sigue funcionando con la cookie.
  }
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  /** true si la sesión terminó sola (expiró o fue revocada), para avisarlo en el login. */
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  /** Igual que logout(), pero deja sessionExpired=true (se cerró sola, no fue el usuario). */
  idleLogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setAccessToken(null);
      writeSessionHint(false);
      setUser(null);
      setSessionExpired(true);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!readSessionHint()) {
        setIsLoading(false);
        return;
      }

      try {
        const session = await refreshSession();
        if (cancelled) return;
        if (session) {
          setUser(session.user);
        } else {
          writeSessionHint(false);
        }
      } catch {
        // Sin conexión: se queda sin sesión en memoria; la cookie sigue vigente para el próximo intento.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    writeSessionHint(true);
    setSessionExpired(false);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    writeSessionHint(false);
    setUser(null);
    setSessionExpired(false);
    await logoutRequest();
  }, []);

  const logoutAllDevices = useCallback(async () => {
    await logoutAllRequest();
    writeSessionHint(false);
    setUser(null);
    setSessionExpired(false);
  }, []);

  const idleLogout = useCallback(async () => {
    writeSessionHint(false);
    setUser(null);
    setSessionExpired(true);
    await logoutRequest();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, sessionExpired, login, logout, logoutAllDevices, idleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
