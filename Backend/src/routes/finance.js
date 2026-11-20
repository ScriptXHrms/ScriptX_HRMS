import { Router } from 'express';
import mongoose from 'mongoose';
import { BankStatement, ClientPayment, Expense, FinanceAccount, Income, RecurringPayment, Subscription } from '../models/index.js';
import { moduleGuard, requireModule } from '../middleware/auth.js';
import { crudRouter, requireFields } from '../utils/crud.js';
import { dayKey } from '../utils/dates.js';
import { badRequest, escapeRegex, notFound } from '../utils/http.js';
import { encrypt } from '../utils/secrets.js';
import {
  accountPopulate,
  importBankStatements,
  bulkDeleteStatements,
  bulkLedgerStatements,
  getRecurringDashboard,
  payRecurring,
  deleteRecurringLog,
  getSubscriptionPassword,
  getFinancialOverview,
} from '../controllers/finance.controller.js';

const router = Router();
const guard = moduleGuard('finance');
const view = requireModule('finance');
const manage = requireModule('finance', 'manage');

/** Month and year totals for an income or expense query. */
function ledgerSummary(Model) {
  return async (filter) => {
    const today = dayKey();
    const total = async (match) => (await Model.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }]))[0]?.total ?? 0;
    const accountMatch = filter.account ? { account: new mongoose.Types.ObjectId(String(filter.account)) } : {};
    const [month, year, grandTotal] = await Promise.all([
      total({ ...accountMatch, date: { $regex: `^${today.slice(0, 7)}` } }),
      total({ ...accountMatch, date: { $regex: `^${today.slice(0, 4)}` } }),
      total({ ...accountMatch }),
    ]);
    return { month, year, total: grandTotal };
  };
}

