import { useCallback, useEffect, useRef, useState } from "react";

// Generic async primitives. All data hooks are built on these so that loading /
// error / refetch behaviour stays consistent across the app.

export interface AsyncQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAsync<T>(
  key: string,
  loader: (signal: AbortSignal) => Promise<T>,
): AsyncQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    loaderRef
      .current(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch };
}

export interface AsyncMutationResult<TInput, TResult> {
  mutate: (input: TInput) => Promise<TResult>;
  loading: boolean;
  error: string | null;
  data: TResult | null;
  reset: () => void;
}

export function useAsyncMutation<TInput, TResult>(
  action: (input: TInput) => Promise<TResult>,
): AsyncMutationResult<TInput, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const actionRef = useRef(action);
  actionRef.current = action;

  const mutate = useCallback(async (input: TInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actionRef.current(input);
      setData(result);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return { mutate, loading, error, data, reset };
}
