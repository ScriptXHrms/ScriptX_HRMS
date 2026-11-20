import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import MonthlyAttendanceView from '../features/attendance/MonthlyAttendanceView';
import { useApi } from '../hooks/useApi';
import { currentMonth, monthLabel } from '../utils/format';

export default function EmployeeMonthlyAttendance() {
  const [month, setMonth] = useState(currentMonth());
  const { data, loading, error, reload } = useApi(`/attendance/me/month?month=${month}`);

  return (
    <div>
      <PageHeader title="Monthly Attendance" description={`Your attendance for ${monthLabel(month)}.`} />
      <MonthlyAttendanceView month={month} onMonthChange={setMonth} data={data} loading={loading} error={error} onRetry={reload} />
    </div>
  );
}
