import { useState, useCallback } from 'react';
import api from '../config/api';
import type { AxiosError } from 'axios';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunc: (...args: any[]) => Promise<any>
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunc(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<any>;
        const errorMessage =
          axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Error desconocido';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}