import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';
import { ACTIVE_STATUSES } from '../data/constants';
import { formatDate, todayISO } from '../utils/dateUtils';

const AUDIENCES = ['Everyone', 'Employees', 'Admins'];

const COLUMNS = [
  { key: 'date', header: 'Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.date) },
  { key: 'expiryDate', header: 'Expiry Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.expiryDate) },
  {
    key: 'message',
    header: 'Message',
    className: 'max-w-[420px]',
    render: (row) => (
      <span className="line-clamp-2">
        {row.title && <span className="font-semibold text-ink">{row.title} · </span>}
        {row.message}
      </span>
    ),
  },
  { key: 'visible', header: 'Visible To' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'expiryDate', label: 'Expiry date', type: 'date', required: true, validate: (value, values) => (value < values.date ? 'Expiry date can’t be before the date.' : null) },
  { name: 'visible', label: 'Visible to', type: 'select', required: true, options: AUDIENCES },
  { name: 'status', label: 'Status', type: 'select', required: true, options: ACTIVE_STATUSES },
  { name: 'title', label: 'Title', span: 2, hint: 'Optional. Shown in bold on the employee dashboard.' },
  { name: 'message', label: 'Message', type: 'textarea', required: true, rows: 4 },
];

export default function AdminAnnouncements() {
  return (
    <CrudPage
      title="Announcements"
      description="Messages shown on dashboards until they expire. Employees are notified when you add one."
      endpoint="/announcements"
      module="announcements"
      columns={COLUMNS}
      fields={FIELDS}
      itemLabel="Announcement"
      defaults={{ date: todayISO(), expiryDate: todayISO(), visible: 'Everyone', status: 'Active' }}
      filters={[
        { key: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES },
        { key: 'visible', label: 'Visible to', type: 'select', options: AUDIENCES },
      ]}
    />
  );
}
