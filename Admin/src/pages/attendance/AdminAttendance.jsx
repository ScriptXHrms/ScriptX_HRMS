import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CalendarRange, Download, House, Pencil, Plane, Plus, Timer, Trash2, UserCheck, UserX } from 'lucide-react';
import ActionMenu from '../../components/ActionMenu';
import { PersonCell } from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import FormModal from '../../components/FormModal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { api, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAction } from '../../hooks/useAction';
import { useApi } from '../../hooks/useApi';
import { useQueryParams } from '../../hooks/useQueryParams';
import { useToast } from '../../hooks/useToast';
import { formatDuration, formatTime, isValidISODate, todayISO } from '../../utils/dateUtils';
import { downloadCsv } from '../../utils/exportCsv';

const STATUSES = ['Present', 'Work From Home', 'On Duty', 'Half Day', 'On Leave', 'Absent', 'Holiday', 'Weekly Off'];

const toClock = (value) =>
  value ? new Date(value).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : '';

export default function AdminAttendance() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('attendance', 'manage');
  const [params, updateParams] = useQueryParams();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { busy, run } = useAction();

  const date = isValidISODate(params.get('date')) ? params.get('date') : todayISO();
  const status = params.get('status') ?? '';
  const search = params.get('q') ?? '';
  const { data, loading, error, reload } = useApi(withQuery('/attendance/daily', { date }));
  const { data: settings } = useApi('/settings');
  const lateTone = (minutes) => (minutes >= settings?.item.lateRedMinutes ? 'red' : minutes >= settings?.item.lateWarningMinutes ? 'gold' : 'neutral');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.items ?? []).filter((row) => (!status || row.status === status) && (!q || row.employee.name.toLowerCase().includes(q) || row.employee.employeeId.toLowerCase().includes(q)));
  }, [data, status, search]);

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      { key: 'name', header: 'Employee Name', render: (row) => <PersonCell name={row.employee.name} subtitle={row.employee.employeeId} /> },
      { key: 'shift', header: 'Shift', render: (row) => row.record?.shiftName ?? row.employee.shift?.name ?? '—' },
      { key: 'login', header: 'Login Time', render: (row) => (row.record?.login ? formatTime(row.record.login) : '—') },
      { key: 'logout', header: 'Logout Time', render: (row) => (row.record?.logout ? formatTime(row.record.logout) : '—') },
      { key: 'break', header: 'Break', render: (row) => (row.record ? formatDuration(row.record.breakMinutes) : '—') },
      { key: 'breakCount', header: 'Break Count', align: 'center', render: (row) => row.record?.breakCount ?? '—' },
      { key: 'total', header: 'Total Hours', render: (row) => (row.record ? formatDuration(row.record.totalMinutes) : '—') },
      { key: 'payable', header: 'Payable Time', render: (row) => (row.record ? formatDuration(row.record.payableMinutes) : '—') },
      { key: 'workType', header: 'Work Type', render: (row) => row.record?.workType ?? row.leaveType ?? row.holidayReason ?? '—' },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <span className="flex flex-wrap items-center gap-1.5">
            <StatusBadge value={row.status} />
            {row.record?.isLate && <StatusBadge value="Late" label={`Late ${row.record.lateMinutes}m`} tone={lateTone(row.record.lateMinutes)} />}
          </span>
        ),
      },
      ...(canManage
        ? [
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              align: 'right',
              render: (row) =>
                row.record ? (
                  <ActionMenu
                    label={`Actions for ${row.employee.name}`}
                    items={[
                      { label: 'Edit', icon: Pencil, onClick: () => setEditing(row) },
                      { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => setDeleting(row) },
                    ]}
                  />
                ) : null,
            },
          ]
        : []),
    ],
    [canManage, settings],
  );

  const summary = data?.summary ?? {};
  const late = (data?.items ?? []).filter((row) => row.record?.isLate).length;
  const stats = [
    { title: 'Present', key: 'Present', icon: UserCheck, tone: 'green' },
    { title: 'Work From Home', key: 'Work From Home', icon: House, tone: 'brand' },
    { title: 'On Leave', key: 'On Leave', icon: Plane, tone: 'gold' },
    { title: 'Absent', key: 'Absent', icon: UserX, tone: 'red' },
  ];

  const exportRows = () => {
    downloadCsv(
      `attendance-${date}.csv`,
      ['Employee ID', 'Name', 'Shift', 'Login', 'Logout', 'Break Minutes', 'Payable Minutes', 'Work Type', 'Status', 'Late Minutes'],
      rows.map((row) => [row.employee.employeeId, row.employee.name, row.record?.shiftName, row.record?.login ? formatTime(row.record.login) : '', row.record?.logout ? formatTime(row.record.logout) : '', row.record?.breakMinutes, row.record?.payableMinutes, row.record?.workType, row.status, row.record?.lateMinutes]),
    );
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Who came in on a given day, with hours worked and breaks."
        actions={
          <>
            <Link to="/admin/attendance-add" className="btn btn-primary">
              <Plus size={16} aria-hidden="true" />
              Add Attendance
            </Link>
            <Link to="/admin/attendance-tracker" className="btn btn-secondary">
              <Timer size={16} aria-hidden="true" />
              Attendance Tracker
            </Link>
            <Link to="/admin/attendance-overall" className="btn btn-secondary">
              <CalendarRange size={16} aria-hidden="true" />
              Overall Attendance
            </Link>
            <Link to="/admin/attendance-monthly" className="btn btn-secondary">
              <CalendarDays size={16} aria-hidden="true" />
              Monthly Attendance
            </Link>
            <button type="button" className="btn btn-secondary" onClick={exportRows} disabled={rows.length === 0}>
              <Download size={16} aria-hidden="true" />
              Export CSV
            </button>
          </>
        }
      />

      <section aria-label="Summary" className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <StatCard key={stat.key} index={index} title={stat.title} value={summary[stat.key] ?? 0} icon={stat.icon} tone={stat.tone} active={status === stat.key} onClick={() => updateParams({ status: status === stat.key ? '' : stat.key })} />
        ))}
        <StatCard index={4} title="Late Logins" value={late} icon={Timer} tone="orange" />
      </section>

      <section className="card overflow-hidden">
        <FilterBar
          idPrefix="attendance"
          search={search}
          onSearch={(value) => updateParams({ q: value })}
          searchPlaceholder="Search by name or ID…"
          filters={[
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'status', label: 'Status', type: 'select', options: STATUSES, allLabel: 'All statuses' },
          ]}
          values={{ date, status }}
          onChange={(key, value) => updateParams({ [key]: value })}
        />
        <DataTable columns={columns} rows={data ? rows : undefined} rowKey={(row) => row.employee._id} loading={loading} error={error} onRetry={reload} itemLabel="employees" caption="Daily attendance" pageSize={15} />
      </section>

      <FormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit attendance"
        description={editing?.employee.name}
        size="md"
        fields={[
          { name: 'loginTime', label: 'Login time', type: 'time', required: true },
          { name: 'logoutTime', label: 'Logout time', type: 'time' },
          { name: 'workType', label: 'Work type', type: 'select', required: true, options: ['Office', 'WFH', 'On Duty'] },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        initialValues={{ loginTime: toClock(editing?.record?.login), logoutTime: toClock(editing?.record?.logout), workType: editing?.record?.workType, notes: editing?.record?.notes }}
        onSubmit={async (values) => {
          await api.put(`/attendance/${editing.record._id}`, values);
          toast.success('Attendance updated');
          setEditing(null);
          reload();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this attendance record?"
        message={`${deleting?.employee.name} will show as absent for this date unless they have approved leave.`}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={async () => {
          if (await run(() => api.del(`/attendance/${deleting.record._id}`), { success: 'Attendance deleted' })) {
            setDeleting(null);
            reload();
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
