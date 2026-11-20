import jwt from 'jsonwebtoken';
import { AdminUser, Employee, Privilege } from '../models/index.js';
import { MODULE_KEYS } from '../utils/modules.js';
import { forbidden, HttpError } from '../utils/http.js';

const PORTALS = ['admin', 'employee'];
const sessionCookie = (portal) => `scriptx_${portal}_session`;

export function signToken(payload, remember) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: remember ? '30d' : '12h' });
}

function isHttpsEnv(res) {
  const req = res?.req;
  return Boolean(
    req?.secure ||
    req?.get?.('x-forwarded-proto') === 'https' ||
    process.env.RENDER ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.NODE_ENV === 'production' ||
    process.env.COOKIE_SECURE === 'true'
  );
}

export function setSessionCookie(res, portal, token, remember) {
  const secure = isHttpsEnv(res);
  res.cookie(sessionCookie(portal), token, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure: secure,
    path: '/',
    ...(remember ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
  });
}

export function clearSessionCookie(res, portal) {
  const secure = isHttpsEnv(res);
  (PORTALS.includes(portal) ? [portal] : PORTALS).forEach((name) =>
    res.clearCookie(sessionCookie(name), {
      path: '/',
      sameSite: secure ? 'none' : 'lax',
      secure: secure,
    }),
  );
}

/**
 * Checks Authorization header first (Bearer token), then falls back to the
 * portal-specific session cookie. No legacy `scriptx_session` fallback.
 */
function sessionToken(req) {
  const authHeader = req.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  const portal = req.get('x-portal');
  if (PORTALS.includes(portal) && req.cookies?.[sessionCookie(portal)]) {
    return req.cookies[sessionCookie(portal)];
  }
  return PORTALS.map((name) => req.cookies?.[sessionCookie(name)]).find(Boolean);
}

/**
 * Shared auth resolver. Returns `req.auth`-shaped object on success.
 * Throws HttpError on any failure (no token, bad token, portal mismatch,
 * deleted account, removed privilege).
 */
export async function resolveAuth(req) {
  const token = sessionToken(req);
  if (!token) throw new HttpError(401, 'Please sign in to continue.');

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }

  // Portal mismatch: admin token used on employee portal or vice-versa.
  const headerPortal = req.get('x-portal');
  if (PORTALS.includes(headerPortal) && claims.portal !== headerPortal) {
    throw new HttpError(401, 'Please sign in to continue.');
  }

  if (claims.kind === 'admin') {
    const account = await AdminUser.findById(claims.sub).lean();
    if (!account) throw new HttpError(401, 'Your session has expired. Please sign in again.');
    return {
      portal: 'admin',
      account,
      employeeId: null,
      isSuperAdmin: true,
      modules: Object.fromEntries(MODULE_KEYS.map((key) => [key, 'manage'])),
    };
  }

  const account = await Employee.findById(claims.sub).populate('department', 'name').populate('role', 'name').lean();
  if (!account || account.status !== 'Active') throw new HttpError(401, 'Your session has expired. Please sign in again.');

  const privilege = claims.portal === 'admin' ? await Privilege.findOne({ employee: account._id }).lean() : null;
  if (claims.portal === 'admin' && !privilege) throw new HttpError(401, 'Your admin access was removed. Please sign in again.');

  return {
    portal: claims.portal,
    account,
    employeeId: account._id,
    isSuperAdmin: false,
    modules: Object.fromEntries((privilege?.modules ?? []).map((m) => [m.key, m.permission])),
  };
}

/**
 * Express middleware. Populates `req.auth` or responds 401.
 * Used on every protected route *except* GET /auth/me.
 */
export async function protect(req, res, next) {
  req.auth = await resolveAuth(req);
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
