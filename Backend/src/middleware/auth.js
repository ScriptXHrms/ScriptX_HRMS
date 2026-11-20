import jwt from 'jsonwebtoken';
import { AdminUser, Employee, Privilege } from '../models/index.js';
import { MODULE_KEYS } from '../utils/modules.js';
import { forbidden, HttpError } from '../utils/http.js';

const PORTALS = ['admin', 'employee'];
const sessionCookie = (portal) => `scriptx_${portal}_session`;

export function signToken(payload, remember) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: remember ? '30d' : '12h' });
}

const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';

export function setSessionCookie(res, portal, token, remember) {
  res.cookie(sessionCookie(portal), token, {
    httpOnly: true,
    sameSite: isSecure ? 'none' : 'lax',
    secure: isSecure,
    path: '/',
    ...(remember ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
  });
}

export function clearSessionCookie(res, portal) {
  (PORTALS.includes(portal) ? [portal] : PORTALS).forEach((name) =>
    res.clearCookie(sessionCookie(name), {
      path: '/',
      sameSite: isSecure ? 'none' : 'lax',
      secure: isSecure,
    }),
  );
}

/**
 * Cookies ignore ports, so the two portals keep separate cookies and each app
 * names itself in X-Portal. File links can't send a header; any session will do.
 */
function sessionToken(req) {
  const portal = req.get('x-portal');
  if (PORTALS.includes(portal)) return req.cookies?.[sessionCookie(portal)];
  return PORTALS.map((name) => req.cookies?.[sessionCookie(name)]).find(Boolean);
}

/**
 * Loads the signed-in account. `req.auth` is:
 * { portal: 'admin'|'employee', account, employeeId, isSuperAdmin, modules: { key: 'view'|'manage' } }
 * HR staff are employees with a Privilege record, signed in to the admin portal.
 */
export async function protect(req, res, next) {
  const token = sessionToken(req);
  if (!token) throw new HttpError(401, 'Please sign in to continue.');

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }

  if (claims.kind === 'admin') {
    const account = await AdminUser.findById(claims.sub).lean();
    if (!account) throw new HttpError(401, 'Your session has expired. Please sign in again.');
    req.auth = {
      portal: 'admin',
      account,
      employeeId: null,
      isSuperAdmin: true,
      modules: Object.fromEntries(MODULE_KEYS.map((key) => [key, 'manage'])),
    };
    return next();
  }

  const account = await Employee.findById(claims.sub).populate('department', 'name').populate('role', 'name').lean();
  if (!account || account.status !== 'Active') throw new HttpError(401, 'Your session has expired. Please sign in again.');

  const privilege = claims.portal === 'admin' ? await Privilege.findOne({ employee: account._id }).lean() : null;
  if (claims.portal === 'admin' && !privilege) throw new HttpError(401, 'Your admin access was removed. Please sign in again.');

  req.auth = {
    portal: claims.portal,
    account,
    employeeId: account._id,
    isSuperAdmin: false,
    modules: Object.fromEntries((privilege?.modules ?? []).map((m) => [m.key, m.permission])),
  };
  return next();
}

export function adminPortal(req, res, next) {
  if (req.auth.portal !== 'admin') throw forbidden('Admin access is required.');
  next();
}

export function employeePortal(req, res, next) {
  if (req.auth.portal !== 'employee') throw forbidden('This is only available in the Employee Portal.');
  next();
}

/** Module access for the admin portal. 'view' covers reads; 'manage' is needed for writes. */
export function requireModule(key, level = 'view') {
  return (req, res, next) => {
    if (req.auth.portal !== 'admin') throw forbidden('Admin access is required.');
    const granted = req.auth.modules[key];
    if (!granted || (level === 'manage' && granted !== 'manage')) throw forbidden();
    next();
  };
}

export const moduleGuard = (key) => [[requireModule(key)], [requireModule(key, 'manage')]];
