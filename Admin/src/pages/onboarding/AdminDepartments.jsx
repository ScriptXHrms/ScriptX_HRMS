import CrudPage from '../../components/CrudPage';
import StatusBadge from '../../components/StatusBadge';
import { ACTIVE_STATUSES } from '../../data/constants';

const COLUMNS = [
  { key: 'name', header: 'Department', render: (row) => <span className="font-semibold">{row.name}</span> },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

const FIELDS = [
  { name: 'name', label: 'Department', required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: ACTIVE_STATUSES },
];

export default function AdminDepartments() {
  return (
    <CrudPage
      title="Departments"
      description="Teams that employees and roles belong to."
      endpoint="/departments"
      module="onboarding"
      columns={COLUMNS}
      fields={FIELDS}
      itemLabel="Department"
      defaults={{ status: 'Active' }}
      modalSize="md"
      filters={[{ key: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES }]}
    />
  );
}