const syncLedgerToBankStatement = async (doc, isIncome) => {
  try {
    if (!doc || !doc.account) return;
    const type = isIncome ? 'Credit' : 'Debit';
    const accountType = isIncome ? 'Income' : 'Expense';
    const narration = doc.narration || doc.description || doc.source || (isIncome ? 'Income' : 'Expense');
    const ledger = doc.source || (isIncome ? 'Income' : 'Expense');
    const notes = doc.notes || doc.description || '';
    const date = doc.date || (doc.month ? `${doc.month}-01` : dayKey());

    await BankStatement.findOneAndUpdate(
      { sourceRef: doc._id },
      {
        date,
        account: doc.account,
        amount: Number(doc.amount) || 0,
        type,
        accountType,
        narration,
        ledger,
        notes,
        sourceRef: doc._id,
        sourceModel: isIncome ? 'Income' : 'Expense',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.error(`Error syncing ${isIncome ? 'Income' : 'Expense'} to BankStatement:`, err);
  }
};

const removeLedgerFromBankStatement = async (doc) => {
  try {
    if (doc?._id) await BankStatement.deleteMany({ sourceRef: doc._id });
  } catch (err) {
    console.error('Error removing synced BankStatement:', err);
  }
};

export const syncUnsyncedLedgers = async () => {
  try {
    const [incomes, expenses] = await Promise.all([
      Income.find().lean(),
      Expense.find().lean(),
    ]);
    const existingRefIds = new Set(
      (await BankStatement.find({ sourceRef: { $ne: null } }, { sourceRef: 1 }).lean())
        .map((b) => String(b.sourceRef))
    );

    const unsyncedIncomes = incomes.filter((inc) => inc.account && !existingRefIds.has(String(inc._id)));
    for (const inc of unsyncedIncomes) {
      await BankStatement.create({
        date: inc.date || (inc.month ? `${inc.month}-01` : dayKey()),
        account: inc.account,
        amount: Number(inc.amount) || 0,
        type: 'Credit',
        accountType: 'Income',
        narration: inc.narration || inc.description || inc.source || 'Income',
        ledger: inc.source || 'Income',
        notes: inc.notes || inc.description || '',
        sourceRef: inc._id,
        sourceModel: 'Income',
      });
    }

    const unsyncedExpenses = expenses.filter((exp) => exp.account && !existingRefIds.has(String(exp._id)));
    for (const exp of unsyncedExpenses) {
      await BankStatement.create({
        date: exp.date || (exp.month ? `${exp.month}-01` : dayKey()),
        account: exp.account,
        amount: Number(exp.amount) || 0,
        type: 'Debit',
        accountType: 'Expense',
        narration: exp.narration || exp.description || exp.source || 'Expense',
        ledger: exp.source || 'Expense',
        notes: exp.notes || exp.description || '',
        sourceRef: exp._id,
        sourceModel: 'Expense',
      });
    }
  } catch (err) {
    console.error('Error syncing unsynced ledgers to BankStatement:', err);
  }
};

const ledgerOptions = (Model) => {
  const isIncome = Model === Income;
  return {
    searchFields: ['source', 'notes', 'narration', 'description', 'paymentMode'],
    filterFields: ['account', 'paymentMode', 'month'],
    dateField: 'date',
    populate: accountPopulate,
    sort: { date: -1, createdAt: -1 },
    writable: ['date', 'month', 'account', 'amount', 'source', 'paymentMode', 'narration', 'description', 'notes'],
    guard,
    sanitize: (data) => {
      const date = data.date || (data.month ? `${data.month}-01` : dayKey());
      const month = data.month || date.slice(0, 7);
      return {
        ...data,
        date,
        month,
        amount: Number(data.amount) || 0,
      };
    },
    afterCreate: async (doc) => {
      await syncLedgerToBankStatement(doc, isIncome);
    },
    afterUpdate: async (doc) => {
      await syncLedgerToBankStatement(doc, isIncome);
    },
    afterDelete: async (doc) => {
      await removeLedgerFromBankStatement(doc);
    },
    summarize: ledgerSummary(Model),
  };
};

// Overview for the financial dashboard
router.get('/overview', view, getFinancialOverview);

router.use('/accounts', crudRouter(FinanceAccount, {
  searchFields: ['name', 'accountType'],
  filterFields: ['status', 'accountType'],
  sort: { name: 1 },
  writable: ['name', 'accountType', 'status'],
  guard,
  beforeDelete: async (doc) => {
    const used = await Promise.all([Income.exists({ account: doc._id }), Expense.exists({ account: doc._id }), BankStatement.exists({ account: doc._id })]);
    if (used.some(Boolean)) throw badRequest('This account has transactions, so it can’t be deleted. Mark it Inactive instead.');
  },
}));

import { getScheduledClientPayments } from '../utils/clientPaymentSchedule.js';

const incomeRouter = Router();

incomeRouter.get('/', view, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.account) filter.account = req.query.account;
    if (req.query.month) filter.month = req.query.month;
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = String(req.query.from);
      if (req.query.to) filter.date.$lte = String(req.query.to);
    }
    if (req.query.q) {
      const pattern = new RegExp(escapeRegex(req.query.q), 'i');
      filter.$or = ['source', 'notes', 'narration', 'description', 'paymentMode'].map((f) => ({ [f]: pattern }));
    }

    const realItems = await Income.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate(accountPopulate)
      .lean();

    const summary = await ledgerSummary(Income)(filter);

    let scheduledItems = [];
    if (!req.query.account) {
      scheduledItems = await getScheduledClientPayments(req.query);
    }

    const allItems = [...scheduledItems, ...realItems].sort((a, b) => {
      const dateDiff = (b.date || '').localeCompare(a.date || '');
      if (dateDiff !== 0) return dateDiff;
      return (b.createdAt || '').toString().localeCompare((a.createdAt || '').toString());
    });

    res.json({
      items: allItems,
      total: allItems.length,
      page: 1,
      limit: allItems.length,
      summary,
    });
  } catch (err) {
    next(err);
  }
});

