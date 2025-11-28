"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, Role, AuthResponse } from "@/types/auth";
import api from "@/lib/api";

// Si más adelante quieres volver a usar helpers de /lib/auth, puedes,
// pero aquí lo dejamos autosuficiente y robusto para mock y backend real.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "1";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Helpers ---
  const saveTokens = (access?: string, refresh?: string) => {
    if (access) localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  };

  // --- Arranque: recuperar sesión ---
  useEffect(() => {
    const boot = async () => {
      try {
        if (USE_MOCK) {
          const raw = localStorage.getItem("mock_user");
          setUser(raw ? JSON.parse(raw) : null);
          setLoading(false);
          return;
        }

        // Backend real: intenta obtener el perfil
        const res = await api.get<User>("/users/profile");
        setUser(res.data ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (USE_MOCK) {
        // Cualquier contraseña de 4+ caracteres
        if (!email || password.length < 4) return false;
        const mockUser: User = {
          id: 1,
          email: email.trim().toLowerCase(),
          username: email.split("@")[0],
          role: "ALUMNO",
        };
        localStorage.setItem("mock_user", JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      }

      // Backend real (Next.js API Routes)
      const res = await api.post<AuthResponse>("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // Esperamos { user, access, refresh }
      const { user: u, access, refresh } = res.data;
      saveTokens(access, refresh);
      setUser(u);
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Si se cae el backend, no reventamos el front
      return false;
    }
  };

  const doLogoutRequest = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await api.post("/auth/logout", { refresh });
      }
    } catch {
      // silencio: si el backend no está, igualmente limpiamos tokens
    }
  };

  const logout = async () => {
    if (USE_MOCK) {
      localStorage.removeItem("mock_user");
      setUser(null);
      return;
    }
    await doLogoutRequest();
    clearTokens();
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}

export { AuthContext };
