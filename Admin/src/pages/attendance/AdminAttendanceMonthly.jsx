import { Users } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import MonthlyAttendanceView from '../../features/attendance/MonthlyAttendanceView';
import { useApi, useLookups } from '../../hooks/useApi';
import { useQueryParams } from '../../hooks/useQueryParams';
import { currentMonth, employeeOption, monthLabel, toOptions } from '../../utils/format';

export default function AdminAttendanceMonthly() {
  const [params, updateParams] = useQueryParams();
  const { employees = [] } = useLookups('employees');
  const month = params.get('month') ?? currentMonth();
  const employee = params.get('employee') ?? '';
  const { data, loading, error, reload } = useApi(employee ? `/attendance/monthly?employee=${employee}&month=${month}` : null);

  return (
    <div>
      <PageHeader title="Monthly Attendance" description={data ? `${data.employee.name} · ${monthLabel(month)}` : 'Pick an employee to see their month.'} />
      <div className="card mb-6 overflow-hidden">
        <FilterBar
          idPrefix="monthly"
          filters={[
            { key: 'employee', label: 'Employee', type: 'select', options: toOptions(employees, employeeOption), allLabel: 'Select an employee' },
            { key: 'month', label: 'Month', type: 'month' },
          ]}
          values={{ employee, month }}
          onChange={(key, value) => updateParams({ [key]: value })}
        />
      </div>
      {employee ? (
        <MonthlyAttendanceView data={data} loading={loading} error={error} onRetry={reload} month={month} />
      ) : (
        <div className="card">
          <EmptyState icon={Users} title="Select an employee" description="Their day-by-day attendance appears here." />
        </div>
      )}
    </div>
  );
}