incomeRouter.post('/', manage, async (req, res, next) => {
  try {
    const data = req.body;
    const date = data.date || (data.month ? `${data.month}-01` : dayKey());
    const month = data.month || date.slice(0, 7);
    const amount = Number(data.amount) || 0;

    const created = await Income.create({
      date,
      month,
      account: data.account,
      amount,
      source: data.source,
      paymentMode: data.paymentMode || '',
      narration: data.narration || '',
      description: data.description || '',
      notes: data.notes || '',
      clientPaymentRef: data.clientPaymentRef || null,
      installmentDate: data.installmentDate || '',
    });

    // 1. Sync to BankStatement
    await syncLedgerToBankStatement(created, true);

    // 2. If client payment installment, update ClientPayment
    if (created.clientPaymentRef) {
      try {
        const cp = await ClientPayment.findById(created.clientPaymentRef);
        if (cp) {
          cp.payments = cp.payments || [];
          cp.payments.push({
            date: created.date,
            amount: created.amount,
            reference_no: created.paymentMode || 'Income Record',
          });
          const budget = Number(cp.budget) || Number(cp.amount) || 0;
          const advance = Number(cp.advance) || 0;
          const totalReceived = advance + cp.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
          cp.status = budget > 0 && totalReceived >= budget ? 'Completed' : totalReceived > 0 ? 'Partial' : 'Pending';
          await cp.save();
        }
      } catch (cpErr) {
        console.error('Error updating ClientPayment on income create:', cpErr);
      }
    }

    const item = await Income.findById(created._id).populate(accountPopulate).lean();
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

incomeRouter.put('/:id', manage, async (req, res, next) => {
  try {
    const doc = await Income.findById(req.params.id);
    if (!doc) throw notFound();
    const data = req.body;
    const date = data.date || (data.month ? `${data.month}-01` : dayKey());
    const month = data.month || date.slice(0, 7);
    doc.set({
      ...data,
      date,
      month,
      amount: Number(data.amount) || 0,
    });
    await doc.save();
    await syncLedgerToBankStatement(doc, true);
    const item = await Income.findById(doc._id).populate(accountPopulate).lean();
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

incomeRouter.delete('/:id', manage, async (req, res, next) => {
  try {
    const doc = await Income.findById(req.params.id);
    if (!doc) throw notFound();

    if (doc.clientPaymentRef) {
      try {
        const cp = await ClientPayment.findById(doc.clientPaymentRef);
        if (cp && cp.payments?.length) {
          const idx = cp.payments.findIndex(
            (p) => p.date === doc.date && Math.abs(Number(p.amount) - Number(doc.amount)) < 0.01
          );
          if (idx >= 0) {
            cp.payments.splice(idx, 1);
            const budget = Number(cp.budget) || Number(cp.amount) || 0;
            const advance = Number(cp.advance) || 0;
            const totalReceived = advance + cp.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
            cp.status = budget > 0 && totalReceived >= budget ? 'Completed' : totalReceived > 0 ? 'Partial' : 'Pending';
            await cp.save();
          }
        }
      } catch (cpErr) {
        console.error('Error updating ClientPayment on income delete:', cpErr);
      }
    }

    await removeLedgerFromBankStatement(doc);
    await doc.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.use('/income', incomeRouter);
router.use('/expenses', crudRouter(Expense, ledgerOptions(Expense)));

function formatDayOrdinal(day) {
  if (!day) return '';
  const num = parseInt(day, 10);
  if (isNaN(num)) return day;
  const padded = String(num).padStart(2, '0');
  const mod10 = num % 10;
  const mod100 = num % 100;
  let suffix = 'th';
  if (mod10 === 1 && mod100 !== 11) suffix = 'st';
  else if (mod10 === 2 && mod100 !== 12) suffix = 'nd';
  else if (mod10 === 3 && mod100 !== 13) suffix = 'rd';
  return `${padded}${suffix}`;
}

function shortMonth(m) {
  if (!m) return '';
  return m.slice(0, 3);
}

function buildScheduleSummary(data) {
  const pt = data.paymentType || 'One Time';
  if (pt === 'One Time') {
    const m = shortMonth(data.oneTimeMonth);
    const d = formatDayOrdinal(data.oneTimeDay);
    return [m, d].filter(Boolean).join(' ') || 'One Time';
  }
  if (pt === 'Monthly') {
    return data.monthlyDay ? `E'ry Mo ${formatDayOrdinal(data.monthlyDay)}` : "E'ry Mo";
  }
  if (pt === 'Quarterly' || pt === 'Quartly') {
    return "E'ry Qtr";
  }
  if (pt === 'Half Yearly') {
    return "E'ry Half Yr";
  }
  if (pt === 'Yearly') {
    return "E'ry Yr";
  }
  return pt;
}

router.use('/payments', crudRouter(ClientPayment, {
  filterFields: ['client', 'project', 'status', 'paymentType'],
  populate: [{ path: 'client', select: 'client_name company_name' }, { path: 'project', select: 'name' }],
  writable: [
    'client',
    'project',
    'budget',
    'amount',
    'advance',
    'paymentType',
    'gst',
    'payments',
    'status',
    'notes',
    'oneTimeMonth',
    'oneTimeDay',
    'monthlyMonth',
    'monthlyDay',
    'quarterlyMonth1',
    'quarterlyDay1',
    'quarterlyMonth2',
    'quarterlyDay2',
    'quarterlyMonth3',
    'quarterlyDay3',
    'halfYearlyMonth1',
    'halfYearlyDay1',
    'halfYearlyMonth2',
    'halfYearlyDay2',
    'yearlyYear',
    'yearlyMonth',
    'yearlyDay',
    'scheduleSummary',
  ],
  guard,
  sanitize: (data, req, doc) => {
    const budget = data.budget !== undefined && data.budget !== '' ? Number(data.budget) : (Number(data.amount) || 0);
    const amount = data.amount !== undefined && data.amount !== '' ? Number(data.amount) : (Number(data.budget) || 0);
    const advance = data.advance !== undefined && data.advance !== '' ? Number(data.advance) : (doc?.advance ?? 0);
    const payments = data.payments !== undefined
      ? (data.payments ?? []).filter((p) => p.date && Number(p.amount) > 0)
      : (doc?.payments ?? []);
    const received = advance + payments.reduce((total, p) => total + Number(p.amount), 0);
    const target = budget || amount;
    const status = target > 0 && received >= target ? 'Completed' : received > 0 ? 'Partial' : 'Pending';

    const scheduleSummary = buildScheduleSummary(data);

    return {
      ...data,
      budget,
      amount,
      advance,
      payments,
      status,
      scheduleSummary,
    };
  },
}));

/* ---- Bank statement ---- */
const statements = Router();
statements.use('/', async (req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
    await syncUnsyncedLedgers();
  }
  next();
});
statements.post('/import', manage, importBankStatements);
statements.post('/bulk-delete', manage, bulkDeleteStatements);
statements.post('/bulk-ledger', manage, bulkLedgerStatements);

router.use('/statements', statements);
router.use('/statements', crudRouter(BankStatement, {
  searchFields: ['narration', 'reference_no', 'ledger', 'accountType', 'notes', 'lenderName', 'loanName'],
  filterFields: ['account', 'type', 'ledger', 'accountType'],
  dateField: 'date',
  populate: accountPopulate,
  sort: { date: -1, createdAt: -1 },
  writable: ['date', 'narration', 'reference_no', 'ledger', 'accountType', 'amount', 'type', 'account', 'lenderName', 'loanName', 'notes'],
  guard,
  summarize: async (filter) => {
    const totals = await BankStatement.aggregate([
      { $match: { ...filter, ...(filter.account ? { account: new mongoose.Types.ObjectId(String(filter.account)) } : {}) } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);
    const of = (type) => totals.find((t) => t._id === type)?.total ?? 0;
    return { credit: of('Credit'), debit: of('Debit') };
  },
}));

/* ---- Recurring payments ---- */
const recurring = Router();
recurring.get('/dashboard', view, getRecurringDashboard);
recurring.get('/overview', view, getFinancialOverview);
recurring.post('/:id/pay', manage, payRecurring);
recurring.delete('/:id/logs/:logId', manage, deleteRecurringLog);

router.use('/recurring', recurring);
router.use('/recurring', crudRouter(RecurringPayment, {
  searchFields: ['name', 'lenderName'],
  filterFields: ['paymentType', 'status', 'account'],
  populate: accountPopulate,
  sort: { name: 1 },
  writable: ['account', 'name', 'lenderName', 'paymentType', 'recurringType', 'paymentMode', 'amount', 'totalAmount', 'interestRate', 'monthlyInterest', 'emiAmount', 'totalEmi', 'dueDay', 'startDate', 'endDate', 'status', 'notes'],
  guard,
}));

/* ---- Subscriptions ---- */
const subscriptions = Router();
subscriptions.get('/:id/password', manage, getSubscriptionPassword);

router.use('/subscriptions', subscriptions);
router.use('/subscriptions', crudRouter(Subscription, {
  searchFields: ['name', 'url', 'email', 'username'],
  filterFields: ['status', 'recurringType'],
  dateField: 'expiryDate',
  sort: { expiryDate: 1 },
  writable: ['name', 'gstNumber', 'url', 'recurringType', 'dueDate', 'amount', 'expiryDate', 'username', 'email', 'password', 'status'],
  guard,
  sanitize: (data) => {
    requireFields(data, [['name', 'Name']]);
    const { password, ...rest } = data;
    return password ? { ...rest, passwordEnc: encrypt(password) } : rest;
  },
}));

export default router;
