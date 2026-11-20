const BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? 'https://scriptx-hrms.onrender.com' : '');

/** Tells the API which portal's session to use, so both can stay signed in. */
const PORTAL = 'admin';
const TOKEN_KEY = `scriptx_${PORTAL}_token`;

export const getAuthToken = () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const UNREACHABLE = 'Can’t reach the server. Check that the API is running and try again.';
const TOO_SLOW = 'The server is taking too long to answer. Please try again.';
const GATEWAY_ERRORS = new Set([502, 503, 504]);
// Long enough for a slow database, short enough that a stuck request never spins forever. Uploads get longer.
const TIMEOUT_MS = 20000;
const UPLOAD_TIMEOUT_MS = 120000;

async function request(method, path, body, options = {}) {
  const isForm = body instanceof FormData;
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(
    () => {
      timedOut = true;
      controller.abort();
    },
    isForm ? UPLOAD_TIMEOUT_MS : TIMEOUT_MS,
  );
  options.signal?.addEventListener('abort', () => controller.abort(), { once: true });
  const token = getAuthToken();
  let response;
  try {
    response = await fetch(`${BASE}/api${path}`, {
      method,
      credentials: 'include',
      headers: {
        'X-Portal': PORTAL,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) throw new ApiError(TOO_SLOW, 0);
    if (error.name === 'AbortError') throw error;
    throw new ApiError(UNREACHABLE, 0);
  } finally {
    clearTimeout(timer);
  }

  // A proxy answers these itself when the API is down, so there is no JSON body.
  if (GATEWAY_ERRORS.has(response.status)) throw new ApiError(UNREACHABLE, response.status);

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/login') && path !== '/auth/me') window.dispatchEvent(new Event('scriptx:session-expired'));
    throw new ApiError(data?.message ?? 'Something went wrong. Please try again.', response.status);
  }
  return data;
}

export const api = {
  get: (path, options) => request('GET', path, undefined, options),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  del: (path) => request('DELETE', path),
};

/** Builds "?a=1&b=2", skipping empty values. */
export function withQuery(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value);
  });
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

/** Same-origin link to an uploaded file. */
export const fileUrl = (url) => (url ? `${BASE}${url}` : '');
