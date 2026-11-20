import { BriefcaseBusiness, UserCheck } from 'lucide-react';
import CrudPage from '../../components/CrudPage';
import { PersonCell } from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { ACTIVE_STATUSES, COUNTRIES } from '../../data/constants';

const COLUMNS = [
  { key: 'client_name', header: 'Client Name', render: (row) => <PersonCell name={row.client_name} subtitle={row.contact_person_role} /> },
  { key: 'company_name', header: 'Company Name', render: (row) => <span className="font-semibold">{row.company_name}</span> },
  { key: 'email', header: 'Email' },
  { key: 'phone_number', header: 'Phone Number' },
  { key: 'country', header: 'Country' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

const FIELDS = [
  { name: 'client_name', label: 'Client name', required: true },
  { name: 'company_name', label: 'Company name', required: true },
  { name: 'trader_name', label: 'Trader name' },
  { name: 'source', label: 'Source', type: 'select', options: ['Website', 'Referral', 'LinkedIn', 'Instagram', 'Other'] },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone_number', label: 'Phone number', type: 'tel', required: true },
  { name: 'country', label: 'Country', type: 'select', options: COUNTRIES },
  { name: 'gst', label: 'GST number' },
  { name: 'contact_person', label: 'Contact person' },
  { name: 'contact_person_role', label: 'Contact person role' },
  { name: 'website', label: 'Website', type: 'url' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: ACTIVE_STATUSES },
  { name: 'address', label: 'Address', type: 'textarea' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export default function AdminClients() {
  return (
    <CrudPage
      title="Clients"
      description="Companies you work with."
      endpoint="/clients"
      module="clients"
      columns={COLUMNS}
      fields={FIELDS}
      itemLabel="Client"
      defaults={{ status: 'Active', country: 'India' }}
      modalSize="xl"
      filters={[
        { key: 'status', label: 'Status', type: 'select', options: ACTIVE_STATUSES },
        { key: 'country', label: 'Country', type: 'select', options: COUNTRIES },
      ]}
      stats={(data) => [
        { title: 'Clients', value: data.total, icon: BriefcaseBusiness, tone: 'brand' },
        { title: 'Active', value: data.items.filter((c) => c.status === 'Active').length, icon: UserCheck, tone: 'green' },
      ]}
      csv={[
        { header: 'Client', value: (row) => row.client_name },
        { header: 'Company', value: (row) => row.company_name },
        { header: 'Email', value: (row) => row.email },
        { header: 'Phone', value: (row) => row.phone_number },
        { header: 'GST', value: (row) => row.gst },
        { header: 'Status', value: (row) => row.status },
      ]}
    />
  );
}
