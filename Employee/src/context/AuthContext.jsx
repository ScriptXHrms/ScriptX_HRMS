import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../api/client';
import { setRememberedEmail } from '../utils/authHelpers';
import { DISPLAY_FORMATS_CHANGED_EVENT, getDisplayFormats, setDisplayFormats } from '../utils/dateUtils';

/** Holds the signed-in account. The session itself is an HTTP-only cookie. */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [displayFormats, setDisplayFormatsState] = useState(() => getDisplayFormats());

  useEffect(() => {
    let active = true;
    api
      .get('/auth/me')
      .then((data) => {
        if (!active) return;
        setSession(data?.authenticated ? data : null);
      })
      .catch(() => active && setSession(null))
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onFormatChange = (e) => {
      setDisplayFormatsState(e?.detail || getDisplayFormats());
    };
    window.addEventListener(DISPLAY_FORMATS_CHANGED_EVENT, onFormatChange);
    return () => window.removeEventListener(DISPLAY_FORMATS_CHANGED_EVENT, onFormatChange);
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchSettings = () => {
      api.get('/settings').then(({ item }) => setDisplayFormats(item)).catch(() => {});
    };
    fetchSettings();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchSettings();
    };
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', fetchSettings);
    return () => {
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', fetchSettings);
    };
  }, [session]);

  useEffect(() => {
    const onExpired = () => {
      setAuthToken(null);
      setSession(null);
    };
    window.addEventListener('scriptx:session-expired', onExpired);
    return () => window.removeEventListener('scriptx:session-expired', onExpired);
  }, []);

  const login = useCallback(async ({ role, email, password, remember }) => {
    const res = await api.post('/auth/login', { role, email: email.trim(), password, remember });
    if (res?.token) setAuthToken(res.token);
    const next = await api.get('/auth/me');
    setRememberedEmail(role, remember ? email.trim() : null);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setAuthToken(null);
    setSession(null);
  }, []);

  const value = useMemo(() => {
    const modules = session?.modules ?? {};
    return {
      ready,
      session,
      user: session?.user ?? null,
      role: session?.role ?? null,
      modules,
      isAuthenticated: Boolean(session),
      displayFormats,
      /** can('finance') to read, can('finance', 'manage') to change. */
      can: (key, level = 'view') => (level === 'manage' ? modules[key] === 'manage' : Boolean(modules[key])),
      login,
      logout,
    };
  }, [session, ready, login, logout, displayFormats]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
