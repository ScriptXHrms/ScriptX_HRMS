import { readJSON, removeKey, STORAGE_PREFIX, writeJSON } from './storage';

export const ROLES = { ADMIN: 'admin' };

const rememberedEmailKey = (role) => `${STORAGE_PREFIX}.rememberEmail.${role}`;

/** The starter admin account. Shown on the login page in development only. */
export const DEMO_CREDENTIALS = import.meta.env.DEV ? { admin: { email: 'admin@demo.com', password: 'Admin@123' } } : {};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Field-level validation shared by both login forms. Returns an errors object. */
export function validateLoginForm({ email, password }) {
  const errors = {};
  const trimmed = (email ?? '').trim();
  if (!trimmed) errors.email = 'Enter your work email.';
  else if (!EMAIL_PATTERN.test(trimmed)) errors.email = 'Enter a valid email address, e.g. name@company.com.';
  if (!password) errors.password = 'Enter your password.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  return errors;
}

export function getRememberedEmail(role) {
  const value = readJSON(rememberedEmailKey(role), null);
  return typeof value === 'string' ? value : '';
}

export function setRememberedEmail(role, email) {
  if (email) writeJSON(rememberedEmailKey(role), email);
  else removeKey(rememberedEmailKey(role));
}
