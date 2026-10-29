import { createContext, useContext, useMemo } from "react";
import { useAuthState } from "../hooks";
import { usePermissionsState } from "../hooks/use-permissions";
import type { AuthState } from "../hooks";
import type { PermissionsState } from "../hooks/use-permissions";

export interface AuthContextValue extends AuthState, PermissionsState {}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Provides the resolved session and its live feature set to the whole app. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();
  const permissions = usePermissionsState(auth.user?.id ?? null);

  const value = useMemo<AuthContextValue>(
    () => ({ ...auth, ...permissions }),
    [auth, permissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
