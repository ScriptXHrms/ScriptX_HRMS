import { useCallback, useState } from 'react';
import { useToast } from './useToast';

/**
 * Wraps a mutation: tracks `busy` and turns failures into an error toast.
 * Resolves to the result, or undefined when it failed.
 */
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (action, { success, successMessage, errorTitle = 'That didn’t work' } = {}) => {
      setBusy(true);
      try {
        const result = await action();
        if (success) toast.success(success, successMessage);
        return result ?? true;
      } catch (error) {
        toast.error(errorTitle, error.message);
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [toast],
  );

  return { busy, run };
}
