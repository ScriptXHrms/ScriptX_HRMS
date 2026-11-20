/**
 * Safe wrappers around Web Storage. Storage can be unavailable (private mode,
 * blocked cookies) or contain corrupted JSON, so every access is guarded and
 * falls back to the provided default.
 */

function getStore(kind) {
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function readJSON(key, fallback, { validate, store = 'local' } = {}) {
  const storage = getStore(store);
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value, { store = 'local' } = {}) {
  const storage = getStore(store);
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key, { store = 'local' } = {}) {
  const storage = getStore(store);
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Prefix for every key this demo writes, so it is easy to find and clear. */
export const STORAGE_PREFIX = 'scriptx.demo';
