import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, IndianRupee, ListChecks } from 'lucide-react';
import CrudPage from '../../components/CrudPage';
import StatusBadge from '../../components/StatusBadge';
import { CURRENCIES, TASK_PRIORITIES } from '../../data/constants';
import { useLookups } from '../../hooks/useApi';
import { formatDate } from '../../utils/dateUtils';
import { employeeOption, formatMoney, idOf, toOptions } from '../../utils/format';

const STATUSES = ['Active', 'Inactive', 'Completed', 'On Hold'];

const COLUMNS = [
  { key: 'name', header: 'Project Name', render: (row) => <Link to={`/admin/tasks?project=${row._id}`} className="font-semibold hover:text-brand-700">{row.name}</Link> },
  { key: 'client', header: 'Client Name', render: (row) => row.client?.company_name ?? '—' },
  { key: 'manager', header: 'Manager', render: (row) => row.manager?.name ?? '—' },
  { key: 'team', header: 'Team', align: 'center', render: (row) => row.team.length },
  { key: 'end', header: 'End Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.endDate) },
  { key: 'budget', header: 'Budget', align: 'right', render: (row) => formatMoney(row.budget, row.currency) },
  { key: 'priority', header: 'Priority', render: (row) => <StatusBadge kind="priority" value={row.priority} /> },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

export default function AdminProjects() {
  const { clients = [], employees = [] } = useLookups(['clients', 'employees']);
  const clientOptions = useMemo(() => toOptions(clients, 'company_name'), [clients]);
  const employeeOptions = useMemo(() => toOptions(employees, employeeOption), [employees]);

  const fields = useMemo(
    () => [
      { name: 'name', label: 'Project name', required: true },
      { name: 'client', label: 'Client', type: 'select', required: true, options: clientOptions },
      { name: 'manager', label: 'Project manager', type: 'select', options: employeeOptions },
      { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date', validate: (value, values) => (values.startDate && value < values.startDate ? 'End date can’t be before the start date.' : null) },
      { name: 'budget', label: 'Budget', type: 'number', min: 0 },
      { name: 'currency', label: 'Currency', type: 'select', options: CURRENCIES },
      { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITIES },
      { name: 'paymentType', label: 'Payment type', type: 'select', options: ['One Time', 'Recurring', 'Milestone'] },
      { name: 'team', label: 'Team members', type: 'multiselect', options: employeeOptions },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    [clientOptions, employeeOptions],
  );

  return (
    <CrudPage
      title="Project List"
      description="Client projects, their teams and budgets. Open a project to see its tasks."
      endpoint="/projects"
      module="projects"
      columns={COLUMNS}
      fields={fields}
      itemLabel="Project"
      modalSize="xl"
      defaults={{ status: 'Active', priority: 'Medium', currency: 'INR', team: [] }}
      filters={[
        { key: 'status', label: 'Status', type: 'select', options: STATUSES, allLabel: 'All status' },
        { key: 'client', label: 'Client', type: 'select', options: clientOptions, allLabel: 'All clients' },
      ]}
      fromItem={(item) => ({ ...item, client: idOf(item.client), manager: idOf(item.manager), team: item.team.map(idOf) })}
      stats={(data) => [
        { title: 'Projects', value: data.total, icon: FolderKanban, tone: 'brand' },
        { title: 'Active', value: data.items.filter((p) => p.status === 'Active').length, icon: ListChecks, tone: 'green' },
        { title: 'INR Budget', value: formatMoney(data.items.filter((p) => p.currency === 'INR').reduce((total, p) => total + p.budget, 0)), icon: IndianRupee, tone: 'gold' },
      ]}
    />
  );
}
