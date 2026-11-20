import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { fieldA11y } from '../FormField';
import { cx } from '../../utils/cx';

export default function PasswordInput({ id, value, onChange, error, autoComplete = 'current-password', placeholder = 'Enter your password' }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        {...fieldA11y(id, error)}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cx('input py-3 pr-12 pl-10', error && 'input-error')}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg p-2 text-muted transition-colors hover:bg-canvas hover:text-brand-700"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        aria-controls={id}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
