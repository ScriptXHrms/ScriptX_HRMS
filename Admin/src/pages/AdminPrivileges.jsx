import { useMemo, useState } from 'react';
import { CircleAlert, Pencil, Plus, Trash2 } from 'lucide-react';
import ActionMenu from '../components/ActionMenu';
import { PersonCell } from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useAction } from '../hooks/useAction';
import { useApi, useLookups } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { employeeOption, idOf } from '../utils/format';

function PrivilegeModal({ open, onClose, record, modules, employees, takenIds, onSaved }) {
  const toast = useToast();
  const [employee, setEmployee] = useState('');
  const [grants, setGrants] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [openedFor, setOpenedFor] = useState(null);

  // Load the record once each time the dialog opens.
  const key = open ? (record?._id ?? 'new') : null;
  if (key !== openedFor) {
    setOpenedFor(key);
    setEmployee(idOf(record?.employee));
    setGrants(Object.fromEntries((record?.modules ?? []).map((m) => [m.key, m.permission])));
    setError('');
  }

  const setGrant = (moduleKey, permission) =>
    setGrants((prev) => {
      const next = { ...prev };
      if (permission) next[moduleKey] = permission;
      else delete next[moduleKey];
      return next;
    });

  const save = async () => {
    if (!employee) {
      setError('Choose an employee.');
      return;
    }
    const payload = { employee, modules: Object.entries(grants).map(([k, permission]) => ({ key: k, permission })) };
    if (payload.modules.length === 0) {
      setError('Give access to at least one module.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (record) await api.put(`/privileges/${record._id}`, payload);
      else await api.post('/privileges', payload);
      toast.success('Privileges saved', 'They can now sign in to the Admin Portal with their own login.');
      onClose();
      onSaved();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      size="lg"
      title={record ? 'Edit privileges' : 'Add privileges'}
      description="Choose what this person can see and change in the Admin Portal."
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy && <Spinner size={16} />}
            Save privileges
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <CircleAlert size={18} className="mt-px shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        <div>
          <label htmlFor="privilege-employee" className="label">
            Employee
          </label>
          <select id="privilege-employee" value={employee} disabled={Boolean(record)} onChange={(e) => setEmployee(e.target.value)} className="input select">
            <option value="">Select an employee</option>
            {employees
              .filter((e) => !takenIds.has(e._id) || e._id === idOf(record?.employee))
              .map((e) => (
                <option key={e._id} value={e._id}>
                  {employeeOption(e)}
                </option>
              ))}
          </select>
        </div>
        <fieldset>
          <legend className="label">Module access</legend>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {modules.map((module) => (
              <li key={module.key} className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5">
                <span className="text-sm font-medium text-ink">{module.label}</span>
                <label>
                  <span className="sr-only">Access to {module.label}</span>
                  <select value={grants[module.key] ?? ''} onChange={(e) => setGrant(module.key, e.target.value)} className="input select w-36 py-1.5 text-xs">
                    <option value="">No access</option>
                    <option value="view">View only</option>
                    <option value="manage">Full access</option>
                  </select>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
    </Modal>
  );
}

/** Lets HR staff use the Admin Portal, limited to the modules chosen here. */
export default function AdminPrivileges() {
  const { can } = useAuth();
  const canManage = can('privileges', 'manage');
  const { data, loading, error, reload } = useApi('/privileges');
  const { data: moduleData } = useApi('/privileges/modules');
  const { employees = [] } = useLookups('employees');
  const [modal, setModal] = useState({ open: false, record: null });
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();

  const modules = useMemo(() => moduleData?.items ?? [], [moduleData]);
  const labelOf = useMemo(() => Object.fromEntries(modules.map((m) => [m.key, m.label])), [modules]);
  const takenIds = useMemo(() => new Set((data?.items ?? []).map((row) => idOf(row.employee))), [data]);

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'employee', header: 'Employee Name', render: (row) => <PersonCell name={row.employee?.name ?? '—'} subtitle={row.employee?.employeeId} /> },
      { key: 'role', header: 'Role', render: (row) => row.employee?.role?.name ?? '—' },
      {
        key: 'modules',
        header: 'Privileges',
        render: (row) => (
          <ul className="flex flex-wrap gap-1.5">
            {row.modules.map((m) => (
              <li key={m.key}>
                <StatusBadge value={labelOf[m.key] ?? m.key} tone={m.permission === 'manage' ? 'brand' : 'neutral'} />
              </li>
            ))}
          </ul>
        ),
      },
      ...(canManage
        ? [
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              align: 'right',
              render: (row) => (
                <ActionMenu
                  label={`Actions for ${row.employee?.name}`}
                  items={[
                    { label: 'Edit', icon: Pencil, onClick: () => setModal({ open: true, record: row }) },
                    { label: 'Remove access', icon: Trash2, tone: 'danger', onClick: () => setDeleting(row) },
                  ]}
                />
              ),
            },
          ]
        : []),
    ],
    [canManage, labelOf],
  );

  return (
    <div>
      <PageHeader
        title="Privileges"
        description="Give HR staff access to parts of the Admin Portal. Purple modules have full access; grey are view only."
        actions={
          canManage && (
            <button type="button" className="btn btn-primary" onClick={() => setModal({ open: true, record: null })}>
              <Plus size={18} aria-hidden="true" />
              Add Privileges
            </button>
          )
        }
      />
      <section className="card overflow-hidden">
        <DataTable columns={columns} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="people" caption="Admin privileges" empty={{ title: 'Nobody has privileges yet', description: 'Add someone to give them Admin Portal access.' }} />
      </section>
      <PrivilegeModal open={modal.open} record={modal.record} modules={modules} employees={employees} takenIds={takenIds} onClose={() => setModal((prev) => ({ ...prev, open: false }))} onSaved={reload} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove admin access?"
        message={`${deleting?.employee?.name} will only be able to use the Employee Portal.`}
        confirmLabel="Remove access"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.del(`/privileges/${deleting._id}`), { success: 'Access removed' })) {
            setDeleting(null);
            reload();
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
