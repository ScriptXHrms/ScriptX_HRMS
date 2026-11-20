import { Router } from 'express';
import {
  Announcement, Asset, AssetCategory, AssetSubCategory, Client, ClientPayment, DailyReport, Department, Employee, FinanceAccount,
  Holiday, Invoice, LeaveType, nextSequence, Privilege, Project, Protocol, Role, Shift, Task,
} from '../models/index.js';
import { moduleGuard, requireModule } from '../middleware/auth.js';
import { crudRouter } from '../utils/crud.js';
import { dayKey } from '../utils/dates.js';
import { badRequest, conflict } from '../utils/http.js';
import { MODULE_KEYS } from '../utils/modules.js';
import { notifyEmployees } from '../utils/notify.js';
import {
  getHolidayYears,
  getActiveAnnouncements,
  getNextInvoiceNumber,
  getPrivilegeModules,
  getSettingsData,
  updateSettingsData,
  getNotifications,
  readAllNotifications,
  readNotification,
  getLookups,
} from '../controllers/masters.controller.js';

const router = Router();

/* ---- Organisation ---- */
router.use('/departments', crudRouter(Department, {
  searchFields: ['name'],
  filterFields: ['status'],
  sort: { name: 1 },
  writable: ['name', 'status'],
  guard: moduleGuard('onboarding'),
  beforeDelete: async (doc) => {
    if (await Role.exists({ department: doc._id })) throw conflict('Remove this department’s roles first.');
    if (await Employee.exists({ department: doc._id })) throw conflict('Employees still belong to this department.');
  },
}));

router.use('/roles', crudRouter(Role, {
  searchFields: ['name'],
  filterFields: ['status', 'department'],
  populate: { path: 'department', select: 'name' },
  sort: { name: 1 },
  writable: ['name', 'department', 'status'],
  guard: moduleGuard('onboarding'),
  beforeDelete: async (doc) => {
    if (await Employee.exists({ role: doc._id })) throw conflict('Employees still use this role.');
  },
}));

router.use('/shifts', crudRouter(Shift, {
  searchFields: ['name'],
  filterFields: ['status'],
  sort: { name: 1 },
  writable: ['name', 'from', 'to', 'color', 'status'],
  guard: moduleGuard('attendance'),
  beforeDelete: async (doc) => {
    if (await Employee.exists({ shift: doc._id })) throw conflict('Employees are still on this shift.');
  },
}));

router.use('/leave-types', crudRouter(LeaveType, {
  searchFields: ['name', 'shortCode'],
  filterFields: ['status'],
  sort: { name: 1 },
  writable: ['name', 'shortCode', 'paid', 'status'],
  guard: moduleGuard('leave'),
}));

/* ---- Holidays ---- */
const holidays = Router();
holidays.get('/years', getHolidayYears);
router.use('/holidays', holidays);
router.use('/holidays', crudRouter(Holiday, {
  searchFields: ['reason'],
  dateField: 'date',
  sort: { date: 1 },
  writable: ['date', 'reason'],
  guard: [[], [requireModule('holidays', 'manage')]],
}));

/* ---- Announcements ---- */
const announcements = Router();
announcements.get('/active', getActiveAnnouncements);
router.use('/announcements', announcements);
router.use('/announcements', crudRouter(Announcement, {
  searchFields: ['title', 'message'],
  filterFields: ['status', 'visible'],
  dateField: 'date',
  sort: { date: -1 },
  writable: ['date', 'expiryDate', 'title', 'message', 'visible', 'status'],
  guard: moduleGuard('announcements'),
  sanitize: (data) => {
    if (data.date && data.expiryDate && data.expiryDate < data.date) throw badRequest('Expiry date can’t be before the date.');
    return data;
  },
  afterCreate: async (doc) => {
    if (doc.visible === 'Admins' || doc.status !== 'Active') return;
    const employees = await Employee.find({ status: 'Active' }).select('_id').lean();
    await notifyEmployees(employees.map((e) => e._id), { type: 'announcement', title: 'New announcement', message: doc.message.slice(0, 120), link: '/employee/dashboard' });
  },
}));

