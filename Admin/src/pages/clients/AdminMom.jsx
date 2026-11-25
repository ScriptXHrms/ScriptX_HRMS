import { useState, useMemo, useEffect, useRef } from 'react';
import {
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Eye,
  File,
  FileText,
  FolderKanban,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import PageLoader from '../../components/PageLoader';
import Spinner from '../../components/Spinner';
import { api, fileUrl, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { cx } from '../../utils/cx';
import { formatDate, todayISO } from '../../utils/dateUtils';
import { idOf } from '../../utils/format';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function AdminMom() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('clients', 'manage');

  // Lookups for clients, projects, and employees
  const { clients = [], projects = [], employees = [] } = useLookups('clients', 'projects', 'employees');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ client: '', project: '', month: '' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Popup Modal states (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'

  // View Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Delete dialog
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Form values
  const [formDate, setFormDate] = useState(todayISO());
  const [formClient, setFormClient] = useState('');
  const [formProject, setFormProject] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formAttendees, setFormAttendees] = useState([]);
  const [formDescription, setFormDescription] = useState('');
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Attendees dropdown search in form
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeDropdownOpen, setAttendeeDropdownOpen] = useState(false);
  const attendeeDropdownRef = useRef(null);

  // Fetch MOM list from API
  const queryParams = useMemo(() => {
    const q = {};
    if (appliedFilters.client) q.client = appliedFilters.client;
    if (appliedFilters.project) q.project = appliedFilters.project;
    if (appliedFilters.month) {
      q.from = `${appliedFilters.month}-01`;
      q.to = `${appliedFilters.month}-31`;
    }
    return q;
  }, [appliedFilters]);

  const { data, loading, error, reload } = useApi(withQuery('/mom', queryParams));
  const rawList = useMemo(() => data?.items || data?.data || [], [data]);

  // Client-side search filtering
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return rawList;
    const term = searchQuery.toLowerCase().trim();
    return rawList.filter((item) => {
      const clientName = (item.client?.company_name || item.client?.client_name || item.clientName?.client_name || '').toLowerCase();
      const projectName = (item.project?.name || item.projectName?.name || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const attendees = (item.attendees || []).map((a) => (a?.name || a?.employeeName || '').toLowerCase()).join(' ');
      return clientName.includes(term) || projectName.includes(term) || title.includes(term) || desc.includes(term) || attendees.includes(term);
    });
  }, [rawList, searchQuery]);

  // Paginated list
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Stats calculation
  const stats = useMemo(() => {
    const currentMonth = todayISO().slice(0, 7);
    const thisMonthCount = rawList.filter((m) => (m.date || '').startsWith(currentMonth)).length;
    const uniqueClients = new Set(rawList.map((m) => idOf(m.client || m.clientName)).filter(Boolean)).size;
    const totalDocs = rawList.reduce((acc, m) => acc + (m.documents?.length || 0), 0);
    return {
      total: rawList.length,
      thisMonth: thisMonthCount,
      clients: uniqueClients,
      documents: totalDocs,
    };
  }, [rawList]);

  // Projects filtered by selected client in Form
  const formProjectOptions = useMemo(() => {
    if (!formClient) return [];
    return projects.filter((p) => idOf(p.client) === formClient);
  }, [projects, formClient]);

  // Projects filtered by client in Filter Bar
  const filterProjectOptions = useMemo(() => {
    if (!clientFilter) return projects;
    return projects.filter((p) => idOf(p.client) === clientFilter);
  }, [projects, clientFilter]);

  // Filter attendees search in multi-select dropdown
  const filteredEmployeeOptions = useMemo(() => {
    if (!attendeeSearch.trim()) return employees;
    const term = attendeeSearch.toLowerCase().trim();
    return employees.filter(
      (e) => (e.name || '').toLowerCase().includes(term) || (e.employeeId || '').toLowerCase().includes(term)
    );
  }, [employees, attendeeSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attendeeDropdownRef.current && !attendeeDropdownRef.current.contains(e.target)) {
        setAttendeeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter submit / reset
  const handleFilterSubmit = (e) => {
    e?.preventDefault();
    setAppliedFilters({ client: clientFilter, project: projectFilter, month: monthFilter });
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setClientFilter('');
    setProjectFilter('');
    setMonthFilter('');
    setSearchQuery('');
    setAppliedFilters({ client: '', project: '', month: '' });
    setCurrentPage(1);
  };

  // Open Add Popup Modal
  const handleOpenAdd = () => {
    setFormDate(todayISO());
    setFormClient(clients[0]?._id || '');
    setFormProject('');
    setFormTitle('');
    setFormAttendees([]);
    setFormDescription('');
    setExistingDocuments([]);
    setNewFiles([]);
    setEditingId(null);
    setErrors({});
    setModalMode('add');
    setModalOpen(true);
  };

  // Open Edit Popup Modal
  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormDate(item.date || todayISO());
    const cId = idOf(item.client || item.clientName) || '';
    setFormClient(cId);
    setFormProject(idOf(item.project || item.projectName) || '');
    setFormTitle(item.title || '');
    setFormAttendees((item.attendees || []).map((a) => idOf(a)).filter(Boolean));
    setFormDescription(item.description || '');
    setExistingDocuments(item.documents || []);
    setNewFiles([]);
    setErrors({});
    setModalMode('edit');
    setModalOpen(true);
  };

  // Open View Modal
  const handleOpenView = (item) => {
    setViewItem(item);
    setViewModalOpen(true);
  };

  // File upload change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setNewFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingDoc = (idx) => {
    setExistingDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Toggle attendee
  const handleToggleAttendee = (empId) => {
    setFormAttendees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  // Form Save
  const handleSaveForm = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formDate) errs.date = 'Date is required.';
    if (!formClient) errs.client = 'Client is required.';
    if (!formProject) errs.project = 'Project is required.';
    if (!formAttendees.length) errs.attendees = 'At least one attendee is required.';
    if (!formDescription.trim()) errs.description = 'Description is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('date', formDate);
      formData.append('client', formClient);
      formData.append('clientName', formClient);
      formData.append('project', formProject);
      formData.append('projectName', formProject);
      formData.append('title', formTitle);
      formData.append('description', formDescription);

      formAttendees.forEach((empId) => {
        formData.append('attendees[]', empId);
      });

      newFiles.forEach((file) => {
        formData.append('document[]', file);
      });

      if (modalMode === 'edit') {
        formData.append('retainedDocuments', JSON.stringify(existingDocuments));
        await api.put(`/mom/${editingId}`, formData);
        toast.success('MOM updated successfully!');
      } else {
        await api.post('/mom', formData);
        toast.success('MOM created successfully!');
      }

      setModalOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message || 'Failed to save Minutes of Meeting');
    } finally {
      setSaving(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setDeleteBusy(true);
    try {
      await api.del(`/mom/${deletingItem._id}`);
      toast.success('MOM deleted successfully!');
      setDeletingItem(null);
      reload();
    } catch (err) {
      toast.error(err.message || 'Failed to delete MOM');
    } finally {
      setDeleteBusy(false);
    }
  };

  // Quick Description toolbar actions
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('mom-description-input');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = formDescription.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextVal = formDescription.substring(0, start) + replacement + formDescription.substring(end);
    setFormDescription(nextVal);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 10);
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader
            title="Minutes of Meeting"
            crumbs={[
              { label: 'Dashboard', to: '/admin/dashboard' },
              { label: 'Clients', to: '/admin/clients' },
              { label: 'Minutes of Meeting' },
            ]}
          />
        </div>

        <div>
          {/* + Add MOM Button */}
          {canManage && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
            >
              <Plus size={16} />
              <span>Add MOM</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 shadow-xs">
              <FileText size={20} />
            </span>
            <div>
              <p className="text-xs font-bold text-muted">Total MOMs</p>
              <p className="text-xl font-extrabold text-ink tabular-nums mt-0.5">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 shadow-xs">
              <CalendarDays size={20} />
            </span>
            <div>
              <p className="text-xs font-bold text-muted">This Month</p>
              <p className="text-xl font-extrabold text-ink tabular-nums mt-0.5">{stats.thisMonth}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 shadow-xs">
              <BriefcaseBusiness size={20} />
            </span>
            <div>
              <p className="text-xs font-bold text-muted">Active Clients</p>
              <p className="text-xl font-extrabold text-ink tabular-nums mt-0.5">{stats.clients}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-xs">
              <Paperclip size={20} />
            </span>
            <div>
              <p className="text-xs font-bold text-muted">Total Attachments</p>
              <p className="text-xl font-extrabold text-ink tabular-nums mt-0.5">{stats.documents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-xs">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meeting, client, project, attendee…"
                className="w-full rounded-xl border border-line bg-slate-50/60 pl-9 pr-3 py-2 text-xs text-ink placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Client Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client</label>
            <select
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setProjectFilter('');
              }}
              className="w-full rounded-xl border border-line bg-slate-50/60 px-3 py-2 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.company_name || c.client_name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full rounded-xl border border-line bg-slate-50/60 px-3 py-2 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              <option value="">All Projects</option>
              {filterProjectOptions.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn btn-primary flex-1 py-2 text-xs font-bold rounded-xl shadow-xs"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={handleFilterReset}
              className="btn btn-secondary py-2 text-xs font-bold rounded-xl shadow-xs"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* 4. Table Section */}
      <div className="rounded-2xl border border-line/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12">
            <PageLoader />
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState
            title="No Minutes of Meeting found"
            description="Start documenting client discussions and action items by adding a new MOM."
            action={
              canManage ? (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="btn btn-primary rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
                >
                  <Plus size={15} />
                  Add MOM
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-slate-50/80 font-bold text-slate-600">
                  <th className="py-3.5 px-4 w-12 text-center">S.No</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Project Name</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Attendees</th>
                  <th className="py-3.5 px-4">Documents</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {paginatedList.map((row, idx) => {
                  const sNo = (currentPage - 1) * pageSize + idx + 1;
                  const clientObj = row.client || row.clientName;
                  const projectObj = row.project || row.projectName;
                  const attendeesList = row.attendees || [];
                  const docsList = row.documents || [];

                  return (
                    <tr
                      key={row._id || idx}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* S.No */}
                      <td className="py-3 px-4 font-bold text-slate-500 text-center">{sNo}</td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-ink">
                          <Calendar size={14} className="text-brand-600 shrink-0" />
                          <span>{formatDate(row.date)}</span>
                        </div>
                      </td>

                      {/* Project Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                            <FolderKanban size={14} />
                          </span>
                          <span className="font-bold text-ink truncate max-w-[200px]">
                            {projectObj?.name || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="font-bold text-ink truncate max-w-[180px]">
                            {clientObj?.company_name || clientObj?.client_name || '—'}
                          </p>
                          {clientObj?.client_name && clientObj.client_name !== clientObj.company_name && (
                            <p className="text-[11px] text-muted truncate">{clientObj.client_name}</p>
                          )}
                        </div>
                      </td>

                      {/* Attendees */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {attendeesList.slice(0, 3).map((att, aIdx) => {
                            const name = att?.name || att?.employeeName || 'Attendee';
                            return (
                              <span
                                key={aIdx}
                                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/80"
                                title={name}
                              >
                                {name}
                              </span>
                            );
                          })}
                          {attendeesList.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                              +{attendeesList.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Documents */}
                      <td className="py-3 px-4">
                        {docsList.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenView(row)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Click to view documents"
                          >
                            <Paperclip size={12} />
                            <span>{docsList.length} {docsList.length === 1 ? 'doc' : 'docs'}</span>
                          </button>
                        ) : (
                          <span className="text-muted text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenView(row)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(row)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                title="Edit MOM"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingItem(row)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete MOM"
                              >
                                <Trash2 size={15} />
                              </button>
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

        {/* 5. Pagination Bar */}
        {filteredList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line px-4 py-3 bg-slate-50/50 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="hidden sm:inline">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredList.length)} of{' '}
                {filteredList.length} entries
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-line bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-ink">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-line bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Add / Edit Popup Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-900/10 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-sm">
                  <FileText size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    {modalMode === 'edit' ? 'Edit Minutes of Meeting' : 'Add Minutes of Meeting'}
                  </h3>
                  <p className="text-xs text-muted">
                    {modalMode === 'edit' ? 'Update meeting minutes and documents' : 'Create a new MOM record'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !saving && setModalOpen(false)}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
              {/* Meeting Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meeting Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={cx(
                    'w-full rounded-xl border bg-white px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all',
                    errors.date ? 'border-red-400 ring-1 ring-red-400' : 'border-line'
                  )}
                />
                {errors.date && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.date}</p>}
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={formClient}
                  onChange={(e) => {
                    setFormClient(e.target.value);
                    setFormProject('');
                  }}
                  className={cx(
                    'w-full rounded-xl border bg-white px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all',
                    errors.client ? 'border-red-400 ring-1 ring-red-400' : 'border-line'
                  )}
                >
                  <option value="">Select a Client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.company_name || c.client_name}
                    </option>
                  ))}
                </select>
                {errors.client && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.client}</p>}
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  disabled={!formClient}
                  className={cx(
                    'w-full rounded-xl border bg-white px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed',
                    errors.project ? 'border-red-400 ring-1 ring-red-400' : 'border-line'
                  )}
                >
                  <option value="">
                    {!formClient ? 'Select a client first' : 'Select a Project'}
                  </option>
                  {formProjectOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.project && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.project}</p>}
              </div>

              {/* Meeting Title (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meeting Title <span className="text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Sprint Review, Requirement Gathering, Weekly Sync"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              {/* Attendees Multi-select */}
              <div ref={attendeeDropdownRef} className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attendees <span className="text-red-500">*</span>
                </label>

                {/* Selected Attendees Pills */}
                <div
                  onClick={() => setAttendeeDropdownOpen((p) => !p)}
                  className={cx(
                    'min-h-[40px] w-full rounded-xl border bg-white p-1.5 flex flex-wrap gap-1.5 items-center cursor-pointer focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all',
                    errors.attendees ? 'border-red-400 ring-1 ring-red-400' : 'border-line'
                  )}
                >
                  {formAttendees.length === 0 ? (
                    <span className="text-xs text-slate-400 px-2">Select meeting attendees…</span>
                  ) : (
                    formAttendees.map((id) => {
                      const emp = employees.find((e) => e._id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 text-xs font-bold text-brand-800"
                        >
                          <span>{emp?.name || id}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAttendee(id);
                            }}
                            className="text-brand-500 hover:text-brand-800 rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })
                  )}
                  <span className="ml-auto pr-2 text-slate-400">
                    <ChevronDown size={14} />
                  </span>
                </div>
                {errors.attendees && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.attendees}</p>}

                {/* Dropdown list with search */}
                {attendeeDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-full rounded-2xl border border-line/80 bg-white p-3 shadow-xl z-50 animate-in fade-in duration-150">
                    <div className="relative mb-2">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={attendeeSearch}
                        onChange={(e) => setAttendeeSearch(e.target.value)}
                        placeholder="Search employee…"
                        className="w-full rounded-lg border border-line bg-slate-50 pl-8 pr-2.5 py-1.5 text-xs text-ink focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {filteredEmployeeOptions.map((emp) => {
                        const isSelected = formAttendees.includes(emp._id);
                        return (
                          <div
                            key={emp._id}
                            onClick={() => handleToggleAttendee(emp._id)}
                            className={cx(
                              'flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors',
                              isSelected ? 'bg-brand-50/80 font-bold text-brand-900' : 'hover:bg-slate-50 text-slate-700'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                                {emp.name?.[0] || 'E'}
                              </span>
                              <span>{emp.name}</span>
                              {emp.employeeId && (
                                <span className="text-[10px] text-muted">({emp.employeeId})</span>
                              )}
                            </div>
                            {isSelected && <Check size={14} className="text-brand-700" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Description & Action Items <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertFormatting('• ')}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                      title="Add bullet item"
                    >
                      • Bullet
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                      title="Bold"
                    >
                      Bold
                    </button>
                  </div>
                </div>
                <textarea
                  id="mom-description-input"
                  rows={5}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Document discussion points, decisions made, timeline, deliverables, and assigned employee action items…"
                  className={cx(
                    'w-full rounded-xl border bg-white px-3 py-2 text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed font-sans transition-all',
                    errors.description ? 'border-red-400 ring-1 ring-red-400' : 'border-line'
                  )}
                />
                {errors.description && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.description}</p>}
              </div>

              {/* Upload Documents */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Documents / Attachments
                </label>
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line/90 bg-slate-50/70 p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                  <Upload size={22} className="text-brand-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700">Click to upload files</span>
                  <span className="text-[11px] text-muted mt-0.5">PDF, DOC, DOCX, XLS, Images, ZIP up to 10MB</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.csv,.zip"
                  />
                </label>

                {/* Existing Files (in Edit mode) */}
                {existingDocuments.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-600">Existing Attachments:</p>
                    {existingDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-line bg-slate-50/80 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <File size={15} className="text-brand-600 shrink-0" />
                          <span className="truncate font-medium text-slate-800">
                            {doc.originalName || doc.name || doc.filepath}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingDoc(idx)}
                          className="text-slate-400 hover:text-red-500 rounded p-1 transition-colors"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Newly selected files */}
                {newFiles.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-600">New Files to Upload:</p>
                    {newFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/40 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <File size={15} className="text-brand-600 shrink-0" />
                          <span className="truncate font-medium text-slate-800">{file.name}</span>
                          <span className="text-[10px] text-muted">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(idx)}
                          className="text-slate-400 hover:text-red-500 rounded p-1 transition-colors"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="btn btn-secondary px-4 py-2 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  {saving && <Spinner size={14} />}
                  <span>{modalMode === 'edit' ? 'Update MOM' : 'Save MOM'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. View Modal */}
      {viewModalOpen && viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-900/10 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 mb-1">
                  Minutes of Meeting
                </span>
                <h3 className="text-xl font-extrabold text-ink">
                  {viewItem.project?.name || viewItem.projectName?.name || 'Client Meeting'}
                </h3>
                {viewItem.title && (
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{viewItem.title}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Details */}
            <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-line/80 bg-slate-50/70 p-4 text-xs">
                <div>
                  <span className="font-bold text-muted block mb-0.5">Meeting Date</span>
                  <div className="flex items-center gap-1.5 font-bold text-ink text-sm">
                    <Calendar size={15} className="text-brand-600" />
                    <span>{formatDate(viewItem.date)}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-muted block mb-0.5">Client</span>
                  <div className="flex items-center gap-1.5 font-bold text-ink text-sm">
                    <BriefcaseBusiness size={15} className="text-brand-600" />
                    <span>
                      {viewItem.client?.company_name || viewItem.client?.client_name || viewItem.clientName?.client_name || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendees */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Meeting Attendees</h4>
                <div className="flex flex-wrap gap-2">
                  {(viewItem.attendees || []).map((att, idx) => {
                    const name = att?.name || att?.employeeName || 'Attendee';
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200/80 px-3 py-1 text-xs font-bold text-brand-800"
                      >
                        <span className="h-2 w-2 rounded-full bg-brand-600" />
                        <span>{name}</span>
                        {att?.employeeId && (
                          <span className="text-[10px] text-brand-600 font-normal">({att.employeeId})</span>
                        )}
                      </span>
                    );
                  })}
                  {(viewItem.attendees || []).length === 0 && (
                    <span className="text-xs text-muted">No attendees listed</span>
                  )}
                </div>
              </div>

              {/* Description / Minutes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Discussion Notes & Minutes
                </h4>
                <div className="rounded-2xl border border-line/80 bg-white p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans shadow-xs">
                  {viewItem.description}
                </div>
              </div>

              {/* Documents & Attachments */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Attached Documents ({(viewItem.documents || []).length})
                </h4>
                {(viewItem.documents || []).length === 0 ? (
                  <p className="text-xs text-muted">No documents attached.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {viewItem.documents.map((doc, idx) => {
                      const docUrl = doc.url || (doc.filepath ? `/uploads/mom/${doc.filepath}` : '');
                      const docName = doc.originalName || doc.name || doc.filepath || `Document ${idx + 1}`;
                      return (
                        <a
                          key={idx}
                          href={fileUrl(docUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl border border-line bg-slate-50/60 p-3 hover:bg-slate-100 hover:border-brand-300 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                              <FileText size={16} />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-ink truncate text-xs group-hover:text-brand-800">
                                {docName}
                              </p>
                              {doc.size ? (
                                <p className="text-[10px] text-muted">{(doc.size / 1024).toFixed(1)} KB</p>
                              ) : null}
                            </div>
                          </div>
                          <Download size={14} className="text-slate-400 group-hover:text-brand-700 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-line pt-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="btn btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="Delete Minutes of Meeting?"
        message={`Are you sure you want to delete the MOM for "${
          deletingItem?.project?.name || deletingItem?.projectName?.name || 'this meeting'
        }"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        tone="danger"
        loading={deleteBusy}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}
