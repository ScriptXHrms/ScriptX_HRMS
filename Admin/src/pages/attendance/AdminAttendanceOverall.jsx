import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { PersonCell } from '../../components/Avatar';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import { withQuery } from '../../api/client';
import { EMPLOYEE_TYPES } from '../../data/constants';
import { useApi } from '../../hooks/useApi';
import { formatDuration } from '../../utils/dateUtils';
import { downloadCsv } from '../../utils/exportCsv';
import { currentMonth, monthLabel } from '../../utils/format';

const count = (key, header) => ({ key, header, align: 'center', render: (row) => row.summary[key] });

export default function AdminAttendanceOverall() {
  const [month, setMonth] = useState(currentMonth());
  const [employeeType, setEmployeeType] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useApi(withQuery('/attendance/overall', { month, employeeType }));

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data?.items.filter((row) => !q || row.employee.name.toLowerCase().includes(q));
  }, [data, search]);

  const columns = useMemo(
    () => [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      {
        key: 'employee',
        header: 'Employee',
        render: (row) => (
          <Link to={`/admin/attendance-monthly?employee=${row.employee._id}&month=${month}`} className="hover:text-brand-700">
            <PersonCell name={row.employee.name} subtitle={row.employee.employeeId} />
          </Link>
        ),
      },
      { key: 'wd', header: 'WD', align: 'center', render: (row) => row.summary.eligibleDays },
      count('present', 'Present'),
      count('wfh', 'WFH'),
      count('onDuty', 'OD'),
      count('halfDay', 'HD'),
      count('leave', 'Leave'),
      count('absent', 'Absent'),
      count('late', 'Late'),
      count('lessThan8', '<8H'),
      count('lop', 'LOP'),
      count('lateLop', 'Late LOP'),
      { key: 'hours', header: 'Hours', render: (row) => formatDuration(row.summary.payableMinutes) },
      { key: 'pay', header: 'Pay Days', align: 'center', render: (row) => <span className="font-bold tabular-nums">{row.summary.payableDays}</span> },
    ],
    [month],
  );

  const exportRows = () => {
    downloadCsv(
      `overall-attendance-${month}.csv`,
      ['Employee ID', 'Name', 'Working Days', 'Present', 'WFH', 'On Duty', 'Half Day', 'Leave', 'Absent', 'Late', 'Below 8h', 'LOP', 'Late LOP', 'Payable Days'],
      data.items.map(({ employee, summary: s }) => [employee.employeeId, employee.name, s.eligibleDays, s.present, s.wfh, s.onDuty, s.halfDay, s.leave, s.absent, s.late, s.lessThan8, s.lop, s.lateLop, s.payableDays]),
    );
  };

  return (
    <div>
      <PageHeader
        title="Overall Attendance"
        description={`Month totals for ${monthLabel(month)}. These feed payroll.`}
        actions={
          <button type="button" className="btn btn-secondary" onClick={exportRows} disabled={!data?.items.length}>
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
        }
      />
      <section className="card overflow-hidden">
        <FilterBar
          idPrefix="overall"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search employees…"
          filters={[
            { key: 'month', label: 'Month', type: 'month' },
            { key: 'employeeType', label: 'Type', type: 'select', options: EMPLOYEE_TYPES },
          ]}
          values={{ month, employeeType }}
          onChange={(key, value) => (key === 'month' ? value && setMonth(value) : setEmployeeType(value))}
        />
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.employee._id} loading={loading} error={error} onRetry={reload} itemLabel="employees" caption="Overall attendance" pageSize={15} />
      </section>
    </div>
  );
}