/* ---- Clients, projects, invoices ---- */
router.use('/clients', crudRouter(Client, {
  searchFields: ['client_name', 'company_name', 'email', 'phone_number'],
  filterFields: ['status', 'country'],
  sort: { client_name: 1 },
  writable: ['client_name', 'company_name', 'trader_name', 'source', 'email', 'phone_number', 'address', 'gst', 'country', 'contact_person', 'contact_person_role', 'website', 'status', 'notes'],
  guard: moduleGuard('clients'),
  beforeDelete: async (doc) => {
    if (await Project.exists({ client: doc._id })) throw conflict('This client has projects. Remove them or mark the client Inactive.');
    if (await Invoice.exists({ client: doc._id })) throw conflict('This client has invoices. Mark the client Inactive instead.');
  },
}));

router.use('/projects', crudRouter(Project, {
  searchFields: ['name'],
  filterFields: ['status', 'client', 'priority'],
  populate: [
    { path: 'client', select: 'client_name company_name' },
    { path: 'manager', select: 'name employeeId' },
    { path: 'team', select: 'name employeeId' },
  ],
  writable: ['name', 'description', 'client', 'manager', 'team', 'startDate', 'endDate', 'status', 'priority', 'budget', 'currency', 'paymentType', 'gst', 'notes'],
  guard: moduleGuard('projects'),
  sanitize: (data) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) throw badRequest('End date can’t be before the start date.');
    return data;
  },
  beforeDelete: async (doc) => {
    if (await Task.exists({ project: doc._id })) throw conflict('This project has tasks. Mark it Inactive instead.');
    if (await DailyReport.exists({ 'tasks.project': doc._id })) throw conflict('Daily reports reference this project. Mark it Inactive instead.');
    if (await ClientPayment.exists({ project: doc._id })) throw conflict('Client payments reference this project.');
  },
}));

function invoiceTotals(data) {
  const items = (data.items ?? [])
    .filter((item) => String(item.description ?? '').trim())
    .map((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      return { ...item, quantity, rate, amount: Math.round(quantity * rate * 100) / 100 };
    });
  if (items.length === 0) throw badRequest('Add at least one line item.');
  const subTotal = items.reduce((total, item) => total + item.amount, 0);
  const cgst = Number(data.cgst) || 0;
  const sgst = Number(data.sgst) || 0;
  const igst = Number(data.igst) || 0;
  const totalAmount = Math.round((subTotal + cgst + sgst + igst) * 100) / 100;
  const receivedAmount = Number(data.receivedAmount) || 0;
  if (receivedAmount > totalAmount) throw badRequest('Received amount can’t exceed the invoice total.');
  const status = receivedAmount >= totalAmount ? 'Paid' : receivedAmount > 0 ? 'Partial' : 'Unpaid';
  return { ...data, items, subTotal, cgst, sgst, igst, totalAmount, receivedAmount, status, paidDate: status === 'Paid' ? data.paidDate || dayKey() : undefined };
}

const invoiceRoutes = crudRouter(Invoice, {
  searchFields: ['invoiceNumber'],
  filterFields: ['client', 'project', 'status', 'invoiceType'],
  dateField: 'invoiceDate',
  populate: [{ path: 'client', select: 'client_name company_name email phone_number address gst contact_person' }, { path: 'project', select: 'name' }],
  sort: { invoiceDate: -1, createdAt: -1 },
  writable: ['invoiceNumber', 'client', 'project', 'invoiceType', 'invoiceDate', 'dueDate', 'currency', 'items', 'cgst', 'sgst', 'igst', 'receivedAmount', 'paidDate', 'notes', 'paymentMethod', 'paymentInfo', 'signatureImage', 'signatureName', 'signatureDesignation'],
  guard: moduleGuard('clients'),
  sanitize: invoiceTotals,
});

