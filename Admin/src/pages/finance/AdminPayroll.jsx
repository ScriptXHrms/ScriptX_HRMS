import { useMemo, useState } from 'react';
import { BadgeCheck, Banknote, Download, FileText, Hourglass, Pencil, Printer, Users, Wallet } from 'lucide-react';
import { BrandMark } from '../../components/BrandLogo';
import ActionMenu from '../../components/ActionMenu';
import { PersonCell } from '../../components/Avatar';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import FormModal from '../../components/FormModal';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/Tabs';
import { api, withQuery } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { todayISO } from '../../utils/dateUtils';
import { downloadCsv } from '../../utils/exportCsv';
import { currentMonth, formatMoney, monthLabel } from '../../utils/format';

const OVERRIDE_FIELDS = [
  { value: 'payableDays', label: 'Payable days' },
  { value: 'lop', label: 'LOP days' },
  { value: 'lateLop', label: 'Late LOP days' },
  { value: 'taskLop', label: 'Task LOP days' },
  { value: 'tds', label: 'TDS amount' },
];

const money = (value) => formatMoney(Math.round(value ?? 0));

function Payslip({ row, month }) {
  const { employee, attendance, pay, isStipend } = row;
  const earnings = isStipend
    ? [['Stipend', pay.actualGross]]
    : [['Gross Salary', pay.actualGross]];
  const deductions = isStipend
    ? [['TDS', pay.tds]]
    : [['TDS', pay.tds]];
  const details = [
    ['Employee ID', employee.employeeId],
    ['Department', employee.department?.name ?? '—'],
    ['Designation', employee.role?.name ?? '—'],
    ['Pay days', attendance.payableDays],
    ['LOP', attendance.lop + attendance.lateLop + (attendance.taskLop ?? 0)],
    ['Bank', employee.paymentType === 'BANK' ? (employee.bank?.accountNo ?? '—') : 'Cash'],
    ['PAN', employee.panNo || '—'],
    ['UAN', employee.uanNo || '—'],
  ];

  const Column = ({ title, rows, total, totalLabel }) => (
    <div className="flex-1">
      <p className="border-b border-line pb-2 text-xs font-bold tracking-wide text-muted uppercase">{title}</p>
      <dl className="divide-y divide-line/60">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 py-2 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="font-semibold text-ink tabular-nums">{money(value)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 py-2 text-sm font-bold text-ink">
          <dt>{totalLabel}</dt>
          <dd className="tabular-nums">{money(total)}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="print-area">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <BrandMark size={44} alt="ScriptX logo" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-extrabold text-brand-700">ScriptX</p>
          <p className="text-xs text-muted">Payslip for {monthLabel(month)}</p>
        </div>
      </div>
      <p className="mt-4 text-lg font-bold text-ink">{employee.name}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-col gap-6 sm:flex-row">
        <Column title="Earnings" rows={earnings} total={pay.actualGross} totalLabel="Gross earnings" />
        <Column title="Deductions" rows={deductions} total={deductions.reduce((sum, [, value]) => sum + (value ?? 0), 0)} totalLabel="Total deductions" />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-700 px-4 py-3 text-white">
        <span className="text-sm font-semibold">Net pay</span>
        <span className="text-xl font-bold tabular-nums">{money(pay.netSalary)}</span>
      </div>
    </div>
  );
}

export default function AdminPayroll() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('finance', 'manage');
  const [month, setMonth] = useState(currentMonth());
  const [employeeType, setEmployeeType] = useState('Employee');
  const [selected, setSelected] = useState(new Set());
  const [overriding, setOverriding] = useState(null);
  const [payslip, setPayslip] = useState(null);
  const [paying, setPaying] = useState(null);
  const { data, loading, error, reload } = useApi(withQuery('/payroll', { month, employeeType }));

  const isStipendView = employeeType === 'Intern';

  const columns = useMemo(() => {
    const salary = isStipendView
      ? [
          { key: 'stipend', header: 'Stipend', align: 'right', render: (row) => money(row.pay.stipend) },
        ]
      : [
          { key: 'gross', header: 'Gross', align: 'right', render: (row) => money(row.pay.gross) },
          { key: 'earned', header: 'Earned', align: 'right', render: (row) => money(row.pay.actualGross) },
          { key: 'lopDed', header: 'LOP Ded.', align: 'right', render: (row) => money(row.pay.lopDeduction) },
          { key: 'tds', header: 'TDS', align: 'right', render: (row) => money(row.pay.tds) },
        ];
    return [
      { key: 'employee', header: 'Employee', render: (row) => <PersonCell name={row.employee.name} subtitle={row.employee.employeeId} /> },
      { key: 'days', header: 'Pay Days', align: 'center', render: (row) => <span className="font-semibold tabular-nums">{row.attendance.payableDays}</span> },
      { key: 'lop', header: 'LOP', align: 'center', render: (row) => row.attendance.lop },
      { key: 'lateLop', header: 'Late LOP', align: 'center', render: (row) => row.attendance.lateLop },
      { key: 'taskLop', header: 'Task LOP', align: 'center', render: (row) => row.attendance.taskLop ?? 0 },
      ...salary,
      { key: 'net', header: 'Net Sal', align: 'right', render: (row) => <span className="font-bold tabular-nums">{money(row.pay.netSalary)}</span> },
      {
        key: 'status',
        header: 'Status',
        render: (row) => (
          <span className="flex flex-wrap items-center gap-1.5">
            <StatusBadge value={row.payment?.status === 'Paid' ? 'Paid' : 'Pending'} />
            {row.overrides.length > 0 && <StatusBadge value="Edited" tone="sky" />}
          </span>
        ),
      },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (row) => (
          <ActionMenu
            label={`Actions for ${row.employee.name}`}
            items={[
              { label: 'View payslip', icon: FileText, onClick: () => setPayslip(row) },
              ...(canManage && row.payment?.status !== 'Paid'
                ? [
                    { label: 'Adjust payroll', icon: Pencil, onClick: () => setOverriding(row) },
                    { label: 'Mark as paid', icon: BadgeCheck, onClick: () => setPaying([row]) },
                  ]
                : []),
            ]}
          />
        ),
      },
    ];
  }, [isStipendView, canManage]);

  const rows = data?.items;
  const unpaid = useMemo(() => (rows ?? []).filter((row) => row.payment?.status !== 'Paid'), [rows]);

  const exportCsv = () => {
    downloadCsv(
      `payroll-${month}-${employeeType.toLowerCase()}.csv`,
      ['Employee ID', 'Name', 'Pay Days', 'LOP', 'Late LOP', 'Task LOP', 'Gross', 'Earned', 'LOP Deduction', 'TDS', 'Net Salary', 'Status'],
      rows.map(({ employee, attendance, pay, payment }) => [
        employee.employeeId, employee.name, attendance.payableDays, attendance.lop, attendance.lateLop, attendance.taskLop ?? 0, pay.gross ?? pay.stipend, pay.actualGross, pay.lopDeduction ?? 0,
        pay.tds, pay.netSalary, payment?.status === 'Paid' ? 'Paid' : 'Pending',
      ]),
    );
  };

  const selectedRows = (rows ?? []).filter((row) => selected.has(row.employee._id) && row.payment?.status !== 'Paid');

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Salaries from attendance, leave and salary settings."
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={exportCsv} disabled={!rows?.length}>
              <Download size={16} aria-hidden="true" />
              Export CSV
            </button>
            {canManage && (
              <button type="button" className="btn btn-primary" disabled={unpaid.length === 0} onClick={() => setPaying(selectedRows.length ? selectedRows : unpaid)}>
                <Banknote size={18} aria-hidden="true" />
                {selectedRows.length ? `Pay ${selectedRows.length} selected` : 'Mark all as paid'}
              </button>
            )}
          </>
        }
      />

      <section aria-label="Totals" className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="People" value={rows?.length ?? 0} icon={Users} tone="brand" hint={monthLabel(month)} />
        <StatCard title="Net Payroll" value={money(data?.totals.net)} icon={Wallet} tone="brand" index={1} />
        <StatCard title="Paid" value={money(data?.totals.paid)} icon={BadgeCheck} tone="green" index={2} />
        <StatCard title="Pending" value={money(data?.totals.pending)} icon={Hourglass} tone="orange" index={3} />
      </section>

      <section className="card overflow-hidden">
        <FilterBar idPrefix="payroll" filters={[{ key: 'month', label: 'Month', type: 'month' }]} values={{ month }} onChange={(_, value) => value && setMonth(value)}>
          <Tabs label="Employee type" active={employeeType} onChange={setEmployeeType} tabs={[{ id: 'Employee', label: 'Employees' }, { id: 'Intern', label: 'Interns' }]} />
        </FilterBar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.employee._id}
          loading={loading}
          error={error}
          onRetry={reload}
          itemLabel="people"
          caption="Payroll"
          pageSize={15}
          selection={canManage ? { selected, onChange: setSelected } : undefined}
        />
      </section>
      <p className="mt-3 text-xs text-muted">The current month updates as attendance comes in. Days after today aren’t counted until they pass.</p>

      <Modal
        open={Boolean(payslip)}
        onClose={() => setPayslip(null)}
        title="Payslip"
        size="xl"
        footer={
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" />
            Print / Save PDF
          </button>
        }
      >
        {payslip && <Payslip row={payslip} month={month} />}
      </Modal>

      <FormModal
        open={Boolean(overriding)}
        onClose={() => setOverriding(null)}
        title="Adjust payroll"
        description={overriding ? `${overriding.employee.name} · ${monthLabel(month)}` : ''}
        size="sm"
        fields={[
          { name: 'field', label: 'What to change', type: 'select', required: true, options: OVERRIDE_FIELDS, span: 2 },
          { name: 'value', label: 'New value', type: 'number', required: true, min: 0, step: '0.5', span: 2 },
          { name: 'note', label: 'Note', type: 'textarea', required: true, hint: 'Why this is being changed. Kept with the record.' },
        ]}
        initialValues={{ field: 'payableDays' }}
        submitLabel="Save"
        onSubmit={async (values) => {
          await api.put('/payroll/override', { ...values, employee: overriding.employee._id, month });
          toast.success('Payroll updated');
          setOverriding(null);
          reload();
        }}
      >
        {() =>
          overriding?.overrides.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted uppercase">Current changes</p>
              <ul className="space-y-1.5">
                {overriding.overrides.map((override) => (
                  <li key={override._id} className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">
                      {OVERRIDE_FIELDS.find((f) => f.value === override.field)?.label}: <strong>{override.value}</strong>
                    </span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-600 hover:underline"
                      onClick={async () => {
                        await api.del(`/payroll/override/${override._id}`);
                        toast.info('Change removed');
                        setOverriding(null);
                        reload();
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        }
      </FormModal>

      <FormModal
        open={Boolean(paying)}
        onClose={() => setPaying(null)}
        title="Mark as paid"
        description={paying ? `${paying.length} ${paying.length === 1 ? 'person' : 'people'} · ${money(paying.reduce((total, row) => total + row.pay.netSalary, 0))}` : ''}
        size="sm"
        fields={[
          { name: 'paymentDate', label: 'Payment date', type: 'date', required: true, span: 2 },
          { name: 'note', label: 'Note', type: 'textarea' },
        ]}
        initialValues={{ paymentDate: todayISO() }}
        submitLabel="Mark as paid"
        onSubmit={async (values) => {
          await api.post('/payroll/mark-paid', {
            ...values,
            month,
            employees: paying.map((row) => row.employee._id),
            amounts: Object.fromEntries(paying.map((row) => [row.employee._id, row.pay.netSalary])),
          });
          toast.success('Marked as paid', `${paying.length} ${paying.length === 1 ? 'person' : 'people'}.`);
          setPaying(null);
          setSelected(new Set());
          reload();
        }}
      />
    </div>
  );
}
