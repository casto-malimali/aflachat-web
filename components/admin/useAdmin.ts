"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminAuthError } from "@/lib/adminApi";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads admin data with loading/error state and manual refetch. An
 * AdminAuthError bubbles to `onAuthError` so the shell can drop back to the
 * key prompt instead of showing a generic error.
 */
export function useAdminData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
  onAuthError?: () => void,
) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });

  const run = useCallback(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (!active) return;
        if (err instanceof AdminAuthError) {
          onAuthError?.();
          return;
        }
        setState({ data: null, loading: false, error: (err as Error).message });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(run, [run]);

  return { ...state, refetch: run };
}
