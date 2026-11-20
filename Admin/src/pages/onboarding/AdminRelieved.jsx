import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { PersonCell } from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import { api, withQuery } from '../../api/client';
import { useAction } from '../../hooks/useAction';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/dateUtils';

export default function AdminRelieved() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useApi(withQuery('/employees', { status: 'Relieved', q: query }));
  const [reactivating, setReactivating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();

  useEffect(() => {
    const id = setTimeout(() => setQuery(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  const rows = useMemo(() => data?.items, [data]);

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      {
        key: 'employee',
        header: 'Employee',
        render: (row) => (
          <Link to={`/admin/employees/${row._id}`} className="hover:text-brand-700">
            <PersonCell name={row.name} subtitle={row.employeeId} />
          </Link>
        ),
      },
      { key: 'joining', header: 'Joining Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.dateOfJoining) },
      { key: 'email', header: 'Resignation Email', className: 'whitespace-nowrap', render: (row) => formatDate(row.relieving?.resignationEmailDate) },
      { key: 'notice', header: 'Notice Period', render: (row) => row.relieving?.noticePeriod || '—' },
      { key: 'last', header: 'Last Working Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.relieving?.lastWorkingDate) },
      { key: 'type', header: 'Relieving Type', render: (row) => row.relieving?.relievingType || '—' },
      { key: 'reason', header: 'Reason', className: 'max-w-[220px] truncate text-muted', render: (row) => row.relieving?.reason || '—' },
      {
        key: 'active',
        header: 'Active',
        align: 'center',
        className: 'whitespace-nowrap',
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="icon-btn h-8 w-8 text-brand-700 hover:bg-brand-50 hover:text-brand-800"
              title="Move to Employees"
              aria-label={`Move ${row.name} to Employees`}
              onClick={() => setReactivating(row)}
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-btn h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
              title="Delete"
              aria-label={`Delete ${row.name}`}
              onClick={() => setDeleting(row)}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Relieved List" description="People who have left ScriptX." />
      <section className="card overflow-hidden">
        <FilterBar idPrefix="relieved" search={search} onSearch={setSearch} searchPlaceholder="Search by name or ID…" />
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={reload}
          itemLabel="employees"
          caption="Relieved employees"
          empty={{ title: 'No relieved employees', description: 'Nobody has been relieved yet.' }}
        />
      </section>

      <ConfirmDialog
        open={Boolean(reactivating)}
        tone="primary"
        title={`Move ${reactivating?.name} to Employees?`}
        message="This will reactivate the employee and move them back to the active employee list."
        confirmLabel="Move to Employees"
        loading={busy}
        onConfirm={async () => {
          const ok = await run(() => api.post(`/employees/${reactivating._id}/reactivate`), {
            success: `${reactivating.name} moved back to Employees`,
          });
          if (ok) {
            setReactivating(null);
            reload();
          }
        }}
        onCancel={() => setReactivating(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        tone="danger"
        title={`Delete ${deleting?.name}?`}
        message={`Are you sure you want to delete ${deleting?.name}? This will remove them from the relieved list.`}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={async () => {
          const ok = await run(() => api.delete(`/employees/${deleting._id}`), {
            success: `${deleting.name} deleted from relieved list`,
          });
          if (ok) {
            setDeleting(null);
            reload();
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
