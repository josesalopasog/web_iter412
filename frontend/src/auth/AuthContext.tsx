import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest } from "../api/auth";
import { getMyServidorProfile } from "../api/adminUsers";
import type { AuthUser } from "./types";

const STORAGE_KEY = "iter412_auth";

type StoredAuth = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      let stored: StoredAuth | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) stored = JSON.parse(raw) as StoredAuth;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }

      if (!stored) {
        setIsLoading(false);
        return;
      }

      setToken(stored.token);
      setUser(stored.user);

      try {
        const profile = await getMyServidorProfile(stored.token);
        const refreshedUser: AuthUser = {
          sub: stored.user.sub,
          email: String(profile.email ?? stored.user.email),
          role: (profile.role as AuthUser["role"]) ?? stored.user.role,
          firstNames: String(profile.firstNames ?? stored.user.firstNames),
          lastNames: String(profile.lastNames ?? stored.user.lastNames),
          preferredName: String(profile.preferredName ?? stored.user.preferredName),
        };
        setUser(refreshedUser);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ token: stored.token, user: refreshedUser })
        );
      } catch {
        // Keep the cached session if the refresh fails (e.g. offline).
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    return result.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
