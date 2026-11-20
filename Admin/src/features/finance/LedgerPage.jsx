import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PageLoader from '../../components/PageLoader';
import { api, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { cx } from '../../utils/cx';
import { formatDate, todayISO } from '../../utils/dateUtils';
import { formatMoney } from '../../utils/format';

const PAYMENT_MODES = [
  'Bank Transfer',
  'UPI',
  'Cash',
  'Cheque',
  'Credit Card',
  'Debit Card',
  'NEFT',
  'RTGS',
  'IMPS',
  'Wise Transfer',
  'Western Union',
  'Other',
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function LedgerPage({
  type = 'income',
  title = 'Income List',
  totalLabel = 'Total Income',
  endpoint = '/finance/income',
  itemLabel = 'Income',
  itemLabelPlural = 'Income entries',
  sourceLabel = 'Source',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('finance', 'manage');

  const { accounts = [] } = useLookups('accounts');

  // Filter states
  const [accountFilter, setAccountFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ account: '', month: '' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Popup Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [formValues, setFormValues] = useState({
    account: '',
    date: todayISO(),
    amount: '',
    source: '',
    paymentMode: '',
    narration: '',
    description: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Notes view modal
  const [viewNotes, setViewNotes] = useState(null);

  // Delete confirm dialog
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Fetch data with applied filters
  const queryParams = useMemo(() => {
    const q = { limit: 2000 };
    if (appliedFilters.account) q.account = appliedFilters.account;
    if (appliedFilters.month) {
      q.from = `${appliedFilters.month}-01`;
      q.to = `${appliedFilters.month}-31`;
      q.month = appliedFilters.month;
    }
    return q;
  }, [appliedFilters]);

  const { data, loading, error, reload } = useApi(withQuery(endpoint, queryParams));

  // Items list
  const items = useMemo(() => data?.items || [], [data]);

  // Total amount calculation (sum of filtered items or summary total, excluding pending scheduled)
  const totalAmount = useMemo(() => {
    if (items.length > 0) {
      return items
        .filter((item) => !item.isScheduled)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }
    return data?.summary?.total ?? 0;
  }, [items, data]);

  // Paginated items
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  // Apply filters
  const handleFilterSubmit = (e) => {
    e?.preventDefault();
    setAppliedFilters({ account: accountFilter, month: monthFilter });
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setAccountFilter('');
    setMonthFilter('');
    setAppliedFilters({ account: '', month: '' });
    setCurrentPage(1);
  };

  // Open Add Popup
  const handleOpenAdd = () => {
    setFormValues({
      account: accounts[0]?._id || '',
      date: todayISO(),
      amount: '',
      source: '',
      paymentMode: '',
      narration: '',
      description: '',
      notes: '',
    });
    setModalItem(null);
    setModalOpen(true);
  };

  // Open Edit Popup
  const handleOpenEdit = (item) => {
    setFormValues({
      account: item.account?._id || item.account || accounts[0]?._id || '',
      date: item.date || todayISO(),
      amount: item.amount ?? '',
      source: item.source || '',
      paymentMode: item.isScheduled ? (PAYMENT_MODES[0] || 'Bank Transfer') : (item.paymentMode || ''),
      narration: item.narration || '',
      description: item.description || '',
      notes: item.notes || '',
    });
    setModalItem(item);
    setModalOpen(true);
  };

  // Auto-open modal if navigated from Dashboard "Pay Now"
  useEffect(() => {
    if (location.state?.payScheduled && items.length > 0) {
      const target = location.state.payScheduled;
      const found =
        items.find(
          (i) =>
            i._id === target._id ||
            (i.isScheduled && i.clientPaymentId === target.clientPaymentId)
        ) || target;
      if (found) {
        handleOpenEdit(found);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, items, navigate, location.pathname]);

  // Close Popup
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalItem(null);
  };

  // Save form
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formValues.account) {
      toast.error('Please select an account');
      return;
    }
    if (!formValues.amount || Number(formValues.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!formValues.source) {
      toast.error(`Please enter a ${sourceLabel.toLowerCase()}`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        account: formValues.account,
        date: formValues.date || todayISO(),
        month: (formValues.date || todayISO()).slice(0, 7),
        amount: Number(formValues.amount),
        source: formValues.source,
        paymentMode: formValues.paymentMode,
        narration: formValues.narration,
        description: formValues.description,
        notes: formValues.notes,
        clientPaymentRef: modalItem?.clientPaymentId || undefined,
        installmentDate: modalItem?.installmentDate || undefined,
      };

      if (modalItem && !modalItem.isScheduled) {
        await api.put(`${endpoint}/${modalItem._id}`, payload);
        toast.success(`${itemLabel} updated successfully`);
      } else {
        await api.post(endpoint, payload);
        toast.success(
          modalItem?.isScheduled
            ? 'Payment recorded to Income and Bank Statement'
            : `${itemLabel} added successfully`
        );
      }

      handleCloseModal();
      reload();
    } catch (err) {
      toast.error(err.message || `Failed to save ${itemLabel.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete entry
  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`${endpoint}/${deleting._id}`);
      toast.success(`${itemLabel} deleted`);
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.message || `Failed to delete ${itemLabel.toLowerCase()}`);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-5 font-sans antialiased text-slate-800 pb-12">
      {/* 1. Header Row: Title & + Add Button */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Go Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
            {title}
          </h1>
        </div>

        {/* Right: + Add Button */}
        {canManage && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-[#40108c] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#320c70] transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* 2. Filters Row */}
      <form
        onSubmit={handleFilterSubmit}
        className="rounded-2xl border border-line/80 bg-white p-4 shadow-2xs transition-all"
      >
        <div className="flex flex-wrap items-end gap-3.5">
          {/* Account Name Filter */}
          <div className="min-w-[200px] flex-1 sm:max-w-xs">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Account Name
            </label>
            <div className="relative">
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="input pr-8 text-xs font-medium cursor-pointer"
              >
                <option value="">All Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name}
                  </option>
                ))}
              </select>
              {accountFilter && (
                <button
                  type="button"
                  onClick={() => setAccountFilter('')}
                  className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Month Filter */}
          <div className="min-w-[170px] sm:max-w-xs">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Month
            </label>
            <div className="relative">
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="input text-xs font-medium cursor-pointer"
                placeholder="----------- ----"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn rounded-xl bg-[#40108c] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#320c70] transition-colors cursor-pointer"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={handleFilterReset}
              className="btn rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* 3. Summary Banner Card */}
      <div className="rounded-2xl border border-purple-100/70 bg-[#fbf9fe] px-6 py-4.5 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-slate-800 sm:text-base">
            {totalLabel}
          </span>
          <span className="text-xl font-black text-[#40108c] tabular-nums tracking-tight sm:text-2xl">
            {formatMoney(totalAmount)}
          </span>
        </div>
      </div>

      {/* 4. Table Card */}
      <div className="card overflow-hidden border border-line/80 bg-white shadow-xs rounded-2xl">
        {loading && !data ? (
          <div className="p-8">
            <PageLoader />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <EmptyState
              title={`Couldn’t load ${itemLabelPlural.toLowerCase()}`}
              description={error.message}
              action={
                <button type="button" className="btn btn-secondary text-xs" onClick={reload}>
                  Try again
                </button>
              }
            />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <EmptyState
              title={`No ${itemLabelPlural.toLowerCase()} found`}
              description={
                appliedFilters.account || appliedFilters.month
                  ? 'Try clearing filters to see all entries.'
                  : `Get started by recording your first ${itemLabel.toLowerCase()} entry.`
              }
              action={
                canManage ? (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="btn rounded-xl bg-[#40108c] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#320c70]"
                  >
                    <Plus size={15} className="mr-1 inline" />
                    Add {itemLabel}
                  </button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-line/80 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="py-3.5 pl-5 pr-3 text-center">
                    S.NO
                  </th>
                  <th scope="col" className="py-3.5 px-3">
                    ACCOUNT NAME
                  </th>
                  <th scope="col" className="py-3.5 px-3">
                    NARRATION
                  </th>
                  <th scope="col" className="py-3.5 px-3 whitespace-nowrap">
                    DATE
                  </th>
                  <th scope="col" className="py-3.5 px-3 text-right whitespace-nowrap">
                    AMOUNT
                  </th>
                  <th scope="col" className="py-3.5 px-3">
                    SOURCE
                  </th>
                  <th scope="col" className="py-3.5 px-3 whitespace-nowrap">
                    PAYMENT MODE
                  </th>
                  <th scope="col" className="py-3.5 px-3">
                    DESCRIPTION
                  </th>
                  <th scope="col" className="py-3.5 px-3 text-center whitespace-nowrap">
                    NOTES
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-5 text-center whitespace-nowrap">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {paginatedItems.map((row, idx) => {
                  const serialNo = (currentPage - 1) * pageSize + idx + 1;
                  const isScheduled = !!row.isScheduled;
                  const isYellow = row.highlightColor === 'yellow';
                  const isRed = row.highlightColor === 'red';

                  let rowBgClass = 'hover:bg-slate-50/70 transition-colors';
                  if (isYellow) {
                    rowBgClass = 'bg-[#fef9c3] hover:bg-[#fef08a] transition-colors border-l-4 border-l-amber-500 font-medium';
                  } else if (isRed) {
                    rowBgClass = 'bg-[#fee2e2] hover:bg-[#fecaca] transition-colors border-l-4 border-l-rose-500 font-medium';
                  }

                  return (
                    <tr key={row._id} className={rowBgClass}>
                      {/* S.NO */}
                      <td className="py-3.5 pl-5 pr-3 text-center font-medium text-slate-500 tabular-nums">
                        {serialNo}
                      </td>

                      {/* ACCOUNT NAME */}
                      <td className="py-3.5 px-3 font-semibold text-slate-900 min-w-[150px]">
                        {row.account?.name ? (
                          row.account.name
                        ) : isScheduled ? (
                          <span
                            className={cx(
                              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border',
                              isRed
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            )}
                          >
                            Pending Confirmation
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* NARRATION */}
                      <td className="py-3.5 px-3 text-slate-700 max-w-[160px] truncate" title={row.narration}>
                        {row.narration || '—'}
                      </td>

                      {/* DATE */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 tabular-nums font-semibold">
                        {row.date ? formatDate(row.date) : '—'}
                      </td>

                      {/* AMOUNT */}
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatMoney(row.amount)}
                      </td>

                      {/* SOURCE */}
                      <td className="py-3.5 px-3 text-slate-800 min-w-[120px] font-medium">
                        {row.source || '—'}
                      </td>

                      {/* PAYMENT MODE */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isScheduled ? (
                          <span
                            className={cx(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border',
                              isRed
                                ? 'bg-rose-200/90 text-rose-900 border-rose-300'
                                : 'bg-amber-200/90 text-amber-900 border-amber-300'
                            )}
                          >
                            <span
                              className={cx(
                                'h-1.5 w-1.5 rounded-full',
                                isRed ? 'bg-rose-600' : 'bg-amber-600 animate-pulse'
                              )}
                            />
                            {row.paymentMode}
                          </span>
                        ) : row.paymentMode ? (
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-[#40108c] border border-purple-200/60">
                            {row.paymentMode}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* DESCRIPTION */}
                      <td className="py-3.5 px-3 text-slate-600 max-w-[170px] truncate" title={row.description}>
                        {row.description || '—'}
                      </td>

                      {/* NOTES (Eye Icon) */}
                      <td className="py-3.5 px-3 text-center">
                        {row.notes ? (
                          <button
                            type="button"
                            onClick={() => setViewNotes(row)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-[#40108c] hover:bg-purple-50 transition-colors cursor-pointer"
                            title="View Notes"
                          >
                            <Eye size={16} />
                          </button>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* ACTION (Edit Pencil & Delete Trash) */}
                      <td className="py-3.5 pl-3 pr-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(row)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-[#40108c] hover:bg-purple-50 transition-colors cursor-pointer"
                                title={isScheduled ? 'Confirm & Record Payment' : 'Edit'}
                              >
                                <Pencil size={15} />
                              </button>
                              {!isScheduled && (
                                <button
                                  type="button"
                                  onClick={() => setDeleting(row)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line/80 px-5 py-3.5 text-xs text-slate-500">
            {/* Left: Summary text */}
            <div>
              Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * pageSize, items.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{items.length}</span> entries
            </div>

            {/* Right: Controls & Page size */}
            <div className="flex items-center gap-3">
              {/* Page Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages > 5 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                    if (p === 2 || p === totalPages - 1) {
                      return <span key={p} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={cx(
                        'flex h-7 min-w-[28px] items-center justify-center rounded-lg px-2 text-xs font-bold transition-all cursor-pointer',
                        currentPage === p
                          ? 'bg-[#40108c] text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                      )}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Items per page selector */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-[11px] text-slate-400">Choose</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Centered Popup Modal for Add / Edit */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line/70 px-6 py-4">
              <h2 className="text-lg font-bold text-ink">
                {modalItem
                  ? (modalItem.isScheduled ? `Confirm & Record ${itemLabel}` : `Edit ${itemLabel}`)
                  : `Add ${itemLabel}`}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Name */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formValues.account}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, account: e.target.value }))}
                      className="input text-xs font-medium cursor-pointer"
                      required
                    >
                      <option value="">Select a Account</option>
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Month <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formValues.date}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, date: e.target.value }))}
                      className="input text-xs font-medium cursor-pointer"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formValues.amount}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, amount: e.target.value }))}
                      onWheel={(e) => e.target.blur()}
                      className="input text-xs font-medium"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      {sourceLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formValues.source}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, source: e.target.value }))}
                      className="input text-xs font-medium"
                      placeholder={`Enter ${sourceLabel.toLowerCase()}`}
                      required
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formValues.paymentMode}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, paymentMode: e.target.value }))}
                    className="input text-xs font-medium cursor-pointer"
                    required
                  >
                    <option value="">Select Payment Mode</option>
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Narration */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Narration
                  </label>
                  <input
                    type="text"
                    value={formValues.narration}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, narration: e.target.value }))}
                    className="input text-xs font-medium"
                    placeholder="e.g. AWS hosting fee"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formValues.description}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                    className="input text-xs font-medium resize-none"
                    placeholder="Additional details..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formValues.notes}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, notes: e.target.value }))}
                    className="input text-xs font-medium resize-none"
                    placeholder="Enter notes..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-line/70 px-6 py-4 bg-slate-50/60">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold px-6 py-2.5 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn rounded-xl bg-[#40108c] text-white hover:bg-[#320c70] font-bold px-7 py-2.5 text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Notes View Modal */}
      {viewNotes && (
        <Modal
          open={Boolean(viewNotes)}
          onClose={() => setViewNotes(null)}
          title="Notes"
          size="sm"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-line/70 pb-2 text-xs">
              <span className="font-bold text-slate-900">{viewNotes.account?.name || 'Account'}</span>
              <span className="font-bold text-[#40108c]">{formatMoney(viewNotes.amount)}</span>
            </div>
            {viewNotes.source && (
              <p className="text-xs text-slate-500">
                Source: <span className="font-medium text-slate-800">{viewNotes.source}</span>
              </p>
            )}
            <div className="rounded-xl border border-line/70 bg-slate-50/80 p-3.5 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {viewNotes.notes}
            </div>
          </div>
        </Modal>
      )}

      {/* 8. Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleting)}
        busy={deleteBusy}
        title={`Delete ${itemLabel}?`}
        message={`Are you sure you want to delete this ${itemLabel.toLowerCase()} entry? This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
