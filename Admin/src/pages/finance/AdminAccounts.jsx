import CrudPage from '../../components/CrudPage';
import StatusBadge from '../../components/StatusBadge';
import { ACTIVE_STATUSES } from '../../data/constants';
import { formatDate } from '../../utils/dateUtils';

const ACCOUNT_TYPES = ['Bank', 'Cash', 'Credit Card', 'Wallet'];

const COLUMNS = [
  { key: 'name', header: 'Name', render: (row) => <span className="font-semibold">{row.name}</span> },
  { key: 'accountType', header: 'Account Type' },
  { key: 'createdAt', header: 'Created At', render: (row) => formatDate(row.createdAt) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'accountType', label: 'Account type', type: 'select', required: true, options: ACCOUNT_TYPES },
  { name: 'status', label: 'Status', type: 'select', required: true, options: ACTIVE_STATUSES },
];

export default function AdminAccounts() {
  return (
    <CrudPage
      title="Finance Accounts"
      description="Bank, cash and card accounts used across income, expenses and statements."
      endpoint="/finance/accounts"
      module="finance"
      columns={COLUMNS}
      fields={FIELDS}
      itemLabel="Account"
      defaults={{ status: 'Active', accountType: 'Bank' }}
      filters={[{ key: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES }]}
    />
  );
}
