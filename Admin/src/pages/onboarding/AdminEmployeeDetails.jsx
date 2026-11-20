import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, FileUp, KeyRound, Pencil, Trash2, UserMinus } from 'lucide-react';
import Avatar from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import FormModal from '../../components/FormModal';
import PageLoader from '../../components/PageLoader';
import SectionCard from '../../components/SectionCard';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/Tabs';
import { api, fileUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAction } from '../../hooks/useAction';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { formatMoney } from '../../utils/format';

function Facts({ items }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-line p-3">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="mt-0.5 text-sm font-semibold break-words text-ink">{value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function RowsCard({ title, rows, render, emptyText }) {
  return (
    <SectionCard title={title}>
      {rows?.length ? <ul className="space-y-2">{rows.map(render)}</ul> : <p className="text-sm text-muted">{emptyText}</p>}
    </SectionCard>
  );
}

export default function AdminEmployeeDetails() {
  const { id } = useParams();
  const { can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const canManage = can('onboarding', 'manage');
  const { data, loading, error, reload } = useApi(`/employees/${id}`);
  const [tab, setTab] = useState('overview');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const photoRef = useRef(null);
  const { busy, run } = useAction();

  if (loading && !data) return <PageLoader />;
  if (error) return <div className="card"><EmptyState title="Employee not found" description={error.message} action={<Link to="/admin/employees" className="btn btn-secondary">Back to employees</Link>} /></div>;

  const employee = data.item;

  const uploadPhoto = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    if (await run(() => api.post(`/employees/${id}/photo`, form), { success: 'Photo updated' })) reload();
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'statutory', label: 'ID, PF & Bank' },
    { id: 'history', label: 'History' },
    { id: 'documents', label: `Documents (${employee.documents.length})` },
  ];

  return (
    <div>
      <Link to="/admin/employees" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to employees
      </Link>

      <section className="relative mb-6 overflow-hidden rounded-2xl bg-brand-700 px-5 py-6 text-white shadow-card sm:px-8">
        <div className="hex-pattern absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              {employee.photo ? (
                <img src={fileUrl(employee.photo)} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-white/30" />
              ) : (
                <Avatar name={employee.name} size="xl" />
              )}
              {canManage && (
                <>
                  <button type="button" onClick={() => photoRef.current?.click()} aria-label="Change photo" className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-ink shadow-sm hover:bg-gold-300">
                    <Camera size={14} aria-hidden="true" />
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} aria-label="Choose a photo" />
                </>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight">{employee.name}</h1>
              <p className="mt-0.5 text-sm text-brand-100">
                {employee.role?.name ?? employee.employeeType} · {employee.department?.name ?? 'No department'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-gold-400 px-2.5 py-1 text-xs font-semibold text-ink">{employee.employeeId}</span>
                <StatusBadge value={employee.status} />
              </div>
            </div>
          </div>
          {canManage && (
            <div className="flex flex-wrap gap-2">
              <Link to={`/admin/employees/${id}/edit`} className="btn btn-gold">
                <Pencil size={16} aria-hidden="true" />
                Edit
              </Link>
              <button type="button" className="btn border border-white/25 bg-white/10 text-white hover:bg-white/20" onClick={() => setPasswordOpen(true)}>
                <KeyRound size={16} aria-hidden="true" />
                Password
              </button>
              {employee.status === 'Active' && (
                <Link to={`/admin/relieving?start=${id}`} className="btn border border-white/25 bg-white/10 text-white hover:bg-white/20">
                  <UserMinus size={16} aria-hidden="true" />
                  Relieve
                </Link>
              )}
              <button type="button" className="icon-btn text-white hover:bg-white/15 hover:text-white" aria-label="Delete employee" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      <Tabs label="Employee sections" active={tab} onChange={setTab} tabs={tabs} className="mb-5" />

      {tab === 'overview' && (
        <div className="space-y-6">
          <SectionCard title="Work">
            <Facts
              items={[
                ['Email', employee.email],
                ['Phone', employee.phone],
                ['Employee type', employee.employeeType],
                ['Experience level', employee.experienceLevel],
                ['Joining date', formatDate(employee.dateOfJoining)],
                ['Confirmation date', formatDate(employee.confirmationDate)],
                ['Shift', employee.shift ? `${employee.shift.name} (${formatTime(employee.shift.from)} – ${formatTime(employee.shift.to)})` : ''],
                ['Salary paid by', employee.paymentType],
                [employee.employeeType === 'Intern' ? 'Stipend per month' : 'Salary per month', formatMoney(employee.employeeType === 'Intern' ? employee.studentAmount : employee.salaryAmount)],
              ]}
            />
          </SectionCard>
          <SectionCard title="Personal">
            <Facts
              items={[
                ['Personal email', employee.personalEmail],
                ['Date of birth', formatDate(employee.dateOfBirth)],
                ['Gender', employee.gender],
                ['Marital status', employee.maritalStatus],
                ['Father name', employee.fatherName],
                ['Mother name', employee.motherName],
                ['Address', employee.address],
                ['Permanent address', employee.permanentAddress],
                ['LinkedIn', employee.linkedIn],
              ]}
            />
            {employee.skills.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {employee.skills.map((skill) => (
                  <li key={skill} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'statutory' && (
        <div className="space-y-6">
          <SectionCard title="Identity">
            <Facts items={[['PAN', employee.panNo], ['Aadhaar', employee.aadharNo], ['Passport', employee.passportNo], ['Passport expiry', formatDate(employee.passportExpiry)]]} />
          </SectionCard>
          <SectionCard title="PF & ESI">
            <Facts items={[['UAN', employee.uanNo], ['EPFO account', employee.epfoAccountNumber], ['PF join date', formatDate(employee.pfJoinDate)], ['PF exit date', formatDate(employee.pfExpiryDate)], ['ESI IP number', employee.ipNumber], ['Insurance no.', employee.insuranceNo], ['Insurance date', formatDate(employee.insuranceDate)]]} />
          </SectionCard>
          <SectionCard title="Bank">
            <Facts items={[['Account number', employee.bank?.accountNo], ['Bank', employee.bank?.bankName], ['Branch', employee.bank?.branch], ['IFSC', employee.bank?.ifscCode], ['GPay', employee.bank?.gpayNumber]]} />
          </SectionCard>
        </div>
      )}

      {tab === 'history' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RowsCard
            title="Emergency contacts"
            rows={employee.emergencyContacts}
            emptyText="No contacts added."
            render={(c) => (
              <li key={c._id} className="rounded-xl border border-line p-3 text-sm">
                <p className="font-semibold text-ink">{c.fullName}</p>
                <p className="text-xs text-muted">
                  {c.relation} · {c.contact}
                </p>
              </li>
            )}
          />
          <RowsCard
            title="Education"
            rows={employee.education}
            emptyText="No education added."
            render={(e) => (
              <li key={e._id} className="rounded-xl border border-line p-3 text-sm">
                <p className="font-semibold text-ink">{e.schoolName}</p>
                <p className="text-xs text-muted">
                  {e.departmentName} · {e.endYear}
                </p>
              </li>
            )}
          />
          <RowsCard
            title="Experience"
            rows={employee.experience}
            emptyText="No experience added."
            render={(e) => (
              <li key={e._id} className="rounded-xl border border-line p-3 text-sm">
                <p className="font-semibold text-ink">
                  {e.jobTitle} · {e.companyName}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(e.startWork)} – {formatDate(e.endWork)}
                </p>
                {e.responsibilities && <p className="mt-1 text-xs text-muted">{e.responsibilities}</p>}
              </li>
            )}
          />
        </div>
      )}

      {tab === 'documents' && (
        <SectionCard
          title="Documents"
          action={
            canManage && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setUploadOpen(true)}>
                <FileUp size={14} aria-hidden="true" />
                Upload
              </button>
            )
          }
        >
          {employee.documents.length === 0 ? (
            <p className="text-sm text-muted">No documents uploaded.</p>
          ) : (
            <div className="space-y-4">
              {employee.documents.map((group) => (
                <div key={group._id}>
                  <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">{group.title}</p>
                  <ul className="divide-y divide-line rounded-xl border border-line">
                    {group.files.map((file) => (
                      <li key={file._id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <a href={fileUrl(file.url)} target="_blank" rel="noreferrer" className="min-w-0 truncate text-sm font-semibold text-brand-700 hover:underline">
                          {file.name}
                        </a>
                        {canManage && (
                          <button
                            type="button"
                            className="icon-btn h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${file.name}`}
                            onClick={async () => {
                              if (await run(() => api.del(`/employees/${id}/documents/${group._id}/${file._id}`), { success: 'Document deleted' })) reload();
                            }}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      <FormModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Set a new password"
        description={employee.name}
        size="sm"
        fields={[{ name: 'password', label: 'New password', type: 'password', required: true, autoComplete: 'new-password', span: 2, hint: 'At least 8 characters.', validate: (v) => (v.length < 8 ? 'Password must be at least 8 characters.' : null) }]}
        initialValues={{}}
        submitLabel="Save password"
        onSubmit={async (values) => {
          await api.post(`/employees/${id}/password`, values);
          toast.success('Password updated');
          setPasswordOpen(false);
        }}
      />

      <FormModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload document"
        size="sm"
        fields={[
          { name: 'title', label: 'Document title', required: true, span: 2, placeholder: 'Aadhaar, Offer letter…' },
          { name: 'file', label: 'File', type: 'file', required: true, span: 2, hint: 'PDF, image or Office file, up to 10 MB.' },
        ]}
        initialValues={{}}
        submitLabel="Upload"
        onSubmit={async ({ title, file }) => {
          const form = new FormData();
          form.append('title', title);
          form.append('file', file);
          await api.post(`/employees/${id}/documents`, form);
          toast.success('Document uploaded');
          setUploadOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${employee.name}?`}
        message="Employees with attendance, leave or task history can’t be deleted. Use Relieve for them."
        confirmLabel="Delete"
        loading={busy}
        onConfirm={async () => {
          const done = await run(() => api.del(`/employees/${id}`), { success: 'Employee deleted', errorTitle: 'Couldn’t delete' });
          setDeleteOpen(false);
          if (done) navigate('/admin/employees');
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
