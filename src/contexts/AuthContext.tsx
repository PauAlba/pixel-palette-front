import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Session {
  access_token: string;
}

type Ctx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setSession({ access_token: token });
      const data = await apiFetch<User | { user: User }>("/auth/me");
      // Ajuste por si el backend devuelve directamente el usuario o envuelto en { user }
      const userData = 'user' in data && data.user ? data.user : data as User;
      setUser(userData);
    } catch (e) {
      // El apiFetch con interceptor ya limpia localStorage si el refresh falla
      // Solo actualizamos el estado local
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const signIn: Ctx["signIn"] = async (email, password) => {
    try {
      const data = await apiFetch<{ accessToken: string; refreshToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      await loadUser();
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to sign in" };
    }
  };

  const signUp: Ctx["signUp"] = async (email, password, username) => {
    try {
      const data = await apiFetch<{ accessToken: string; refreshToken: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, username, display_name: username }),
      });
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      await loadUser();
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to sign up" };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setSession(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
