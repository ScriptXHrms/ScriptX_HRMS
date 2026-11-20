import { KeyRound } from 'lucide-react';

/** Seeded accounts with a one-click autofill. Only rendered in development. */
export default function DemoCredentials({ email, password, onUse }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-brand-700 uppercase">
            <KeyRound size={14} aria-hidden="true" />
            Demo credentials
          </p>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-muted">Email</dt>
              <dd className="font-mono text-[13px] break-all text-ink">{email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-muted">Password</dt>
              <dd className="font-mono text-[13px] text-ink">{password}</dd>
            </div>
          </dl>
        </div>
        <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={onUse}>
          Autofill
        </button>
      </div>
    </div>
  );
}
