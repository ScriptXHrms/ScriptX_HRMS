import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { EMPLOYEE_DEFAULTS, employeeSteps } from './employeeFormConfig';
import EmptyState from '../../components/EmptyState';
import FormFields, { validateFields } from '../../components/FormFields';
import PageHeader from '../../components/PageHeader';
import PageLoader from '../../components/PageLoader';
import Spinner from '../../components/Spinner';
import { api } from '../../api/client';
import { useApi, useLookups } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { idOf, toOptions } from '../../utils/format';
import { cx } from '../../utils/cx';

/** Flatten bank.* so the generic form can edit them, and back again on save. */
function toFormValues(employee) {
  const bank = Object.fromEntries(Object.entries(employee.bank ?? {}).map(([key, value]) => [`bank.${key}`, value]));
  return { ...employee, ...bank, department: idOf(employee.department), role: idOf(employee.role), shift: idOf(employee.shift) };
}

function toPayload(values) {
  const bank = {};
  const payload = {};
  Object.entries(values).forEach(([key, value]) => {
    if (key.startsWith('bank.')) bank[key.slice(5)] = value;
    else if (key !== 'bank') payload[key] = value;
  });
  return { ...payload, bank };
}

/** Create and edit share one stepped form. */
export default function AdminEmployeeForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { departments = [], roles = [], shifts = [] } = useLookups(['departments', 'roles', 'shifts']);
  const { data, loading, error } = useApi(editing ? `/employees/${id}` : null);
  const [values, setValues] = useState(EMPLOYEE_DEFAULTS);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.item) setValues(toFormValues(data.item));
  }, [data]);

  const steps = useMemo(
    () => employeeSteps({ departments: toOptions(departments), roles, shifts: toOptions(shifts), editing }),
    [departments, roles, shifts, editing],
  );
  const current = steps[step];
  const last = step === steps.length - 1;

  const change = (next, changed) => {
    setValues(changed === 'department' ? { ...next, role: '' } : next);
    if (errors[changed]) setErrors((prev) => ({ ...prev, [changed]: undefined }));
  };

  const goTo = (target) => {
    if (target > step) {
      const found = validateFields(current.fields, values);
      setErrors(found);
      if (Object.keys(found).length > 0) return;
    }
    setErrors({});
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!last) {
      goTo(step + 1);
      return;
    }
    for (let index = 0; index < steps.length; index += 1) {
      const found = validateFields(steps[index].fields, values);
      if (Object.keys(found).length > 0) {
        setStep(index);
        setErrors(found);
        return;
      }
    }
    setSaving(true);
    try {
      const { item } = editing ? await api.put(`/employees/${id}`, toPayload(values)) : await api.post('/employees', toPayload(values));
      toast.success(editing ? 'Employee updated' : 'Employee created', `${item.name} · ${item.employeeId}`);
      navigate(`/admin/employees/${item._id}`);
    } catch (failure) {
      toast.error('Couldn’t save this employee', failure.message);
      setSaving(false);
    }
  };

  if (editing && loading && !data) return <PageLoader />;
  if (editing && error) return <div className="card"><EmptyState title="Employee not found" description={error.message} /></div>;

  return (
    <div>
      <Link to={editing ? `/admin/employees/${id}` : '/admin/employees'} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        Back
      </Link>
      <PageHeader title={editing ? `Edit ${data?.item?.name ?? 'employee'}` : 'Add Employee'} description={editing ? data?.item?.employeeId : 'The employee ID is assigned automatically when you save.'} />

      <ol className="scroll-thin mb-5 flex gap-2 overflow-x-auto pb-1">
        {steps.map((item, index) => (
          <li key={item.id} className="shrink-0">
            <button
              type="button"
              onClick={() => goTo(index)}
              aria-current={index === step ? 'step' : undefined}
              className={cx('chip', index === step && 'chip-active')}
            >
              <span className={cx('flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold', index === step ? 'bg-white/20 text-white' : index < step ? 'bg-green-100 text-green-700' : 'bg-canvas text-muted')}>
                {index < step ? <Check size={12} aria-hidden="true" /> : index + 1}
              </span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      <form onSubmit={submit} noValidate className="card p-5 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-ink">{current.label}</h2>
        <FormFields fields={current.fields} values={values} onChange={change} errors={errors} />
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
          <button type="button" className="btn btn-secondary" onClick={() => goTo(step - 1)} disabled={step === 0 || saving}>
            <ArrowLeft size={16} aria-hidden="true" />
            Previous
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <Spinner size={16} />}
            {last ? (editing ? 'Save changes' : 'Create employee') : 'Next'}
            {!last && <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </div>
      </form>
    </div>
  );
}
