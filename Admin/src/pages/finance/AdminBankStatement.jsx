import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { api, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { parseCsv, parseStatementRows } from '../../utils/csv';
import { formatDate } from '../../utils/dateUtils';
import { formatMoney, idOf } from '../../utils/format';

const BRAND_PURPLE = '#40108c';

const ACCOUNT_TYPES = [
  { label: 'Income', value: 'Income' },
  { label: 'Expense', value: 'Expense' },
  { label: 'Cash From Other Account', value: 'Cash From Other Account' },
  { label: 'Return Investment', value: 'Return Investment' },
];

export default function AdminBankStatement() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('finance', 'manage');
  const fileRef = useRef(null);

  // Filter state
  const [filterType, setFilterType] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // Committed query state (applied on "Submit")
  const [appliedFilters, setAppliedFilters] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection
  const [selected, setSelected] = useState(new Set());

  // Popup Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '',
    narration: '',
    ledger: '',
    amount: '',
    type: 'Debit',
    accountType: '',
    lenderName: '',
    loanName: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Notes viewer modal
  const [activeNote, setActiveNote] = useState(null);

  // CSV Import modal
  const [importing, setImporting] = useState(null);
  const [importAccount, setImportAccount] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  // Delete confirm modal
  const [deletingIds, setDeletingIds] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Lookups & API data
  const { accounts = [] } = useLookups('accounts');

  // Build query string
  const queryParams = useMemo(() => {
    const q = { limit: 5000 };
    if (appliedFilters.type) q.type = appliedFilters.type;
    if (appliedFilters.account) q.account = appliedFilters.account;
    if (appliedFilters.from) q.from = appliedFilters.from;
    if (appliedFilters.to) q.to = appliedFilters.to;
    if (appliedFilters.month) q.month = appliedFilters.month;
    if (search.trim()) q.q = search.trim();
    return q;
  }, [appliedFilters, search]);

  const { data, loading, error, reload } = useApi(withQuery('/finance/statements', queryParams));

  // Items and Summary
  const allItems = data?.items ?? [];
  const summary = data?.summary ?? { credit: 0, debit: 0 };

  // Calculate dynamic totals from filtered rows or summary
  const totalCredit = useMemo(() => {
    if (allItems.length > 0) {
      return allItems.reduce((acc, row) => (row.type?.toLowerCase() === 'credit' ? acc + (Number(row.amount) || 0) : acc), 0);
    }
    return summary.credit ?? 0;
  }, [allItems, summary]);

  const totalDebit = useMemo(() => {
    if (allItems.length > 0) {
      return allItems.reduce((acc, row) => (row.type?.toLowerCase() === 'debit' ? acc + (Number(row.amount) || 0) : acc), 0);
    }
    return summary.debit ?? 0;
  }, [allItems, summary]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(allItems.length / pageSize));
  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allItems.slice(start, start + pageSize);
  }, [allItems, page, pageSize]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [appliedFilters, search, pageSize]);

  // Handle Filter submit
  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedFilters({
      type: filterType,
      account: filterAccount,
      from: filterFrom,
      to: filterTo,
      month: filterMonth,
    });
  };

  const handleFilterReset = () => {
    setFilterType('');
    setFilterAccount('');
    setFilterFrom('');
    setFilterTo('');
    setFilterMonth('');
    setAppliedFilters({});
    setSearch('');
  };

  const removeSingleFilter = (key) => {
    if (key === 'type') setFilterType('');
    if (key === 'account') setFilterAccount('');
    if (key === 'dateRange') {
      setFilterFrom('');
      setFilterTo('');
    }
    if (key === 'month') setFilterMonth('');
    setAppliedFilters((prev) => {
      const next = { ...prev };
      if (key === 'dateRange') {
        delete next.from;
        delete next.to;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  // Open modal for Add
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      account: accounts[0]?._id ?? '',
      narration: '',
      ledger: '',
      amount: '',
      type: 'Debit',
      accountType: '',
      lenderName: '',
      loanName: '',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      date: item.date ? item.date.slice(0, 10) : new Date().toISOString().split('T')[0],
      account: idOf(item.account) || accounts[0]?._id || '',
      narration: item.narration ?? '',
      ledger: item.ledger ?? '',
      amount: item.amount != null ? String(item.amount) : '',
      type: item.type === 'Credit' ? 'Credit' : 'Debit',
      accountType: item.accountType ?? '',
      lenderName: item.lenderName ?? '',
      loanName: item.loanName ?? '',
      notes: item.notes ?? '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.date) errs.date = 'Date is required';
    if (!formData.account) errs.account = 'Account is required';
    if (!formData.narration?.trim()) errs.narration = 'Narration is required';
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errs.amount = 'Amount must be greater than 0';
    }
    if (!formData.type) errs.type = 'Type is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        date: formData.date,
        account: formData.account,
        narration: formData.narration.trim(),
        ledger: formData.ledger.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        accountType: formData.accountType || undefined,
        lenderName: formData.lenderName.trim() || undefined,
        loanName: formData.loanName.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (editingItem) {
        await api.put(`/finance/statements/${editingItem._id}`, payload);
        toast.success('Statement updated successfully');
      } else {
        await api.post('/finance/statements', payload);
        toast.success('Statement added successfully');
      }
      closeModal();
      reload();
    } catch (err) {
      toast.error('Failed to save statement', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Import handling
  const onFileChosen = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const { rows, skipped } = parseStatementRows(parseCsv(text));
      if (rows.length === 0) {
        toast.error('No rows found', 'The CSV needs Date, Narration and Withdrawal/Deposit columns.');
        return;
      }
      setImporting({ rows, skipped, name: file.name });
      setImportAccount(accounts[0]?._id ?? '');
    } catch (err) {
      toast.error('Failed to read CSV', err.message);
    }
  };

  const handleImportSubmit = async () => {
    if (!importAccount) {
      toast.error('Please select an account for import');
      return;
    }
    setImportLoading(true);
    try {
      const result = await api.post('/finance/statements/import', {
        account: importAccount,
        rows: importing.rows,
      });
      toast.success(`${result.imported} entries imported`, result.duplicates ? `${result.duplicates} duplicates were skipped.` : undefined);
      setImporting(null);
      reload();
    } catch (err) {
      toast.error('Import failed', err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // Delete handling
  const handleDeleteConfirm = async () => {
    if (!deletingIds || deletingIds.length === 0) return;
    setDeleteLoading(true);
    try {
      await api.post('/finance/statements/bulk-delete', { ids: deletingIds });
      toast.success(deletingIds.length > 1 ? `${deletingIds.length} entries deleted` : 'Entry deleted');
      setDeletingIds(null);
      setSelected(new Set());
      reload();
    } catch (err) {
      toast.error('Delete failed', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Selection toggle
  const toggleSelectAll = () => {
    if (selected.size === currentItems.length && currentItems.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(currentItems.map((r) => r._id)));
    }
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  // Format date helper for table
  const formatDateDisplay = (val) => {
    if (!val) return '—';
    return formatDate(val);
  };

  // Active filters count for tag display
  const hasActiveFilters = Boolean(
    appliedFilters.type || appliedFilters.account || appliedFilters.from || appliedFilters.to || appliedFilters.month,
  );

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
            <h1 className="text-xl font-bold text-ink sm:text-2xl">Bank Statement</h1>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAddModal}
              style={{ backgroundColor: BRAND_PURPLE }}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:translate-y-px transition"
            >
              <Plus size={18} />
              Add
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ backgroundColor: BRAND_PURPLE }}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:translate-y-px transition"
            >
              <Upload size={16} />
              Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFileChosen}
              aria-label="Choose a CSV file"
            />
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
          {/* Select Type */}
          <div className="w-full sm:w-44">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input select w-full py-2 text-sm"
            >
              <option value="">Select Type</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </div>

          {/* Select Account */}
          <div className="w-full sm:w-52">
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="input select w-full py-2 text-sm"
            >
              <option value="">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name}
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
              className="input w-36 sm:w-40 py-2 text-sm"
              placeholder="dd-mm-yyyy"
            />
            <span className="text-xs font-semibold text-muted">to</span>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="input w-36 sm:w-40 py-2 text-sm"
              placeholder="dd-mm-yyyy"
            />
          </div>

          {/* Month Filter */}
          <div className="w-full sm:w-44">
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
              {appliedFilters.type && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">
                  Type: {appliedFilters.type}
                  <button type="button" onClick={() => removeSingleFilter('type')} className="hover:text-red-700">
                    <X size={12} />
                  </button>
                </span>
              )}
              {appliedFilters.account && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700">
                  Account: {accounts.find((a) => a._id === appliedFilters.account)?.name ?? 'Selected'}
                  <button type="button" onClick={() => removeSingleFilter('account')} className="hover:text-red-700">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Total Credit */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition hover:shadow-card">
          <p className="text-xs font-semibold tracking-wide text-muted">Total Credit</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-600 sm:text-3xl">
            {formatMoney(totalCredit)}
          </p>
        </div>

        {/* Total Debit */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition hover:shadow-card">
          <p className="text-xs font-semibold tracking-wide text-muted">Total Debit</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-rose-600 sm:text-3xl">
            {formatMoney(totalDebit)}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-line bg-white shadow-card overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-line">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all columns..."
              className="input w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>

          {selected.size > 0 && canManage && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted">{selected.size} selected</span>
              <button
                type="button"
                onClick={() => setDeletingIds([...selected])}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition"
              >
                <Trash2 size={14} />
                Delete selected
              </button>
            </div>
          )}
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted">
                {canManage && (
                  <th className="w-10 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={currentItems.length > 0 && selected.size === currentItems.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-line text-[#40108c] focus:ring-[#40108c]"
                      aria-label="Select all rows on current page"
                    />
                  </th>
                )}
                <th className="px-3.5 py-3.5">SNO</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap">DATE</th>
                <th className="px-3.5 py-3.5 min-w-[200px]">NARRATION</th>
                <th className="px-3.5 py-3.5">LEDGER</th>
                <th className="px-3.5 py-3.5">AMOUNT</th>
                <th className="px-3.5 py-3.5">TYPE</th>
                <th className="px-3.5 py-3.5">LENDER NAME</th>
                <th className="px-3.5 py-3.5">LOAN</th>
                <th className="px-3.5 py-3.5 text-center">NOTES</th>
                {canManage && <th className="px-3.5 py-3.5 text-right">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 11 : 10} className="py-12 text-center text-muted">
                    Loading bank statements…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={canManage ? 11 : 10} className="py-12 text-center text-red-600">
                    Failed to load statements: {error.message}
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 11 : 10} className="py-12 text-center text-muted">
                    No bank statement records found.
                  </td>
                </tr>
              ) : (
                currentItems.map((row, index) => {
                  const isDebit = row.type?.toLowerCase() === 'debit';
                  const isChecked = selected.has(row._id);

                  return (
                    <tr
                      key={row._id}
                      className={`transition-colors hover:bg-slate-50/70 ${isChecked ? 'bg-slate-100/70' : ''}`}
                    >
                      {canManage && (
                        <td className="w-10 px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectRow(row._id)}
                            className="h-4 w-4 rounded border-line text-[#40108c] focus:ring-[#40108c]"
                          />
                        </td>
                      )}
                      <td className="px-3.5 py-3.5 text-xs text-muted font-medium">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-sm text-ink font-medium">
                        {formatDateDisplay(row.date)}
                      </td>
                      <td className="px-3.5 py-3.5 text-xs text-ink/90 font-mono break-all max-w-[280px]">
                        {row.narration}
                      </td>
                      <td className="px-3.5 py-3.5 text-xs text-muted font-medium">
                        {row.ledger || '—'}
                      </td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-sm font-bold text-ink">
                        {formatMoney(row.amount)}
                      </td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`inline-block font-semibold text-xs ${
                              isDebit ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {row.type}
                          </span>
                          {row.accountType && (
                            <span className="text-[11px] text-muted">
                              {row.accountType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-3.5 text-xs text-ink/80 font-medium">
                        {row.lenderName || '—'}
                      </td>
                      <td className="px-3.5 py-3.5 text-xs text-muted max-w-[180px] truncate">
                        {row.loanName || '—'}
                      </td>
                      <td className="px-3.5 py-3.5 text-center">
                        {row.notes ? (
                          <button
                            type="button"
                            onClick={() => setActiveNote(row.notes)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink transition"
                            title="View note"
                          >
                            <Eye size={15} />
                          </button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(row)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink transition"
                              title="Edit statement"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingIds([row._id])}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600 transition"
                              title="Delete statement"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-line text-sm text-muted">
          <p>
            Showing {allItems.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, allItems.length)} of {allItems.length} entries
          </p>

          <div className="flex items-center gap-4">
            {/* Choose page size */}
            <div className="flex items-center gap-2 text-xs">
              <span>Choose</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="input select h-8 py-0.5 px-2 text-xs w-16"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-muted hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;

                  return (
                    <div key={p} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-muted text-xs">…</span>}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        style={p === page ? { backgroundColor: BRAND_PURPLE, borderColor: BRAND_PURPLE } : undefined}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition ${
                          p === page
                            ? 'text-white'
                            : 'border-line bg-white text-muted hover:border-brand-200 hover:text-ink'
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-muted hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          Add / Edit POPUP MODAL (Centered, NOT a sidebar)
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-lg font-bold text-ink">
                {editingItem ? 'Edit Bank Statement' : 'Add Bank Statement'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  className={`input w-full ${formErrors.date ? 'border-red-500' : ''}`}
                />
                {formErrors.date && <p className="mt-1 text-xs text-red-500">{formErrors.date}</p>}
              </div>

              {/* Account */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.account}
                  onChange={(e) => handleFormChange('account', e.target.value)}
                  className={`input select w-full ${formErrors.account ? 'border-red-500' : ''}`}
                >
                  <option value="">Select an Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
                {formErrors.account && <p className="mt-1 text-xs text-red-500">{formErrors.account}</p>}
              </div>

              {/* Narration */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Narration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.narration}
                  onChange={(e) => handleFormChange('narration', e.target.value)}
                  placeholder="Enter narration"
                  className={`input w-full ${formErrors.narration ? 'border-red-500' : ''}`}
                />
                {formErrors.narration && <p className="mt-1 text-xs text-red-500">{formErrors.narration}</p>}
              </div>

              {/* Ledger */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Ledger</label>
                <input
                  type="text"
                  value={formData.ledger}
                  onChange={(e) => handleFormChange('ledger', e.target.value)}
                  placeholder="Ledger"
                  className="input w-full"
                />
              </div>

              {/* Amount & Type (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    placeholder="0.00"
                    className={`input w-full ${formErrors.amount ? 'border-red-500' : ''}`}
                  />
                  {formErrors.amount && <p className="mt-1 text-xs text-red-500">{formErrors.amount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="input select w-full"
                  >
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Account Type</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => handleFormChange('accountType', e.target.value)}
                  className="input select w-full"
                >
                  <option value="">Select Account Type</option>
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lender */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Lender</label>
                <input
                  type="text"
                  value={formData.lenderName}
                  onChange={(e) => handleFormChange('lenderName', e.target.value)}
                  placeholder="Select a Lender or enter name"
                  className="input w-full"
                />
              </div>

              {/* Loan Name */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Loan</label>
                <input
                  type="text"
                  value={formData.loanName}
                  onChange={(e) => handleFormChange('loanName', e.target.value)}
                  placeholder="Enter loan details or loan name"
                  className="input w-full"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Add notes..."
                  className="input w-full resize-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-[40px] rounded-xl px-5 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: BRAND_PURPLE }}
                  className="min-h-[40px] rounded-xl px-6 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:translate-y-px transition disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          Notes Modal Viewer
         ========================================================================= */}
      {activeNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-base font-bold text-ink">Statement Notes</h3>
              <button
                type="button"
                onClick={() => setActiveNote(null)}
                className="text-muted hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm text-ink/90 whitespace-pre-wrap leading-relaxed">{activeNote}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveNote(null)}
                style={{ backgroundColor: BRAND_PURPLE }}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Import Statement CSV Modal
         ========================================================================= */}
      {importing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-[#40108c]" />
                <h3 className="text-base font-bold text-ink">Import CSV Statement</h3>
              </div>
              <button
                type="button"
                onClick={() => setImporting(null)}
                className="text-muted hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 border border-line p-3 text-xs text-muted">
                <p className="font-semibold text-ink">{importing.name}</p>
                <p className="mt-1">
                  {importing.rows.length} rows ready
                  {importing.skipped ? ` (${importing.skipped} empty/invalid skipped)` : ''}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Import into Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={importAccount}
                  onChange={(e) => setImportAccount(e.target.value)}
                  className="input select w-full"
                >
                  <option value="">Select an Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setImporting(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={importLoading || !importAccount}
                style={{ backgroundColor: BRAND_PURPLE }}
                className="rounded-xl px-5 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-60 transition"
              >
                {importLoading ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Delete Confirmation Modal
         ========================================================================= */}
      {deletingIds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-ink">
              {deletingIds.length > 1 ? `Delete ${deletingIds.length} entries?` : 'Delete this entry?'}
            </h3>
            <p className="mt-2 text-sm text-muted">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingIds(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
