import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import Modal from '../Modal';
import PasswordInput from './PasswordInput';
import FormField, { fieldA11y } from '../FormField';
import Spinner from '../Spinner';
import { api } from '../../api/client';
import { useToast } from '../../hooks/useToast';

/** Two steps: request a code by email, then set a new password with it. */
export default function ForgotPasswordModal({ open, onClose, portalName }) {
  const toast = useToast();
  const [step, setStep] = useState('email');
  const [values, setValues] = useState({ email: '', code: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const close = () => {
    setStep('email');
    setValues({ email: '', code: '', password: '' });
    setError('');
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (step === 'email') {
        await api.post('/auth/forgot-password', { email: values.email });
        setStep('reset');
      } else {
        await api.post('/auth/reset-password', values);
        toast.success('Password updated', 'You can now sign in with your new password.');
        close();
      }
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Forgot your password?"
      description={`${portalName} · Password recovery`}
      icon={
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <KeyRound size={20} aria-hidden="true" />
        </span>
      }
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={close} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form="forgot-password-form" className="btn btn-primary" disabled={busy}>
            {busy && <Spinner size={16} />}
            {step === 'email' ? 'Send code' : 'Set new password'}
          </button>
        </>
      }
    >
      <form id="forgot-password-form" onSubmit={submit} noValidate className="space-y-4">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
        {step === 'email' ? (
          <FormField id="forgot-email" label="Work email" hint="If this email has an account, we’ll send a 6-digit code to it.">
            <input
              {...fieldA11y('forgot-email', undefined, true)}
              type="email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="name@company.com"
              className="input"
              data-autofocus
            />
          </FormField>
        ) : (
          <>
            <FormField id="forgot-code" label="6-digit code" hint="The code expires in 15 minutes.">
              <input
                {...fieldA11y('forgot-code', undefined, true)}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={values.code}
                onChange={(e) => update('code', e.target.value)}
                className="input"
                data-autofocus
              />
            </FormField>
            <FormField id="forgot-password" label="New password" hint="At least 8 characters.">
              <PasswordInput id="forgot-password" value={values.password} onChange={(e) => update('password', e.target.value)} />
            </FormField>
          </>
        )}
      </form>
    </Modal>
  );
}
