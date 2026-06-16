import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(endpoint: string): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiClient.get<T>(endpoint)
      .then(res => {
        if (cancelled) return;
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.error?.message || 'Failed to load data');
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Network error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [endpoint, trigger]);

  return { data, loading, error, refetch };
}

// Hook for mutations (POST/PUT/DELETE)
export function useMutation<T, B = unknown>(
  method: 'post' | 'put' | 'delete'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    endpoint: string,
    body?: B
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = method === 'delete'
        ? await apiClient.delete<T>(endpoint)
        : await apiClient[method]<T>(endpoint, body);

      if (res.success) return res.data ?? null;
      setError(res.error?.message || 'Operation failed');
      return null;
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [method]);

  return { mutate, loading, error };
}