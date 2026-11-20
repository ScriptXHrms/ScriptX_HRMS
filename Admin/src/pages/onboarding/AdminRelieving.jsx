import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Plus, RotateCcw, UserCheck } from 'lucide-react';
import ActionMenu from '../../components/ActionMenu';
import { PersonCell } from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RELIEVING_TYPES } from '../../data/constants';
import { useAction } from '../../hooks/useAction';
import { useApi, useLookups } from '../../hooks/useApi';
import { useQueryParams } from '../../hooks/useQueryParams';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/dateUtils';
import { employeeOption, toOptions } from '../../utils/format';

export default function AdminRelieving() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('onboarding', 'manage');
  const [params, updateParams] = useQueryParams();
  const { data, loading, error, reload } = useApi('/employees?status=Relieving');
  const { employees = [] } = useLookups('employees');
  const [formOpen, setFormOpen] = useState(false);
  const [checklistFor, setChecklistFor] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const { busy, run } = useAction();

  // "Relieve" on the employee page lands here with ?start=<id>.
  const startId = params.get('start');
  useEffect(() => {
    if (startId) setFormOpen(true);
  }, [startId]);

  const relievingIds = useMemo(() => new Set((data?.items ?? []).map((e) => e._id)), [data]);
  const options = useMemo(() => toOptions(employees.filter((e) => !relievingIds.has(e._id)), employeeOption), [employees, relievingIds]);

  const fields = useMemo(
    () => [
      { name: 'employee', label: 'Employee', type: 'select', required: true, options, span: 2 },
      { name: 'relievingType', label: 'Relieving type', type: 'select', required: true, options: RELIEVING_TYPES },
      { name: 'resignationEmailDate', label: 'Last resignation email date', type: 'date' },
      { name: 'noticePeriod', label: 'Notice period', placeholder: '30 days' },
      { name: 'lastWorkingDate', label: 'Last working date', type: 'date', required: true },
      { name: 'reason', label: 'Reason', type: 'textarea' },
    ],
    [options],
  );

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'employee', header: 'Employee', render: (row) => <PersonCell name={row.name} subtitle={row.employeeId} /> },
      { key: 'joining', header: 'Joining Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.dateOfJoining) },
      { key: 'email', header: 'Resignation Email', className: 'whitespace-nowrap', render: (row) => formatDate(row.relieving?.resignationEmailDate) },
      { key: 'notice', header: 'Notice Period', render: (row) => row.relieving?.noticePeriod || '—' },
      { key: 'last', header: 'Last Working Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.relieving?.lastWorkingDate) },
      { key: 'reason', header: 'Reason', className: 'max-w-[200px] truncate text-muted', render: (row) => row.relieving?.reason || '—' },
      {
        key: 'checklist',
        header: 'Checklist',
        render: (row) => {
          const list = row.relieving?.checklist ?? [];
          return (
            <span className="text-sm font-semibold tabular-nums">
              {list.filter((c) => c.done).length}/{list.length}
            </span>
          );
        },
      },
      ...(canManage
        ? [
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              align: 'right',
              render: (row) => (
                <ActionMenu
                  label={`Actions for ${row.name}`}
                  items={[
                    { label: 'Open checklist', icon: ClipboardCheck, onClick: () => setChecklistFor(row) },
                    { label: 'Mark as relieved', icon: UserCheck, onClick: () => setConfirming(row) },
                    { label: 'Cancel relieving', icon: RotateCcw, onClick: () => setCancelling(row) },
                  ]}
                />
              ),
            },
          ]
        : []),
    ],
    [canManage],
  );

  const toggleItem = async (index) => {
    const checklist = checklistFor.relieving.checklist.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    const result = await run(() => api.put(`/employees/${checklistFor._id}/relieving/checklist`, { checklist }));
    if (result) {
      setChecklistFor(result.item);
      reload();
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    if (startId) updateParams({ start: '' });
  };

  return (
    <div>
      <PageHeader
        title="Relieving List"
        description="People serving notice. Finish the checklist, then mark them relieved."
        actions={
          canManage && (
            <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={18} aria-hidden="true" />
              Start Relieving
            </button>
          )
        }
      />
      <section className="card overflow-hidden">
        <DataTable columns={columns} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="employees" caption="Relieving list" empty={{ title: 'Nobody is serving notice', description: 'Employees in the relieving process appear here.' }} />
      </section>

      <FormModal
        open={formOpen}
        onClose={closeForm}
        title="Start relieving"
        fields={fields}
        initialValues={{ employee: startId ?? '', relievingType: 'Resignation' }}
        submitLabel="Start relieving"
        onSubmit={async ({ employee, ...values }) => {
          await api.post(`/employees/${employee}/relieving`, values);
          toast.success('Relieving started');
          closeForm();
          reload();
        }}
      />

      <Modal open={Boolean(checklistFor)} onClose={() => setChecklistFor(null)} title="Relieving checklist" description={checklistFor?.name} size="md">
        <ul className="space-y-2">
          {checklistFor?.relieving?.checklist.map((item, index) => (
            <li key={item.item}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 py-3 text-sm font-medium text-ink hover:bg-canvas">
                <input type="checkbox" checked={item.done} onChange={() => toggleItem(index)} disabled={busy} className="h-4 w-4 accent-brand-700" />
                {item.item}
              </label>
            </li>
          ))}
        </ul>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirming)}
        tone="primary"
        title={`Mark ${confirming?.name} as relieved?`}
        message="They won’t be able to sign in any more, and any admin privileges are removed."
        confirmLabel="Mark as relieved"
        loading={busy}
        onConfirm={async () => {
          const done = await run(() => api.post(`/employees/${confirming._id}/relieved`), { success: 'Employee relieved', errorTitle: 'Not ready yet' });
          setConfirming(null);
          if (done) reload();
        }}
        onCancel={() => setConfirming(null)}
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        tone="primary"
        title="Cancel relieving?"
        message={`${cancelling?.name} goes back to Active.`}
        confirmLabel="Cancel relieving"
        cancelLabel="Keep"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.post(`/employees/${cancelling._id}/reactivate`), { success: 'Back to active' })) {
            setCancelling(null);
            reload();
          }
        }}
        onCancel={() => setCancelling(null)}
      />
    </div>
  );
}
