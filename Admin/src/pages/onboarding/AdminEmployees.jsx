import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Eye, GraduationCap, LayoutGrid, List, Pencil, Plus, UserCheck, UserMinus, Users } from 'lucide-react';
import ActionMenu from '../../components/ActionMenu';
import Avatar, { PersonCell } from '../../components/Avatar';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/Tabs';
import { withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EMPLOYEE_TYPES } from '../../data/constants';
import { useApi, useLookups } from '../../hooks/useApi';
import { useRiseIn } from '../../lib/animate';
import { formatDate } from '../../utils/dateUtils';
import { downloadCsv } from '../../utils/exportCsv';
import { toOptions } from '../../utils/format';

function EmployeeCard({ employee, index }) {
  const ref = useRiseIn(index);
  return (
    <li ref={ref}>
      <Link to={`/admin/employees/${employee._id}`} className="card block p-4 transition-shadow hover:shadow-pop">
        <div className="flex items-center gap-3">
          <Avatar name={employee.name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{employee.name}</p>
            <p className="truncate text-xs text-muted">{employee.role?.name ?? employee.employeeType}</p>
          </div>
        </div>
        <dl className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">ID</dt>
            <dd className="font-semibold text-ink">{employee.employeeId}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Department</dt>
            <dd className="truncate font-semibold text-ink">{employee.department?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Joined</dt>
            <dd className="font-semibold text-ink">{formatDate(employee.dateOfJoining)}</dd>
          </div>
        </dl>
      </Link>
    </li>
  );
}

export default function AdminEmployees() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const canManage = can('onboarding', 'manage');
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'Active' });
  const { departments = [], roles = [] } = useLookups(['departments', 'roles']);
  const { data, loading, error, reload } = useApi(withQuery('/employees', { ...filters, q: query }));
  const { data: everyone } = useApi('/employees');

  useEffect(() => {
    const id = setTimeout(() => setQuery(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      {
        key: 'name',
        header: 'Name',
        render: (row) => (
          <Link to={`/admin/employees/${row._id}`} className="hover:text-brand-700">
            <PersonCell name={row.name} subtitle={row.employeeId} />
          </Link>
        ),
      },
      { key: 'role', header: 'Role', render: (row) => row.role?.name ?? '—' },
      { key: 'department', header: 'Department', render: (row) => row.department?.name ?? '—' },
      { key: 'shift', header: 'Shift', render: (row) => row.shift?.name ?? '—' },
      {
        key: 'contact',
        header: 'Contact',
        render: (row) => (
          <div className="text-xs">
            <p className="font-medium text-ink">{row.email}</p>
            <p className="text-muted">{row.phone ?? '—'}</p>
          </div>
        ),
      },
      { key: 'joining', header: 'Joining Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.dateOfJoining) },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (row) => (
          <ActionMenu
            label={`Actions for ${row.name}`}
            items={[
              { label: 'View details', icon: Eye, onClick: () => navigate(`/admin/employees/${row._id}`) },
              ...(canManage ? [{ label: 'Edit', icon: Pencil, onClick: () => navigate(`/admin/employees/${row._id}/edit`) }] : []),
            ]}
          />
        ),
      },
    ],
    [canManage, navigate],
  );

  const exportRows = () => {
    downloadCsv(
      'employees.csv',
      ['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Role', 'Shift', 'Joining Date', 'Status', 'PAN', 'Aadhaar', 'UAN', 'PF A/C No.', 'ESI No.'],
      data.items.map((e) => [e.employeeId, e.name, e.email, e.phone, e.department?.name, e.role?.name, e.shift?.name, e.dateOfJoining, e.status, e.panNo, e.aadharNo, e.uanNo, e.epfoAccountNumber, e.ipNumber]),
    );
  };

  const all = everyone?.items ?? [];
  const stats = [
    { title: 'Active', value: all.filter((e) => e.status === 'Active').length, icon: UserCheck, tone: 'green' },
    { title: 'Interns', value: all.filter((e) => e.employeeType === 'Intern' && e.status !== 'Relieved').length, icon: GraduationCap, tone: 'sky' },
    { title: 'Relieving', value: all.filter((e) => e.status === 'Relieving').length, icon: UserMinus, tone: 'orange', onClick: () => navigate('/admin/relieving') },
    { title: 'All Time', value: all.length, icon: Users, tone: 'brand' },
  ];

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Everyone at ScriptX, with their role, shift and records."
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={exportRows} disabled={!data?.items?.length}>
              <Download size={16} aria-hidden="true" />
              Export CSV
            </button>
            {canManage && (
              <Link to="/admin/employees/new" className="btn btn-primary">
                <Plus size={18} aria-hidden="true" />
                Add Employee
              </Link>
            )}
          </>
        }
      />

      <section aria-label="Summary" className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} index={index} {...stat} />
        ))}
      </section>

      <section className="card overflow-hidden">
        <FilterBar
          idPrefix="employees"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search name, ID, email…"
          filters={[
            { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Relieving', 'Relieved'] },
            { key: 'department', label: 'Department', type: 'select', options: toOptions(departments), allLabel: 'All departments' },
            { key: 'role', label: 'Role', type: 'select', options: toOptions(roles), allLabel: 'All roles' },
            { key: 'employeeType', label: 'Type', type: 'select', options: EMPLOYEE_TYPES },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        >
          <Tabs
            label="Layout"
            active={view}
            onChange={setView}
            tabs={[
              { id: 'table', label: <List size={16} aria-label="Table view" /> },
              { id: 'cards', label: <LayoutGrid size={16} aria-label="Card view" /> },
            ]}
          />
        </FilterBar>
        {view === 'table' ? (
          <DataTable columns={columns} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="employees" caption="Employees" />
        ) : (
          <ul className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 2xl:grid-cols-4">
            {data?.items.map((employee, index) => (
              <EmployeeCard key={employee._id} employee={employee} index={index} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
