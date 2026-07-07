import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useQueryParams(): Record<string, string> {
  const { search } = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(search);
    const out: Record<string, string> = {};
    params.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }, [search]);
}
