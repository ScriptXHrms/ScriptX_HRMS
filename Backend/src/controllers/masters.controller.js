import mongoose from 'mongoose';
import {
  Announcement, AssetCategory, Client, Department, Employee, FinanceAccount,
  getSettings, Holiday, Invoice, LeaveType, Project, Role, Settings, Shift, Notification,
  AssetSubCategory,
} from '../models/index.js';
import { dayKey } from '../utils/dates.js';
import { badRequest, notFound } from '../utils/http.js';
import { MODULES } from '../utils/modules.js';

export const getHolidayYears = async (req, res) => {
  const years = (await Holiday.distinct('date')).map((d) => d.slice(0, 4));
  res.json({ years: [...new Set([...years, dayKey().slice(0, 4)])].sort() });
};

export const getActiveAnnouncements = async (req, res) => {
  const today = dayKey();
  const audience = req.auth.portal === 'admin' ? ['Everyone', 'Admins'] : ['Everyone', 'Employees'];
  const items = await Announcement.find({ status: 'Active', date: { $lte: today }, expiryDate: { $gte: today }, visible: { $in: audience } }).sort({ date: -1 }).lean();
  res.json({ items });
};

export const getNextInvoiceNumber = async (req, res) => {
  const count = await Invoice.countDocuments();
  res.json({ number: `SX-INV-${dayKey().slice(0, 4)}-${String(count + 1).padStart(4, '0')}` });
};

export const getPrivilegeModules = (req, res) => {
  res.json({ items: MODULES });
};

const SETTING_FIELDS = Object.keys(Settings.schema.paths).filter((key) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key));

export const getSettingsData = async (req, res) => {
  res.json({ item: await getSettings() });
};

export const updateSettingsData = async (req, res) => {
  const current = await Settings.findOne();
  const doc = current ?? new Settings();
  SETTING_FIELDS.forEach((key) => {
    if (req.body[key] !== undefined) doc[key] = req.body[key];
  });
  await doc.save();
  res.json({ item: doc });
};

const inbox = (req) => (req.auth.portal === 'admin' ? { audience: 'admin' } : { audience: 'employee', employee: req.auth.employeeId });

export const getNotifications = async (req, res) => {
  const items = await Notification.find(inbox(req)).sort({ createdAt: -1 }).limit(30).lean();
  res.json({ items });
};

export const readAllNotifications = async (req, res) => {
  await Notification.updateMany({ ...inbox(req), read: false }, { read: true });
  res.json({ ok: true });
};

export const readNotification = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound();
  await Notification.updateOne({ _id: req.params.id, ...inbox(req) }, { read: true });
  res.json({ ok: true });
};

const LOOKUPS = {
  departments: () => Department.find({ status: 'Active' }).select('name').sort({ name: 1 }),
  roles: () => Role.find({ status: 'Active' }).select('name department').sort({ name: 1 }),
  shifts: () => Shift.find({ status: 'Active' }).select('name from to color').sort({ name: 1 }),
  employees: () => Employee.find({ status: { $ne: 'Relieved' } }).select('name employeeId photo').sort({ name: 1 }),
  clients: () => Client.find({ status: 'Active' }).select('client_name company_name').sort({ client_name: 1 }),
  projects: () => Project.find({ status: { $in: ['Active', 'On Hold'] } }).select('name client').sort({ name: 1 }),
  leaveTypes: () => LeaveType.find({ status: 'Active' }).select('name shortCode').sort({ name: 1 }),
  accounts: () => FinanceAccount.find({ status: 'Active' }).select('name accountType').sort({ name: 1 }),
  assetCategories: () => AssetCategory.find().select('name').sort({ name: 1 }),
  assetSubCategories: () => AssetSubCategory.find().select('name category').sort({ name: 1 }),
};

export const getLookups = async (req, res) => {
  const keys = String(req.query.include ?? '').split(',').filter((key) => LOOKUPS[key]);
  const results = await Promise.all(keys.map((key) => LOOKUPS[key]().lean()));
  res.json(Object.fromEntries(keys.map((key, index) => [key, results[index]])));
};
