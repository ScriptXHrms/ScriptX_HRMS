import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CircleDollarSign,
  HandCoins,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import ActionMenu from '../../components/ActionMenu';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormModal from '../../components/FormModal';
import StatusBadge from '../../components/StatusBadge';
import { api, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { formatMoney, idOf, toOptions } from '../../utils/format';

const BRAND_PURPLE = '#40108c';

const received = (row) =>
  (Number(row.advance) || 0) +
  (row.payments ?? []).reduce((total, p) => total + (Number(p.amount) || 0), 0);

const rowBudget = (row) => Number(row.budget ?? row.amount) || 0;
const totalAmount = (row) => Number(row.amount ?? row.budget) || 0;

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

function formatScheduleSummary(row) {
  if (!row) return '—';
  const pt = row.paymentType || 'One Time';
  if (pt === 'Monthly') {
    const d = row.monthlyDay || row.scheduleSummary?.match(/day\s*(\d+)/i)?.[1];
    return d ? `E'ry Mo ${formatDayOrdinal(d)}` : "E'ry Mo";
  }
  if (pt === 'One Time') {
    let m = row.oneTimeMonth;
    let d = row.oneTimeDay;
    if (!m && !d && row.scheduleSummary) {
      const match = row.scheduleSummary.match(/([a-zA-Z]+)\s*(?:Day\s*)?(\d+)?/i);
      if (match) {
        m = match[1];
        d = match[2];
      }
    }
    const mStr = shortMonth(m);
    const dStr = formatDayOrdinal(d);
    return [mStr, dStr].filter(Boolean).join(' ') || 'One Time';
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
  return row.scheduleSummary || '—';
}

const PAYMENT_TYPES = ['One Time', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(currentYear + i));

export default function AdminPayments() {
  const { can } = useAuth();
  const canManage = can('finance', 'manage');
  const toast = useToast();

  const { clients = [], projects = [] } = useLookups(['clients', 'projects']);

  // Filters state
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentType, setFilterPaymentType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    client: '',
    status: '',
    paymentType: '',
    from: '',
    to: '',
    month: '',
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [modal, setModal] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Fetch all payments
  const { data, loading, error, reload } = useApi(withQuery('/finance/payments', { limit: 5000 }));
  const allItems = data?.items ?? [];

  // Filter items in-memory
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Client filter
      if (appliedFilters.client) {
        const clientId = idOf(item.client);
        if (clientId !== appliedFilters.client) return false;
      }
      // Status filter
      if (appliedFilters.status && item.status !== appliedFilters.status) {
        return false;
      }
      // Payment type filter
      if (appliedFilters.paymentType && item.paymentType !== appliedFilters.paymentType) {
        return false;
      }
      // Date range filter (From to To) on createdAt
      const createdDate = item.createdAt ? item.createdAt.slice(0, 10) : '';
      if (appliedFilters.from && createdDate && createdDate < appliedFilters.from) {
        return false;
      }
      if (appliedFilters.to && createdDate && createdDate > appliedFilters.to) {
        return false;
      }
      // Month filter (YYYY-MM)
      if (appliedFilters.month) {
        const matchCreated = createdDate ? createdDate.startsWith(appliedFilters.month) : false;
        const monthNum = parseInt(appliedFilters.month.slice(5, 7), 10);
        const monthName = MONTHS[monthNum - 1];
        const matchSchedule =
          monthName &&
          (item.oneTimeMonth === monthName ||
            item.monthlyMonth === monthName ||
            item.quarterlyMonth1 === monthName ||
            item.quarterlyMonth2 === monthName ||
            item.quarterlyMonth3 === monthName ||
            item.halfYearlyMonth1 === monthName ||
            item.halfYearlyMonth2 === monthName ||
            item.yearlyMonth === monthName ||
            item.scheduleSummary?.toLowerCase().includes(monthName.toLowerCase()));

        if (!matchCreated && !matchSchedule) return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const clientName = (item.client?.company_name || item.client?.client_name || '').toLowerCase();
        const projectName = (item.project?.name || '').toLowerCase();
        const schedule = (item.scheduleSummary || '').toLowerCase();
        const notes = (item.notes || '').toLowerCase();
        const status = (item.status || '').toLowerCase();
        const pType = (item.paymentType || '').toLowerCase();
        const budgetStr = String(item.budget || '');
        const amountStr = String(item.amount || '');
        const match =
          clientName.includes(q) ||
          projectName.includes(q) ||
          schedule.includes(q) ||
          notes.includes(q) ||
          status.includes(q) ||
          pType.includes(q) ||
          budgetStr.includes(q) ||
          amountStr.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allItems, appliedFilters, search]);

  const hasActiveFilters = Boolean(
    appliedFilters.client ||
      appliedFilters.status ||
      appliedFilters.paymentType ||
      appliedFilters.from ||
      appliedFilters.to ||
      appliedFilters.month,
  );

  // Dynamic summary figures:
  // When filters are applied, show totals of filteredItems. When not filtered (or reset), show totals of allItems!
  const activeList = hasActiveFilters ? filteredItems : allItems;

  const totalAmountVal = useMemo(() => {
    return activeList.reduce((sum, row) => sum + rowBudget(row), 0);
  }, [activeList]);

  const totalReceivedVal = useMemo(() => {
    return activeList.reduce((sum, row) => sum + received(row), 0);
  }, [activeList]);

  const totalBalanceVal = useMemo(() => {
    return Math.max(0, totalAmountVal - totalReceivedVal);
  }, [totalAmountVal, totalReceivedVal]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [appliedFilters, search, pageSize]);

  // Filter actions
  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedFilters({
      client: filterClient,
      status: filterStatus,
      paymentType: filterPaymentType,
      from: filterFrom,
      to: filterTo,
      month: filterMonth,
    });
  };

  const handleFilterReset = () => {
    setFilterClient('');
    setFilterStatus('');
    setFilterPaymentType('');
    setFilterFrom('');
    setFilterTo('');
    setFilterMonth('');
    setAppliedFilters({
      client: '',
      status: '',
      paymentType: '',
      from: '',
      to: '',
      month: '',
    });
  };

  const removeSingleFilter = (key) => {
    if (key === 'dateRange') {
      setFilterFrom('');
      setFilterTo('');
      setAppliedFilters((prev) => ({ ...prev, from: '', to: '' }));
    } else {
      if (key === 'client') setFilterClient('');
      if (key === 'status') setFilterStatus('');
      if (key === 'paymentType') setFilterPaymentType('');
      if (key === 'month') setFilterMonth('');
      setAppliedFilters((prev) => ({ ...prev, [key]: '' }));
    }
  };

  // Form Fields Definition
  const fields = useMemo(
    () => [
      { name: 'client', label: 'Client', type: 'select', required: true, options: toOptions(clients, 'company_name') },
      {
        name: 'project',
        label: 'Project',
        type: 'select',
        options: (values) => toOptions(projects.filter((p) => String(idOf(p.client)) === String(values.client || ''))),
        placeholder: 'Select a project',
      },
      { name: 'budget', label: 'Budget', type: 'number', required: true, min: 0 },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0 },
      { name: 'advance', label: 'Advance (optional)', type: 'number', min: 0 },
      { name: 'paymentType', label: 'Payment type', type: 'select', required: true, options: PAYMENT_TYPES },

      // --- One Time Schedule ---
      {
        name: 'oneTimeMonth',
        label: 'Month',
        type: 'month-picker',
        show: (v) => !v.paymentType || v.paymentType === 'One Time',
      },
      {
        name: 'oneTimeDay',
        label: 'Day',
        type: 'day-picker',
        show: (v) => !v.paymentType || v.paymentType === 'One Time',
      },

      // --- Monthly Schedule ---
      {
        name: 'monthlyMonth',
        label: 'Month',
        type: 'month-picker',
        allowEveryMonth: true,
        show: (v) => v.paymentType === 'Monthly',
      },
      {
        name: 'monthlyDay',
        label: 'Day',
        type: 'day-picker',
        show: (v) => v.paymentType === 'Monthly',
      },

      // --- Quarterly Schedule (3 Months with day for each) ---
      {
        name: 'quarterlyMonth1',
        label: '1st Month',
        type: 'month-picker',
        show: (v) => v.paymentType === 'Quarterly',
      },
      {
        name: 'quarterlyDay1',
        label: 'Day (1st Month)',
        type: 'day-picker',
        show: (v) => v.paymentType === 'Quarterly',
      },
      {
        name: 'quarterlyMonth2',
        label: '2nd Month',
        type: 'month-picker',
        show: (v) => v.paymentType === 'Quarterly',
      },
      {
        name: 'quarterlyDay2',
        label: 'Day (2nd Month)',
        type: 'day-picker',
        show: (v) => v.paymentType === 'Quarterly',
      },
      {
        name: 'quarterlyMonth3',
        label: '3rd Month',
        type: 'month-picker',
        show: (v) => v.paymentType === 'Quarterly',
      },
      {
        name: 'quarterlyDay3',
        label: 'Day (3rd Month)',
        type: 'day-picker',
        show: (v) => v.paymentType === 'Quarterly',
      },

      // --- Half Yearly Schedule (2 Months with day for each) ---
      {
        name: 'halfYearlyMonth1',
        label: '1st Month',
        type: 'month-picker',
        show: (v) => v.paymentType === 'Half Yearly',
      },
      {
        name: 'halfYearlyDay1',
        label: 'Day (1st Month)',
        type: 'day-picker',
        show: (v) => v.paymentType === 'Half Yearly',
      },
      {
        name: 'halfYearlyMonth2',
        label: '2nd Month',
        type: 'month-picker',
        show: (v) => v.paymentType === 'Half Yearly',
      },
      {
        name: 'halfYearlyDay2',
        label: 'Day (2nd Month)',
        type: 'day-picker',
        show: (v) => v.paymentType === 'Half Yearly',
      },

      // --- Yearly Schedule (Year, Month, and Day) ---
      {
        name: 'yearlyYear',
        label: 'Year',
        type: 'select',
        options: YEARS,
        show: (v) => v.paymentType === 'Yearly',
      },
      {
        name: 'yearlyMonth',
        label: 'Month',
        type: 'month-picker',
        show: (v) => v.paymentType === 'Yearly',
      },
      {
        name: 'yearlyDay',
        label: 'Day',
        type: 'day-picker',
        show: (v) => v.paymentType === 'Yearly',
      },

      { name: 'gst', label: 'GST', type: 'checkbox', checkboxLabel: 'GST applicable', span: 2 },
      { name: 'notes', label: 'Notes', type: 'textarea', span: 2 },
    ],
    [clients, projects],
  );

  const defaults = {
    paymentType: 'One Time',
    budget: '',
    amount: '',
    advance: '',
    oneTimeMonth: MONTHS[new Date().getMonth()],
    oneTimeDay: String(new Date().getDate()),
    monthlyMonth: 'Every Month',
    monthlyDay: '1',
    quarterlyMonth1: 'January',
    quarterlyDay1: '1',
    quarterlyMonth2: 'April',
    quarterlyDay2: '1',
    quarterlyMonth3: 'July',
    quarterlyDay3: '1',
    halfYearlyMonth1: 'January',
    halfYearlyDay1: '1',
    halfYearlyMonth2: 'July',
    halfYearlyDay2: '1',
    yearlyYear: String(new Date().getFullYear()),
    yearlyMonth: 'January',
    yearlyDay: '1',
  };

  const fromItem = (item) => ({
    ...defaults,
    ...item,
    client: idOf(item.client),
    project: idOf(item.project),
    budget: item.budget !== undefined && item.budget !== null ? item.budget : (item.amount ?? ''),
    amount: item.amount !== undefined && item.amount !== null ? item.amount : (item.budget ?? ''),
    advance: item.advance ?? '',
  });

  const save = async (values) => {
    const budget = values.budget !== '' && values.budget !== undefined ? Number(values.budget) : (Number(values.amount) || 0);
    const amount = values.amount !== '' && values.amount !== undefined ? Number(values.amount) : (Number(values.budget) || 0);
    const advance = values.advance !== '' && values.advance !== undefined ? Number(values.advance) : 0;
    const payload = {
      ...values,
      budget,
      amount,
      advance,
      scheduleSummary: formatScheduleSummary(values),
    };
    if (modal.item) {
      await api.put(`/finance/payments/${modal.item._id}`, payload);
      toast.success('Payment updated successfully');
    } else {
      await api.post('/finance/payments', payload);
      toast.success('Payment added successfully');
    }
    setModal({ open: false, item: null });
    reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.del(`/finance/payments/${deleting._id}`);
      toast.success('Payment deleted successfully');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error('Couldn’t delete', err.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-muted hover:border-brand-300 hover:text-ink transition"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">Client Payments</h1>
            <p className="text-xs text-muted">Budgets and payments received against each client project.</p>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setModal({ open: true, item: null })}
            style={{ backgroundColor: BRAND_PURPLE }}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:translate-y-px transition"
          >
            <Plus size={18} />
            Add Payment
          </button>
        )}
      </div>

      {/* Filter Row (Same as Bank Statement) */}
      <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
          {/* Select Client */}
          <div className="w-full sm:w-48">
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="input select w-full py-2 text-sm"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.company_name || c.client_name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Status */}
          <div className="w-full sm:w-36">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input select w-full py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Select Payment Type */}
          <div className="w-full sm:w-40">
            <select
              value={filterPaymentType}
              onChange={(e) => setFilterPaymentType(e.target.value)}
              className="input select w-full py-2 text-sm"
            >
              <option value="">All Types</option>
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From to To */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="input w-36 sm:w-38 py-2 text-sm"
              placeholder="dd-mm-yyyy"
            />
            <span className="text-xs font-semibold text-muted">to</span>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="input w-36 sm:w-38 py-2 text-sm"
              placeholder="dd-mm-yyyy"
            />
          </div>

          {/* Month Filter */}
          <div className="w-full sm:w-40">
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="input w-full py-2 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="submit"
              style={{ backgroundColor: BRAND_PURPLE }}
              className="min-h-[40px] rounded-xl px-6 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:translate-y-px transition"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={handleFilterReset}
              className="min-h-[40px] rounded-xl border border-line bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Filters Applied Banner */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-muted uppercase">Filters Applied</span>
              {appliedFilters.client && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">
                  Client: {clients.find((c) => c._id === appliedFilters.client)?.company_name ?? 'Selected'}
                  <button type="button" onClick={() => removeSingleFilter('client')} className="hover:text-red-700">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.status && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">
                  Status: {appliedFilters.status}
                  <button type="button" onClick={() => removeSingleFilter('status')} className="hover:text-red-700">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.paymentType && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">
                  Type: {appliedFilters.paymentType}
                  <button type="button" onClick={() => removeSingleFilter('paymentType')} className="hover:text-red-700">
                    <X size={12} />
                  </button>
                </span>
              )}
              {(appliedFilters.from || appliedFilters.to) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">
                  Date Range: {appliedFilters.from || '…'} to {appliedFilters.to || '…'}
                  <button type="button" onClick={() => removeSingleFilter('dateRange')} className="hover:text-red-700">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.month && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">
                  Month: {appliedFilters.month}
                  <button type="button" onClick={() => removeSingleFilter('month')} className="hover:text-red-700">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleFilterReset}
              className="text-xs font-semibold text-muted hover:text-red-600 transition"
            >
              × Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards (Dynamic: Shows Filtered Values or Total when unfiltered) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Amount */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition hover:shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-muted">Total Amount</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-[#40108c]">
              <Wallet size={18} />
            </div>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {formatMoney(totalAmountVal)}
          </p>
        </div>

        {/* Received */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition hover:shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-muted">Received</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <HandCoins size={18} />
            </div>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-600 sm:text-3xl">
            {formatMoney(totalReceivedVal)}
          </p>
        </div>

        {/* Balance */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition hover:shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-muted">Balance</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <CircleDollarSign size={18} />
            </div>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-orange-600 sm:text-3xl">
            {formatMoney(totalBalanceVal)}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-line bg-white shadow-card overflow-hidden">
        {/* Search Bar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-line">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client payments…"
              className="input w-full pl-10 py-2 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-line text-xs font-semibold uppercase text-muted">
              <tr>
                <th className="px-4 py-3.5">S.No</th>
                <th className="px-4 py-3.5">Client Name</th>
                <th className="px-4 py-3.5">Project Name</th>
                <th className="px-4 py-3.5 text-right">Budget</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5 text-right">Advance</th>
                <th className="px-4 py-3.5 text-right">Balance</th>
                <th className="px-4 py-3.5">Payment Type</th>
                <th className="px-4 py-3.5">Schedule</th>
                <th className="px-4 py-3.5">GST</th>
                <th className="px-4 py-3.5">Status</th>
                {canManage && <th className="px-4 py-3.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-muted">
                    Loading payments…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-red-600">
                    Error loading payments. <button type="button" onClick={reload} className="underline font-semibold ml-1">Retry</button>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-muted">
                    No client payments found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((row, index) => {
                  const sno = (page - 1) * pageSize + index + 1;
                  const target = rowBudget(row);
                  const rowRec = received(row);
                  const rowBal = Math.max(0, target - rowRec);
                  const rowStatus =
                    target > 0 && rowRec >= target ? 'Completed' : rowRec > 0 ? 'Partial' : 'Pending';

                  const actionItems = [
                    { label: 'Edit', icon: Pencil, onClick: () => setModal({ open: true, item: row }) },
                    { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => setDeleting(row) },
                  ];

                  return (
                    <tr key={row._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5 text-muted tabular-nums font-medium">{sno}</td>
                      <td className="px-4 py-3.5 font-semibold text-ink">
                        {row.client?.company_name ?? row.client?.client_name ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {row.project?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        {formatMoney(row.budget ?? row.amount ?? 0)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-ink tabular-nums">
                        {formatMoney(Number(row.amount) || 0)}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        {row.advance ? formatMoney(row.advance) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-semibold">
                        {formatMoney(rowBal)}
                      </td>
                      <td className="px-4 py-3.5">{row.paymentType}</td>
                      <td className="px-4 py-3.5 text-xs text-muted font-medium">
                        {formatScheduleSummary(row)}
                      </td>
                      <td className="px-4 py-3.5">{row.gst ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          value={rowStatus}
                          tone={rowStatus === 'Completed' ? 'green' : rowStatus === 'Partial' ? 'gold' : 'neutral'}
                        />
                      </td>
                      {canManage && (
                        <td className="px-4 py-3.5 text-right">
                          <ActionMenu items={actionItems} label="Actions for this payment" />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-line text-sm">
          <p className="text-muted text-xs sm:text-sm">
            Showing{' '}
            <span className="font-semibold text-ink">
              {filteredItems.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-ink">
              {Math.min(page * pageSize, filteredItems.length)}
            </span>{' '}
            of <span className="font-semibold text-ink">{filteredItems.length}</span> payments
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted">Choose</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="input select py-1 px-2 text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2.5 rounded-lg border border-line text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  style={page === p ? { backgroundColor: BRAND_PURPLE } : {}}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                    page === p
                      ? 'text-white'
                      : 'border border-line hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2.5 rounded-lg border border-line text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {fields && (
        <FormModal
          open={modal.open}
          onClose={() => setModal({ open: false, item: null })}
          title={modal.item ? 'Edit payment' : 'Add payment'}
          fields={fields}
          initialValues={modal.item ? fromItem(modal.item) : defaults}
          onSubmit={save}
          submitLabel={modal.item ? 'Save changes' : 'Add payment'}
          size="lg"
          onValuesChange={(next, changed) => {
            if (changed === 'client') return { ...next, project: '' };
            if (changed === 'budget' && (!next.amount || next.amount === '')) return { ...next, amount: next.budget };
            return next;
          }}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this payment?"
        message="This will permanently delete this client payment record. This can’t be undone."
        confirmLabel="Delete"
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
