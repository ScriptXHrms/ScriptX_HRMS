import { useMemo } from 'react';
import CrudPage from '../../components/CrudPage';
import StatusBadge from '../../components/StatusBadge';
import { ACTIVE_STATUSES } from '../../data/constants';
import { useLookups } from '../../hooks/useApi';
import { idOf, toOptions } from '../../utils/format';

const COLUMNS = [
  { key: 'name', header: 'Role Name', render: (row) => <span className="font-semibold">{row.name}</span> },
  { key: 'department', header: 'Department', render: (row) => row.department?.name ?? '—' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

export default function AdminRoles() {
  const { departments = [] } = useLookups('departments');
  const departmentOptions = useMemo(() => toOptions(departments), [departments]);

  const fields = useMemo(
    () => [
      { name: 'name', label: 'Role name', required: true },
      { name: 'department', label: 'Department', type: 'select', required: true, options: departmentOptions },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ACTIVE_STATUSES },
    ],
    [departmentOptions],
  );

  return (
    <CrudPage
      title="Roles"
      description="Job roles within each department."
      endpoint="/roles"
      module="onboarding"
      columns={COLUMNS}
      fields={fields}
      itemLabel="Role"
      defaults={{ status: 'Active' }}
      fromItem={(item) => ({ ...item, department: idOf(item.department) })}
      filters={[
        { key: 'department', label: 'Department', type: 'select', options: departmentOptions, allLabel: 'All departments' },
        { key: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES },
      ]}
    />
  );
}
