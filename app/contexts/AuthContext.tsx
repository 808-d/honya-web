import { createContext, useContext } from "react";
import { useAuthState } from "../hooks";
import type { AuthState } from "../hooks";

const AuthContext = createContext<AuthState | null>(null);

/** Provides the resolved session (from GET /auth/me) to the whole app. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
