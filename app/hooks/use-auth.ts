import { useCallback, useEffect, useState } from "react";
import { honyaFetch } from "../lib/api-client";
import { useAsync, useAsyncMutation } from "./use-async";
import type { LoginDto, RegisterDto, UserDto } from "../models/api";

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  display_name: string;
  email: string;
  password: string;
}

export interface ForgotInput {
  email: string;
}

export interface ResetInput {
  id: string;
  token: string;
  password: string;
}

export function useLogin() {
  return useAsyncMutation<LoginInput, LoginDto>((input) =>
    honyaFetch<LoginDto>("/auth/login", { method: "POST", body: input }),
  );
}

export function useRegister() {
  return useAsyncMutation<RegisterInput, RegisterDto>((input) =>
    honyaFetch<RegisterDto>("/auth/register", { method: "POST", body: input }),
  );
}

export function useForgotPassword() {
  return useAsyncMutation<ForgotInput, null>((input) =>
    honyaFetch<null>("/auth/password/forgot", { method: "POST", body: input }),
  );
}

export function useResetPassword() {
  return useAsyncMutation<ResetInput, null>((input) =>
    honyaFetch<null>("/auth/password/reset", {
      method: "POST",
      body: { id: input.id, token: input.token, new_password: input.password },
    }),
  );
}

/** Consumes the emailed verification link; honya-api logs the user in on success. */
export function useVerifyRegister(id: string, token: string) {
  return useAsync<LoginDto>(`auth:verify:${id}:${token}`, async (signal) => {
    if (!id || !token) {
      throw new Error("This verification link is missing its id or token.");
    }
    return honyaFetch<LoginDto>("/auth/register/verify", { query: { id, token }, signal });
  });
}

export interface AuthState {
  user: UserDto | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<UserDto>;
  logout: () => void;
  refresh: () => Promise<UserDto | null>;
}

/** Resolves the session from the access-token cookie via GET /auth/me. */
async function fetchMe(signal?: AbortSignal): Promise<UserDto | null> {
  try {
    return await honyaFetch<UserDto>("/auth/me", { signal });
  } catch {
    return null;
  }
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    let active = true;
    fetchMe().then((me) => {
      if (!active) return;
      setUser(me);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    await honyaFetch<LoginDto>("/auth/login", { method: "POST", body: input });
    const me = await fetchMe();
    setUser(me);
    if (!me) throw new Error("Signed in, but could not load your account.");
    return me;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return { user, loading, login, logout, refresh };
}
