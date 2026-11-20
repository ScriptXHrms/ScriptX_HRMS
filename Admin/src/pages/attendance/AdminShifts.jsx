import CrudPage from '../../components/CrudPage';
import StatusBadge from '../../components/StatusBadge';
import { ACTIVE_STATUSES } from '../../data/constants';
import { formatTime } from '../../utils/dateUtils';

const COLUMNS = [
  { key: 'name', header: 'Shift Name', render: (row) => <span className="font-semibold">{row.name}</span> },
  { key: 'from', header: 'Shift From', render: (row) => formatTime(row.from) },
  { key: 'to', header: 'Shift To', render: (row) => formatTime(row.to) },
  {
    key: 'color',
    header: 'Color',
    render: (row) => <span className="inline-block h-5 w-5 rounded-md ring-1 ring-line" style={{ backgroundColor: row.color }} title={row.color} />,
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

const FIELDS = [
  { name: 'name', label: 'Shift name', required: true, span: 2 },
  { name: 'from', label: 'Shift from', type: 'time', required: true },
  { name: 'to', label: 'Shift to', type: 'time', required: true, validate: (value, values) => (value <= values.from ? 'Shift must end after it starts.' : null) },
  { name: 'color', label: 'Color', type: 'color' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: ACTIVE_STATUSES },
];

export default function AdminShifts() {
  return (
    <CrudPage
      title="Shifts"
      description="Working hours assigned to employees. Late logins are measured against these."
      endpoint="/shifts"
      module="attendance"
      columns={COLUMNS}
      fields={FIELDS}
      itemLabel="Shift"
      defaults={{ status: 'Active', color: '#40108C' }}
      modalSize="md"
      filters={[{ key: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES }]}
    />
  );
}
