"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AUTH_EVENT, getCurrentUser, type User } from "@/lib/auth";

const AuthContext = createContext<{ user: User | null; ready: boolean }>({
  user: null,
  ready: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    sync();
    setReady(true);
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>;
}
