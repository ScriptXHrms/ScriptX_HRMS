import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { AdminUser, Employee, Privilege } from '../models/index.js';
import { clearSessionCookie, resolveAuth, setSessionCookie, signToken } from '../middleware/auth.js';
import { badRequest, HttpError } from '../utils/http.js';
import { sendMail } from '../utils/mail.js';

const WRONG_CREDENTIALS = 'Incorrect email or password. Please check them and try again.';
const MIN_PASSWORD = 8;
const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

function publicUser(account, kind) {
  if (kind === 'admin') {
    return {
      id: account._id,
      name: account.name,
      fullName: account.fullName ?? account.name,
      email: account.email,
      designation: account.designation,
      department: account.department,
    };
  }
  return {
    id: account._id,
    employeeId: account.employeeId,
    name: account.name,
    fullName: account.name,
    email: account.email,
    photo: account.photo,
    designation: account.role?.name ?? account.employeeType,
    department: account.department?.name ?? '',
  };
}

export async function login(req, res) {
  const { role, password, remember } = req.body;
  const email = normalizeEmail(req.body.email);
  if (!['admin', 'employee'].includes(role)) throw badRequest('Unknown portal. Please reload the page and try again.');
  if (!email || !password) throw badRequest('Enter your email and password.');

  const [admin, employee] = await Promise.all([
    AdminUser.findOne({ email }).select('+password'),
    Employee.findOne({ email }).select('+password').populate('department', 'name').populate('role', 'name'),
  ]);
  const account = admin ?? employee;
  if (!account || !(await bcrypt.compare(String(password), account.password))) throw new HttpError(401, WRONG_CREDENTIALS);

  if (employee && !admin && employee.status === 'Relieved') throw new HttpError(403, 'This account is no longer active.');

  let portal = role;
  if (admin && role === 'employee') throw new HttpError(403, 'This account belongs to the Admin Portal. Please sign in there instead.');
  if (!admin && role === 'admin') {
    const privilege = await Privilege.exists({ employee: employee._id });
    if (!privilege) throw new HttpError(403, 'This account belongs to the Employee Portal. Please sign in there instead.');
    portal = 'admin';
  }

  const kind = admin ? 'admin' : 'employee';
  const token = signToken({ sub: account._id, kind, portal }, Boolean(remember));
  setSessionCookie(res, portal, token, Boolean(remember));
  res.json({ ok: true, token });
}

export function logout(req, res) {
  clearSessionCookie(res, req.get('x-portal'));
  res.json({ ok: true });
}

/**
 * Hard-auth version: used after protect() middleware on other routes.
 * req.auth is guaranteed to exist.
 */
export async function getMe(req, res) {
  const { portal, account, isSuperAdmin } = req.auth;
  res.json({
    authenticated: true,
    role: portal,
    isSuperAdmin,
    modules: req.auth.modules,
    user: publicUser(account, isSuperAdmin ? 'admin' : 'employee'),
  });
}

/**
 * Soft-auth "who am I?" — always returns 200.
 * No session → { authenticated: false, user: null }.
 * Valid session → same payload as getMe plus authenticated: true.
 */
export async function getMeSoft(req, res) {
  try {
    const auth = await resolveAuth(req);
    const { portal, account, isSuperAdmin } = auth;
    res.json({
      authenticated: true,
      role: portal,
      isSuperAdmin,
      modules: auth.modules,
      user: publicUser(account, isSuperAdmin ? 'admin' : 'employee'),
    });
  } catch {
    res.json({ authenticated: false, user: null });
  }
}

export async function changePassword(req, res) {
  const { current, next } = req.body;
  if (!next || String(next).length < MIN_PASSWORD) throw badRequest(`New password must be at least ${MIN_PASSWORD} characters.`);
  const Model = req.auth.isSuperAdmin ? AdminUser : Employee;
  const account = await Model.findById(req.auth.account._id).select('+password');
  if (!(await bcrypt.compare(String(current ?? ''), account.password))) throw badRequest('Your current password is incorrect.');
  account.password = await bcrypt.hash(String(next), 10);
  await account.save();
  res.json({ ok: true });
}

export async function forgotPassword(req, res) {
  const email = normalizeEmail(req.body.email);
  const account = (await AdminUser.findOne({ email })) ?? (await Employee.findOne({ email, status: { $ne: 'Relieved' } }));
  if (account) {
    const code = String(crypto.randomInt(100000, 1000000));
    account.resetCode = await bcrypt.hash(code, 10);
    account.resetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await account.save();
    await sendMail({
      to: account.email,
      subject: 'Your ScriptX HRMS password reset code',
      text: `Your reset code is ${code}. It expires in 15 minutes.`,
    });
  }
  res.json({ ok: true });
}

export async function resetPassword(req, res) {
  const email = normalizeEmail(req.body.email);
  const { code, password } = req.body;
  if (!password || String(password).length < MIN_PASSWORD) throw badRequest(`Password must be at least ${MIN_PASSWORD} characters.`);

  const fields = '+password +resetCode +resetExpires';
  const account = (await AdminUser.findOne({ email }).select(fields)) ?? (await Employee.findOne({ email }).select(fields));
  const valid =
    account?.resetCode && account.resetExpires > new Date() && (await bcrypt.compare(String(code ?? ''), account.resetCode));
  if (!valid) throw badRequest('That code is invalid or has expired.');

  account.password = await bcrypt.hash(String(password), 10);
  account.resetCode = undefined;
  account.resetExpires = undefined;
  await account.save();
  res.json({ ok: true });
}
