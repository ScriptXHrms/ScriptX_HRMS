import { useMemo, useState } from 'react';
import { CalendarDays, CalendarHeart } from 'lucide-react';
import CrudPage from '../components/CrudPage';
import { useApi } from '../hooks/useApi';
import { formatLongDate, todayISO } from '../utils/dateUtils';

const COLUMNS = [
  { key: 'date', header: 'Date', render: (row) => <span className="font-medium">{formatLongDate(row.date)}</span> },
  { key: 'reason', header: 'Reason' },
];

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'reason', label: 'Reason', required: true },
];

export default function AdminHolidays() {
  const today = todayISO();
  const [year, setYear] = useState(today.slice(0, 4));
  const { data } = useApi('/holidays/years');
  const yearOptions = useMemo(() => data?.years ?? [year], [data, year]);

  return (
    <CrudPage
      key={year}
      title="Holidays"
      description="Paid holidays. They count as working days in payroll and block leave days."
      endpoint="/holidays"
      module="holidays"
      columns={COLUMNS}
      fields={FIELDS}
      itemLabel="Holiday"
      modalSize="md"
      searchPlaceholder="Search holidays…"
      initialFilters={{ from: `${year}-01-01`, to: `${year}-12-31` }}
      defaults={{ date: today }}
      stats={(result) => [
        { title: `Holidays in ${year}`, value: result.total, icon: CalendarDays, tone: 'brand' },
        { title: 'Still to Come', value: result.items.filter((h) => h.date >= today).length, icon: CalendarHeart, tone: 'gold' },
      ]}
      headerActions={() => (
        <label className="flex items-center gap-2 text-sm font-medium text-muted">
          Year
          <select value={year} onChange={(e) => setYear(e.target.value)} className="input select w-28">
            {yearOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      )}
    />
  );
}
