import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * URL-backed filter state. Updates are built from the live URL (not the last
 * rendered params) so quick successive changes never overwrite each other.
 *
 * const [params, updateParams, resetParams] = useQueryParams();
 * updateParams({ status: 'Absent', q: '' })   // empty values remove the key
 * resetParams(['sort'])                        // clear everything except `sort`
 */
export function useQueryParams() {
  const [params, setParams] = useSearchParams();

  const updateParams = useCallback(
    (entries) => {
      const next = new URLSearchParams(window.location.search);
      Object.entries(entries).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      });
      setParams(next, { replace: true });
    },
    [setParams],
  );

  const resetParams = useCallback(
    (keep = []) => {
      const current = new URLSearchParams(window.location.search);
      const next = new URLSearchParams();
      keep.forEach((key) => {
        if (current.get(key)) next.set(key, current.get(key));
      });
      setParams(next, { replace: true });
    },
    [setParams],
  );

  return [params, updateParams, resetParams];
}
