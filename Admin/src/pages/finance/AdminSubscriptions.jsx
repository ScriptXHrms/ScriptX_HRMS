import { useMemo } from 'react';
import { BadgeCheck, CalendarClock, KeyRound, Wallet } from 'lucide-react';
import CrudPage from '../../components/CrudPage';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../api/client';
import { ACTIVE_STATUSES } from '../../data/constants';
import { useToast } from '../../hooks/useToast';
import { daysFromToday, formatDate } from '../../utils/dateUtils';
import { formatMoney } from '../../utils/format';

const RECURRING = ['Monthly', 'Quarterly', 'Half Year', 'Yearly'];

const COLUMNS = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <div>
        <p className="font-semibold">{row.name}</p>
        {row.url && (
          <a href={row.url} target="_blank" rel="noreferrer" className="text-xs text-brand-700 hover:underline">
            {row.url.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
    ),
  },
  { key: 'recurringType', header: 'Recurring Type' },
  { key: 'amount', header: 'Amount', align: 'right', render: (row) => <span className="font-semibold">{formatMoney(row.amount)}</span> },
  { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
  { key: 'expiryDate', header: 'Expiry Date', render: (row) => formatDate(row.expiryDate) },
  { key: 'login', header: 'Credentials', render: (row) => row.email || row.username || '—' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'url', label: 'URL', type: 'url', placeholder: 'https://' },
  { name: 'recurringType', label: 'Recurring type', type: 'select', required: true, options: RECURRING },
  { name: 'amount', label: 'Amount', type: 'number', min: 0 },
  { name: 'dueDate', label: 'Next due date', type: 'date' },
  { name: 'expiryDate', label: 'Expiry date', type: 'date' },
  { name: 'gstNumber', label: 'GST IN' },
  { name: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES },
  { name: 'username', label: 'Username' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password', hint: 'Stored encrypted. Leave blank to keep the current one.', span: 2 },
];

export default function AdminSubscriptions() {
  const toast = useToast();

  const extraActions = useMemo(
    () => (row) => [
      {
        label: 'Copy password',
        icon: KeyRound,
        onClick: async () => {
          try {
            const { password } = await api.get(`/finance/subscriptions/${row._id}/password`);
            if (!password) {
              toast.info('No password saved', `${row.name} has no stored password.`);
              return;
            }
            await navigator.clipboard.writeText(password);
            toast.success('Password copied', `For ${row.name}.`);
          } catch (error) {
            toast.error('Couldn’t copy the password', error.message);
          }
        },
      },
    ],
    [toast],
  );

  return (
    <CrudPage
      title="Subscription Logins"
      description="Software subscriptions, renewal dates and shared logins."
      endpoint="/finance/subscriptions"
      module="finance"
      columns={COLUMNS}
      fields={FIELDS}
      itemLabel="Subscription"
      defaults={{ recurringType: 'Monthly', status: 'Active' }}
      filters={[
        { key: 'recurringType', label: 'Recurring type', type: 'select', options: RECURRING },
        { key: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES },
      ]}
      extraActions={extraActions}
      stats={(data) => {
        const active = data.items.filter((row) => row.status === 'Active');
        const monthly = active.reduce((total, row) => total + row.amount / { Monthly: 1, Quarterly: 3, 'Half Year': 6, Yearly: 12 }[row.recurringType], 0);
        return [
          { title: 'Active', value: active.length, icon: BadgeCheck, tone: 'green' },
          { title: 'Monthly Cost', value: formatMoney(Math.round(monthly)), icon: Wallet, tone: 'brand', hint: 'Averaged across billing cycles' },
          { title: 'Due in 30 Days', value: active.filter((row) => row.dueDate && daysFromToday(row.dueDate) >= 0 && daysFromToday(row.dueDate) <= 30).length, icon: CalendarClock, tone: 'orange' },
        ];
      }}
    />
  );
}
