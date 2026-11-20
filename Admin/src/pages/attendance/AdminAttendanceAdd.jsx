import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import FormModal from '../../components/FormModal';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatDuration, formatTime, todayISO } from '../../utils/dateUtils';
import { currentMonth, employeeOption, toOptions } from '../../utils/format';

const COLUMNS = [
  { key: 'sno', header: 'Sno', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
  { key: 'name', header: 'Name', render: (row) => <span className="font-semibold">{row.employee?.name}</span> },
  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  { key: 'shift', header: 'Shift', render: (row) => row.shiftName ?? '—' },
  { key: 'workType', header: 'Work Type', render: (row) => <StatusBadge value={row.workType} tone="sky" /> },
  { key: 'login', header: 'Login Time', render: (row) => (row.login ? formatTime(row.login) : '—') },
  { key: 'logout', header: 'Logout Time', render: (row) => (row.logout ? formatTime(row.logout) : '—') },
  { key: 'payable', header: 'Payable', render: (row) => formatDuration(row.payableMinutes) },
  { key: 'notes', header: 'Notes', className: 'max-w-[220px] truncate text-muted', render: (row) => row.notes || '—' },
];

/** Attendance entered by HR, for on-duty days and missed punches. */
export default function AdminAttendanceAdd() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('attendance', 'manage');
  const [month, setMonth] = useState(currentMonth());
  const [formOpen, setFormOpen] = useState(false);
  const { employees = [] } = useLookups('employees');
  const { data, loading, error, reload } = useApi(`/attendance/admin-marks?month=${month}`);

  const fields = useMemo(
    () => [
      { name: 'employee', label: 'Employee', type: 'select', required: true, options: toOptions(employees, employeeOption), span: 2 },
      { name: 'date', label: 'Date', type: 'date', required: true, max: todayISO() },
      { name: 'workType', label: 'Work type', type: 'select', required: true, options: ['On Duty', 'Office', 'WFH'] },
      { name: 'loginTime', label: 'Login time', type: 'time', required: true },
      { name: 'logoutTime', label: 'Logout time', type: 'time' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    [employees],
  );

  return (
    <div>
      <PageHeader
        title="Add Attendance"
        description="Enter attendance for on-duty days or when someone missed a punch."
        actions={
          canManage && (
            <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={18} aria-hidden="true" />
              Add Attendance
            </button>
          )
        }
      />
      <section className="card overflow-hidden">
        <FilterBar idPrefix="attendance-add" filters={[{ key: 'month', label: 'Month', type: 'month' }]} values={{ month }} onChange={(_, value) => value && setMonth(value)} />
        <DataTable columns={COLUMNS} rows={data?.items} loading={loading} error={error} onRetry={reload} itemLabel="records" caption="Attendance added by HR" empty={{ title: 'Nothing added this month', description: 'Records you add appear here.' }} />
      </section>
      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add attendance"
        fields={fields}
        initialValues={{ date: todayISO(), workType: 'On Duty' }}
        submitLabel="Add attendance"
        onSubmit={async (values) => {
          await api.post('/attendance/admin-mark', values);
          toast.success('Attendance added');
          setFormOpen(false);
          reload();
        }}
      />
    </div>
  );
}
