import { useEffect, useRef, useState } from 'react';
import { Check, Pencil, Trash2, Upload } from 'lucide-react';
import FormFields from '../components/FormFields';
import FormModal from '../components/FormModal';
import PageHeader from '../components/PageHeader';
import PageLoader from '../components/PageLoader';
import SectionCard from '../components/SectionCard';
import Spinner from '../components/Spinner';
import Tabs from '../components/Tabs';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { setDisplayFormats } from '../utils/dateUtils';

const number = (name, label, extra) => ({ name, label, type: 'number', min: 0, step: '0.01', ...extra });

const SECTIONS = {
  payroll: [
    {
      title: 'Salary structure',
      description: 'Used to work out every payslip.',
      fields: [
        number('gstPercent', 'GST (%)'),
        number('basicPercent', 'Basic salary percentage (%)'),
        number('hraPercent', 'HRA percentage (%)', { hint: 'Percentage of basic.' }),
        number('medicalAllowance', 'Medical allowance (monthly)'),
        number('conveyanceAllowance', 'Conveyance allowance (monthly)'),
        number('eePfPercent', 'Employee PF (%)'),
        number('erPfPercent', 'Employer PF (%)'),
        number('eeEsiPercent', 'Employee ESI (%)'),
        number('erEsiPercent', 'Employer ESI (%)'),
      ],
    },
  ],
  leave: [
    {
      title: 'Leave allowances',
      description: 'Yearly unless noted. WFH and permission are per month.',
      fields: [
        number('casualLeave', 'Casual leave (days)'),
        number('sickLeave', 'Sick leave (days)'),
        number('compensatoryLeave', 'Compensatory leave (days)'),
        number('permissionHours', 'Permission (hours per request)'),
        number('wfhCount', 'WFH count (per month)'),
        number('unhappyLeave', 'Unhappy leave (days)'),
      ],
    },
    {
      title: 'Late login rules',
      description: 'Every few late days become loss of pay.',
      fields: [
        number('lateGraceMinutes', 'Grace period (minutes)'),
        number('lateWarningMinutes', 'Yellow warning after (minutes)'),
        number('lateRedMinutes', 'Red warning after (minutes)'),
        number('lateLopDays', 'Late days for LOP'),
        { name: 'lateLopType', label: 'LOP type', type: 'select', options: ['Half Day', 'Full Day'] },
      ],
    },
  ],
  company: [
    {
      title: 'Company details',
      description: 'Printed on the back of every employee’s ID card.',
      fields: [
        { name: 'companyName', label: 'Company name' },
        { name: 'companyPhone', label: 'Phone', type: 'tel' },
        { name: 'companyEmail', label: 'Email', type: 'email' },
        { name: 'companyWebsite', label: 'Website', placeholder: 'www.example.com' },
        { name: 'companyAddress', label: 'Address', type: 'textarea', span: 2 },
      ],
    },
  ],
  display: [
    {
      title: 'Date and time format',
      fields: [
        { name: 'dateFormat', label: 'Date format', type: 'select', options: ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'MM/DD/YY', 'YYYY/MM/DD'] },
        { name: 'timeFormat', label: 'Time format', type: 'select', options: ['12-Hour', '24-Hour'] },
      ],
    },
  ],
};

function SettingsForm({ sections, values, onChange, canManage, onSave, saving }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <SectionCard key={section.title} title={section.title} description={section.description}>
          <fieldset disabled={!canManage}>
            <FormFields fields={section.fields} values={values} onChange={onChange} />
          </fieldset>
        </SectionCard>
      ))}
      {canManage && (
        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            <Check size={16} aria-hidden="true" />
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      )}
    </div>
  );
}

