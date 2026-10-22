import type { ApiEnvelope } from "../models/api";

// Browser-side transport. All requests go straight to honya-api using the
// public VITE_BACKEND_URL (localhost only), hitting /api/v1/<path>. Hooks use
// this; components never call it directly.

export const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:8080";

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

type QueryValue = string | number | boolean | undefined | null;

export interface HonyaFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

export async function honyaFetch<T>(path: string, options: HonyaFetchOptions = {}): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${BACKEND_URL}/api/v1${normalized}`);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    signal: options.signal,
  });

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    envelope = null;
  }

  if (!response.ok || (envelope && envelope.success === false)) {
    throw new ApiClientError(
      envelope?.message || response.statusText || "request failed",
      response.status,
      envelope?.error,
    );
  }

  return envelope?.data as T;
}
