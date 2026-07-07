"use client";
/**
 * Custom hook to fetch data from any API function.
 * Enforces loading → data | error pattern. No fallbacks to fake data.
 */
import { useState, useEffect, useCallback, useRef } from "react";

interface UseFetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
  lastUpdated: Date | null;
}

export function useFetch<T>(
  fetcher: () => Promise<{ data: T | null; error: string | null }>,
  options?: {
    refreshInterval?: number; // ms, 0 = no auto-refresh
    deps?: unknown[];
  }
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetcherRef.current();
    if (result.error) {
      setError(result.error);
      setData(null);
    } else {
      setData(result.data);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    doFetch();
  }, [doFetch, ...(options?.deps ?? [])]);

  useEffect(() => {
    if (!options?.refreshInterval || options.refreshInterval <= 0) return;
    const interval = setInterval(doFetch, options.refreshInterval);
    return () => clearInterval(interval);
  }, [doFetch, options?.refreshInterval]);

  return { data, error, loading, refetch: doFetch, lastUpdated };
}