const invoices = Router();
invoices.get('/next-number', requireModule('clients'), getNextInvoiceNumber);
invoices.use(async (req, res, next) => {
  if (req.method === 'POST' && !req.body.invoiceNumber) {
    req.body.invoiceNumber = `SX-INV-${dayKey().slice(0, 4)}-${String(await nextSequence('invoice')).padStart(4, '0')}`;
  }
  next();
});
router.use('/invoices', invoices, invoiceRoutes);

/* ---- Assets ---- */
router.use('/asset-categories', crudRouter(AssetCategory, {
  searchFields: ['name'],
  sort: { name: 1 },
  writable: ['name'],
  guard: moduleGuard('assets'),
  beforeDelete: async (doc) => {
    if (await Asset.exists({ category: doc._id })) throw conflict('Assets still use this category.');
    await AssetSubCategory.deleteMany({ category: doc._id });
  },
}));

router.use('/asset-subcategories', crudRouter(AssetSubCategory, {
  searchFields: ['name'],
  filterFields: ['category'],
  populate: { path: 'category', select: 'name' },
  sort: { name: 1 },
  writable: ['name', 'category'],
  guard: moduleGuard('assets'),
  beforeDelete: async (doc) => {
    if (await Asset.exists({ subCategory: doc._id })) throw conflict('Assets still use this sub category.');
  },
}));

router.use('/assets', crudRouter(Asset, {
  searchFields: ['title', 'invoiceNumber', 'ledger'],
  filterFields: ['category', 'subCategory'],
  dateField: 'purchasedDate',
  populate: [{ path: 'category', select: 'name' }, { path: 'subCategory', select: 'name' }, { path: 'assignedTo', select: 'name employeeId' }],
  sort: { purchasedDate: -1 },
  writable: ['invoiceNumber', 'purchasedDate', 'ledger', 'category', 'subCategory', 'title', 'depreciationPercentage', 'quantity', 'rate', 'gstRate', 'igst', 'warrantyYears', 'disposedDate', 'assignedTo'],
  guard: moduleGuard('assets'),
  sanitize: (data) => {
    const taxable = (Number(data.quantity) || 0) * (Number(data.rate) || 0);
    const gst = taxable * ((Number(data.gstRate) || 0) / 100);
    const interstate = data.igst === true || data.igst === 'true';
    const round = (value) => Math.round(value * 100) / 100;
    return {
      ...data,
      taxable: round(taxable),
      cgst: interstate ? 0 : round(gst / 2),
      sgst: interstate ? 0 : round(gst / 2),
      igst: interstate ? round(gst) : 0,
      invoiceValue: round(taxable + gst),
    };
  },
}));

/* ---- Privileges ---- */
const privileges = Router();
privileges.get('/modules', requireModule('privileges'), getPrivilegeModules);
privileges.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const modules = Array.isArray(req.body.modules) ? req.body.modules : [];
    req.body.modules = modules.filter((m) => MODULE_KEYS.includes(m.key)).map((m) => ({ key: m.key, permission: m.permission === 'manage' ? 'manage' : 'view' }));
    if (req.body.modules.length === 0) throw badRequest('Choose at least one module.');
  }
  next();
});
router.use('/privileges', privileges, crudRouter(Privilege, {
  populate: { path: 'employee', select: 'name employeeId role department', populate: [{ path: 'role', select: 'name' }, { path: 'department', select: 'name' }] },
  writable: ['employee', 'modules'],
  guard: moduleGuard('privileges'),
}));

/* ---- Settings, policies, notifications ---- */
router.get('/settings', getSettingsData);
router.put('/settings', requireModule('settings', 'manage'), updateSettingsData);

router.use('/protocols', crudRouter(Protocol, {
  searchFields: ['title'],
  filterFields: ['group'],
  sort: { group: 1, order: 1 },
  writable: ['group', 'key', 'title', 'body', 'order'],
  guard: [[], [requireModule('settings', 'manage')]],
}));

router.get('/notifications', getNotifications);
router.post('/notifications/read-all', readAllNotifications);
router.put('/notifications/:id/read', readNotification);

router.get('/lookups', getLookups);

export default router;
