import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * const toast = useToast();
 * toast.success('Task created', 'Assigned to Priya.');
 * toast.error('Something went wrong');   // also: toast.info / toast.warning
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return {
    ...context,
    showToast: (title, options = {}) => {
      const type = options?.type ?? 'info';
      if (type === 'success') context.success(title, options?.message);
      else if (type === 'warning') context.warning(title, options?.message);
      else if (type === 'error') context.error(title, options?.message);
      else context.info(title, options?.message);
    },
  };
}

