import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import EmptyState from './EmptyState';
import PageLoader from './PageLoader';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard. The API enforces the same rules; this only avoids showing pages
 * that would fail. Without a session you go to the login page, and it remembers
 * where you were going.
 */
export default function ProtectedRoute({ children }) {
  const { ready, session } = useAuth();
  const location = useLocation();

  if (!ready) return <PageLoader fullScreen />;
  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return children;
}

/** Login page: if already signed in, skip straight to where you were going. */
export function GuestRoute({ children }) {
  const { ready, session } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader fullScreen />;
  if (session) {
    const from = location.state?.from;
    return <Navigate to={typeof from === 'string' && from.startsWith('/admin/') ? from : '/admin/dashboard'} replace />;
  }
  return children;
}

/** Hides an admin page from HR staff who weren't granted its module. */
export function RequireModule({ module, children }) {
  const { can } = useAuth();
  if (can(module)) return children;
  return (
    <div className="card">
      <EmptyState icon={ShieldAlert} title="You don’t have access to this page" description="Ask an administrator to grant it from Privileges." />
    </div>
  );
}
