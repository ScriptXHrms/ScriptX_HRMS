import { useEffect, useState } from 'react';

/** Returns the current time, refreshed every `intervalMs` while `enabled`. */
export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return undefined;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);

  return now;
}
