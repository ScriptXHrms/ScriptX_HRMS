import { Link } from 'react-router-dom';
import CrudPage from '../../components/CrudPage';
import StatusBadge from '../../components/StatusBadge';
import { ACTIVE_STATUSES } from '../../data/constants';

const COLUMNS = [
  { key: 'name', header: 'Leave Type', render: (row) => <span className="font-semibold">{row.name}</span> },
  { key: 'shortCode', header: 'Short Code' },
  { key: 'paid', header: 'Paid', render: (row) => (row.paid ? 'Paid' : 'Unpaid') },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

const FIELDS = [
  { name: 'name', label: 'Leave type', required: true },
  { name: 'shortCode', label: 'Short code', required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: ACTIVE_STATUSES },
  { name: 'paid', label: 'Pay', type: 'checkbox', checkboxLabel: 'Paid leave (no salary cut)' },
];

export default function AdminLeaveTypes() {
  return (
    <CrudPage
      title="Leave Types"
      description="The kinds of leave employees can apply for. Unpaid types count as LOP in payroll."
      endpoint="/leave-types"
      module="leave"
      columns={COLUMNS}
      fields={FIELDS}
      itemLabel="Leave type"
      defaults={{ status: 'Active', paid: true }}
      modalSize="md"
      filters={[{ key: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES }]}
      headerActions={() => (
        <>
          <Link to="/admin/leaves" className="btn btn-secondary">
            Leaves
          </Link>
          <Link to="/admin/leave-options" className="btn btn-secondary">
            Leave Option
          </Link>
        </>
      )}
    />
  );
}
