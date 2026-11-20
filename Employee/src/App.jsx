import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import { AuthProvider } from './context/AuthContext';
import EmployeeLayout from './layouts/EmployeeLayout';
import NotFound from './pages/NotFound';

// Pages that live with their feature
const TaskBoard = lazy(() => import('./features/tasks/TaskBoard'));
const TaskDetail = lazy(() => import('./features/tasks/TaskDetail'));
const DailyReportsPage = lazy(() => import('./features/DailyReportsPage'));
const ContentCalendar = lazy(() => import('./features/calendar/ContentCalendar'));

// Employee portal pages
const EmployeeLogin = lazy(() => import('./pages/EmployeeLogin'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const EmployeeAttendance = lazy(() => import('./pages/EmployeeAttendance'));
const EmployeeMonthlyAttendance = lazy(() => import('./pages/EmployeeMonthlyAttendance'));
const EmployeeLeaves = lazy(() => import('./pages/EmployeeLeaves'));
const EmployeeWfh = lazy(() => import('./pages/EmployeeWfh'));
const EmployeeRequests = lazy(() => import('./pages/EmployeeRequests'));
const EmployeePolicy = lazy(() => import('./pages/EmployeePolicy'));
const EmployeeProfile = lazy(() => import('./pages/EmployeeProfile'));

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader fullScreen />}>
            <Routes>
            <Route path="/" element={<Navigate to="/employee/login" replace />} />

            {/* Employee portal */}
            <Route
              path="/employee/login"
              element={
                <GuestRoute>
                  <EmployeeLogin />
                </GuestRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoute>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="attendance-monthly" element={<EmployeeMonthlyAttendance />} />
              <Route path="daily-reports" element={<DailyReportsPage />} />
              <Route path="leaves" element={<EmployeeLeaves />} />
              <Route path="wfh" element={<EmployeeWfh />} />
              <Route path="tasks" element={<TaskBoard />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="content-calendar" element={<ContentCalendar />} />
              <Route path="requests" element={<EmployeeRequests />} />
              <Route path="policy" element={<EmployeePolicy />} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}
