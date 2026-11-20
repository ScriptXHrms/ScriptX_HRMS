import { Link } from 'react-router-dom';
import { ShieldCheck, UserRound } from 'lucide-react';
import { BrandMark } from '../components/BrandLogo';
import { EMPLOYEE_LOGIN_URL } from '../config/navigation';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-12">
      <div className="card w-full max-w-md p-8 text-center">
        <BrandMark size={64} className="mx-auto" alt="ScriptX logo" />
        <p className="mt-6 text-sm font-semibold tracking-wider text-brand-600 uppercase">Error 404</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-muted">The page you’re looking for doesn’t exist or has moved. Choose a portal to continue.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/admin/login" className="btn btn-primary">
            <ShieldCheck size={16} aria-hidden="true" />
            Admin Portal
          </Link>
          <a href={EMPLOYEE_LOGIN_URL} className="btn btn-secondary">
            <UserRound size={16} aria-hidden="true" />
            Employee Portal
          </a>
        </div>
      </div>
    </main>
  );
}
