import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CircleAlert, Mail, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthHeader from '../components/auth/AuthHeader';
import PasswordInput from '../components/auth/PasswordInput';
import FormField, { fieldA11y } from '../components/FormField';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ROLES, getRememberedEmail, validateLoginForm } from '../utils/authHelpers';
import { cx } from '../utils/cx';

const ROLE = ROLES.ADMIN;

export default function AdminLogin() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState(() => {
    const remembered = getRememberedEmail(ROLE);
    return { email: remembered, password: '', remember: Boolean(remembered) };
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateLoginForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      document.getElementById(nextErrors.email ? 'admin-email' : 'admin-password')?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await login({ role: ROLE, email: values.email, password: values.password, remember: values.remember });
      toast.success('Welcome back, Admin', 'You are signed in to the ScriptX Admin Portal.');
      const from = location.state?.from;
      navigate(typeof from === 'string' && from.startsWith('/admin/') ? from : '/admin/dashboard', { replace: true });
    } catch (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout portal="admin">
      <AuthHeader
        portalLabel="Admin Portal"
        portalIcon={ShieldCheck}
        title="Welcome Back"
        subtitle="Sign in to manage your marketing team."
      />

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5" aria-label="Admin sign in">
        {formError && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <CircleAlert size={18} className="mt-px shrink-0" aria-hidden="true" />
            {formError}
          </div>
        )}

        <FormField id="admin-email" label="Work email" error={errors.email}>
          <div className="relative">
            <Mail size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              {...fieldA11y('admin-email', errors.email)}
              type="email"
              inputMode="email"
              autoComplete="username"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="name@company.com"
              className={cx('input py-3 pl-10', errors.email && 'input-error')}
            />
          </div>
        </FormField>

        <FormField id="admin-password" label="Password" error={errors.password}>
          <PasswordInput
            id="admin-password"
            value={values.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
          />
        </FormField>

        <div className="flex items-center">
          <label htmlFor="admin-remember" className="inline-flex items-center gap-2 text-sm text-ink">
            <input
              id="admin-remember"
              type="checkbox"
              checked={values.remember}
              onChange={(e) => update('remember', e.target.checked)}
              className="h-4 w-4 rounded accent-brand-700"
            />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="btn btn-primary w-full py-3 text-[15px] hover:-translate-y-px"
        >
          {submitting ? (
            <>
              <Spinner size={18} />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
