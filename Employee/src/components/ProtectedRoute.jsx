import { Navigate, useLocation } from 'react-router-dom';
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
    return <Navigate to="/employee/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
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
    return <Navigate to={typeof from === 'string' && from.startsWith('/employee/') ? from : '/employee/dashboard'} replace />;
  }
  return children;
}
