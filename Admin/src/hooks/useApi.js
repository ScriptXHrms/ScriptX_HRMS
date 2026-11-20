import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

/**
 * Loads a GET endpoint and refetches when `path` changes. Pass null to skip.
 * `reload()` refetches without clearing what is on screen.
 */
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: Boolean(path), error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    api
      .get(path, { signal: controller.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState((prev) => ({ ...prev, loading: false, error }));
      });
    return () => controller.abort();
  }, [path, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }));
  }, []);

  return { ...state, reload, setData };
}

/** Select options from /lookups. Returns {} until loaded. */
export function useLookups(keys) {
  const include = [keys].flat().filter(Boolean).join(',');
  const { data } = useApi(include ? `/lookups?include=${include}` : null);
  return data ?? {};
}