function PoliciesTab({ canManage }) {
  const toast = useToast();
  const { data, reload } = useApi('/protocols?group=Company');
  const [editing, setEditing] = useState(null);
  const items = data?.items ?? [];

  return (
    <SectionCard title="Policies" description="What employees read under Company Policy.">
      <ul className="divide-y divide-line">
        {items.map((policy) => (
          <li key={policy._id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{policy.title}</p>
              <p className="text-xs text-muted">{policy.group}</p>
            </div>
            {canManage && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(policy)}>
                <Pencil size={14} aria-hidden="true" />
                Edit
              </button>
            )}
          </li>
        ))}
      </ul>
      <FormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.title ?? 'policy'}`}
        size="xl"
        fields={[{ name: 'body', label: 'Policy text', type: 'textarea', rows: 14, required: true }]}
        initialValues={{ body: editing?.body }}
        onSubmit={async ({ body }) => {
          await api.put(`/protocols/${editing._id}`, { ...editing, body });
          toast.success('Policy updated');
          setEditing(null);
          reload();
        }}
      />
    </SectionCard>
  );
}

function PasswordTab() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  return (
    <SectionCard title="Your password" description="Change the password you sign in with.">
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        Change password
      </button>
      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        title="Change password"
        size="sm"
        fields={[
          { name: 'current', label: 'Current password', type: 'password', required: true, span: 2, autoComplete: 'current-password' },
          { name: 'next', label: 'New password', type: 'password', required: true, span: 2, autoComplete: 'new-password', hint: 'At least 8 characters.', validate: (v) => (v.length < 8 ? 'Password must be at least 8 characters.' : null) },
        ]}
        initialValues={{}}
        submitLabel="Update password"
        onSubmit={async (values) => {
          await api.post('/auth/change-password', values);
          toast.success('Password updated');
          setOpen(false);
        }}
      />
    </SectionCard>
  );
}

function SignatureTab({ values, onChange, canManage, onSave, saving }) {
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file', 'Please upload a valid image file (PNG, JPG, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large', 'Please select an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange((prev) => ({ ...prev, signatureImage: reader.result }));
      toast.success('Signature image selected');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    onChange((prev) => ({ ...prev, signatureImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Signature image removed');
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Invoice Digital Signature"
        description="Configure the authorized signatory name, designation, and signature image to be displayed on invoice PDFs."
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas/40 p-4">
            <input
              id="enableSignature"
              type="checkbox"
              checked={values.enableSignature ?? true}
              disabled={!canManage}
              onChange={(e) => onChange((prev) => ({ ...prev, enableSignature: e.target.checked }))}
              className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="enableSignature" className="cursor-pointer select-none">
              <span className="block text-sm font-semibold text-ink">Enable Digital Signature on Invoices</span>
              <span className="block text-xs text-muted">
                When checked, the authorized signature and signatory details will be printed on all generated client invoices.
              </span>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Signatory Name</label>
              <input
                type="text"
                disabled={!canManage}
                value={values.signatureName ?? ''}
                placeholder="e.g. Jhon Donate"
                onChange={(e) => onChange((prev) => ({ ...prev, signatureName: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Signatory Designation / Role</label>
              <input
                type="text"
                disabled={!canManage}
                value={values.signatureDesignation ?? ''}
                placeholder="e.g. Accounts Manager"
                onChange={(e) => onChange((prev) => ({ ...prev, signatureDesignation: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-2">Signature Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={!canManage}
            />

            {values.signatureImage ? (
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-canvas/30 p-4">
                <div className="flex h-24 w-52 items-center justify-center rounded-lg border border-dashed border-line bg-white p-2 shadow-inner">
                  <img
                    src={values.signatureImage}
                    alt="Signature preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-ink">Signature Image Uploaded</p>
                  <p className="text-xs text-muted">This signature will appear on client invoices below the total summary.</p>
                  {canManage && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary btn-sm"
                      >
                        <Upload size={14} aria-hidden="true" />
                        Change image
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="btn btn-danger btn-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => canManage && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-canvas/20 px-6 py-8 text-center transition ${
                  canManage ? 'cursor-pointer hover:border-brand-500 hover:bg-brand-50/10' : 'opacity-60'
                }`}
              >
                <div className="rounded-full bg-canvas p-3 text-muted">
                  <Upload size={24} aria-hidden="true" />
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">Click to upload signature image</p>
                <p className="text-xs text-muted mt-1">PNG, JPG or SVG with transparent background recommended (Max 2MB)</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Default Payment Details & Terms"
        description="Default payment methods, bank instructions, and terms printed on invoices."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Default Payment Method</label>
            <input
              type="text"
              disabled={!canManage}
              value={values.paymentMethod ?? ''}
              placeholder="e.g. Paypal, Western Union or Bank Transfer"
              onChange={(e) => onChange((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Default Payment Info (Bank Details / Card)</label>
            <textarea
              rows={2}
              disabled={!canManage}
              value={values.paymentInfo ?? ''}
              placeholder="e.g. Credit Card - 236************928 or Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234"
              onChange={(e) => onChange((prev) => ({ ...prev, paymentInfo: e.target.value }))}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Invoice Terms & Conditions</label>
            <textarea
              rows={3}
              disabled={!canManage}
              value={values.invoiceTerms ?? ''}
              placeholder="Terms and conditions printed at the bottom of the invoice..."
              onChange={(e) => onChange((prev) => ({ ...prev, invoiceTerms: e.target.value }))}
              className="input w-full"
            />
          </div>
        </div>
      </SectionCard>

      {canManage && (
        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            <Check size={16} aria-hidden="true" />
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can('settings', 'manage');
  const { data, loading } = useApi('/settings');
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('payroll');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.item) {
      setValues(data.item);
      setDisplayFormats(data.item);
    }
  }, [data]);

  if (loading && !values) return <PageLoader />;

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings', values);
      const updated = res?.item || values;
      setDisplayFormats(updated);
      setValues(updated);
      toast.success('Settings saved', 'Settings have been updated successfully.');
    } catch (error) {
      toast.error('Couldn’t save settings', error.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'payroll', label: 'Payroll' },
    { id: 'leave', label: 'Leave & Late Rules' },
    { id: 'company', label: 'Company' },
    { id: 'display', label: 'Display' },
    { id: 'policies', label: 'Policies' },
    { id: 'password', label: 'Password' },
    { id: 'signature', label: 'Signature' },
  ];

  return (
    <div>
      <PageHeader title="Settings" description="Rules for payroll, leave, company branding, and invoice signature." />
      <Tabs label="Settings sections" active={tab} onChange={setTab} tabs={tabs} className="mb-5" />
      {SECTIONS[tab] && values && <SettingsForm sections={SECTIONS[tab]} values={values} onChange={setValues} canManage={canManage} onSave={save} saving={saving} />}
      {tab === 'policies' && <PoliciesTab canManage={canManage} />}
      {tab === 'password' && <PasswordTab />}
      {tab === 'signature' && values && (
        <SignatureTab
          values={values}
          onChange={setValues}
          canManage={canManage}
          onSave={save}
          saving={saving}
        />
      )}
    </div>
  );
}
