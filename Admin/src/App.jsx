import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ProtectedRoute, { GuestRoute, RequireModule } from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import NotFound from './pages/NotFound';

// Pages that live with their feature
const TaskBoard = lazy(() => import('./features/tasks/TaskBoard'));
const TaskDetail = lazy(() => import('./features/tasks/TaskDetail'));
const DailyReportsPage = lazy(() => import('./features/DailyReportsPage'));
const ContentCalendar = lazy(() => import('./features/calendar/ContentCalendar'));

// Admin portal pages
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminRecurring = lazy(() => import('./pages/finance/AdminRecurring'));
const AdminPayroll = lazy(() => import('./pages/finance/AdminPayroll'));
const AdminAccounts = lazy(() => import('./pages/finance/AdminAccounts'));
const AdminIncome = lazy(() => import('./pages/finance/AdminIncome'));
const AdminExpenses = lazy(() => import('./pages/finance/AdminExpenses'));
const AdminPayments = lazy(() => import('./pages/finance/AdminPayments'));
const AdminBankStatement = lazy(() => import('./pages/finance/AdminBankStatement'));
const AdminSubscriptions = lazy(() => import('./pages/finance/AdminSubscriptions'));
const AdminDepartments = lazy(() => import('./pages/onboarding/AdminDepartments'));
const AdminRoles = lazy(() => import('./pages/onboarding/AdminRoles'));
const AdminEmployees = lazy(() => import('./pages/onboarding/AdminEmployees'));
const AdminEmployeeDetails = lazy(() => import('./pages/onboarding/AdminEmployeeDetails'));
const AdminEmployeeForm = lazy(() => import('./pages/onboarding/AdminEmployeeForm'));
const AdminRelieving = lazy(() => import('./pages/onboarding/AdminRelieving'));
const AdminRelieved = lazy(() => import('./pages/onboarding/AdminRelieved'));
const AdminShifts = lazy(() => import('./pages/attendance/AdminShifts'));
const AdminAttendance = lazy(() => import('./pages/attendance/AdminAttendance'));
const AdminAttendanceAdd = lazy(() => import('./pages/attendance/AdminAttendanceAdd'));
const AdminAttendanceTracker = lazy(() => import('./pages/attendance/AdminAttendanceTracker'));
const AdminAttendanceMonthly = lazy(() => import('./pages/attendance/AdminAttendanceMonthly'));
const AdminAttendanceOverall = lazy(() => import('./pages/attendance/AdminAttendanceOverall'));
const AdminLeaveRequests = lazy(() => import('./pages/leave/AdminLeaveRequests'));
const AdminLeaveOptions = lazy(() => import('./pages/leave/AdminLeaveOptions'));
const AdminLeaveTypes = lazy(() => import('./pages/leave/AdminLeaveTypes'));
const AdminWfh = lazy(() => import('./pages/leave/AdminWfh'));
const AdminRequests = lazy(() => import('./pages/AdminRequests'));
const AdminProjects = lazy(() => import('./pages/projects/AdminProjects'));
const AdminTasks = lazy(() => import('./pages/projects/AdminTasks'));
const AdminClients = lazy(() => import('./pages/clients/AdminClients'));
const AdminInvoices = lazy(() => import('./pages/clients/AdminInvoices'));
const AdminAnnouncements = lazy(() => import('./pages/AdminAnnouncements'));
const AdminPrivileges = lazy(() => import('./pages/AdminPrivileges'));
const AdminAssets = lazy(() => import('./pages/AdminAssets'));
const AdminHolidays = lazy(() => import('./pages/AdminHolidays'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));

/** Admin routes grouped by the privilege that unlocks them. */
const ADMIN_ROUTES = [
  ['dashboard', [['dashboard', AdminDashboard]]],
  [
    'finance',
    [
      ['finance/recurring', AdminRecurring],
      ['finance/payroll', AdminPayroll],
      ['finance/accounts', AdminAccounts],
      ['finance/income', AdminIncome],
      ['finance/expenses', AdminExpenses],
      ['finance/payments', AdminPayments],
      ['finance/bank-statement', AdminBankStatement],
      ['finance/subscriptions', AdminSubscriptions],
    ],
  ],
  [
    'onboarding',
    [
      ['departments', AdminDepartments],
      ['roles', AdminRoles],
      ['employees', AdminEmployees],
      ['employees/new', AdminEmployeeForm],
      ['employees/:id', AdminEmployeeDetails],
      ['employees/:id/edit', AdminEmployeeForm],
      ['relieving', AdminRelieving],
      ['relieved', AdminRelieved],
    ],
  ],
  [
    'attendance',
    [
      ['shifts', AdminShifts],
      ['attendance', AdminAttendance],
      ['attendance-add', AdminAttendanceAdd],
      ['attendance-tracker', AdminAttendanceTracker],
      ['attendance-monthly', AdminAttendanceMonthly],
      ['attendance-overall', AdminAttendanceOverall],
    ],
  ],
  [
    'leave',
    [
      ['leaves', AdminLeaveRequests],
      ['leave-options', AdminLeaveOptions],
      ['leave-types', AdminLeaveTypes],
    ],
  ],
  ['wfh', [['wfh', AdminWfh]]],
  ['requests', [['requests', AdminRequests]]],
  [
    'projects',
    [
      ['projects', AdminProjects],
      ['task-board', TaskBoard],
      ['tasks', AdminTasks],
      ['tasks/:id', TaskDetail],
      ['content-calendar', ContentCalendar],
      ['daily-reports', DailyReportsPage],
    ],
  ],
  [
    'clients',
    [
      ['clients', AdminClients],
      ['invoices', AdminInvoices],
    ],
  ],
  ['announcements', [['announcements', AdminAnnouncements]]],
  ['privileges', [['privileges', AdminPrivileges]]],
  ['assets', [['assets', AdminAssets]]],
  ['holidays', [['holidays', AdminHolidays]]],
  ['settings', [['settings', AdminSettings]]],
];

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader fullScreen />}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/login" replace />} />

            {/* Admin portal */}
            <Route
              path="/admin/login"
              element={
                <GuestRoute>
                  <AdminLogin />
                </GuestRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              {ADMIN_ROUTES.flatMap(([module, routes]) =>
                routes.map(([path, Page]) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <RequireModule module={module}>
                        <Page />
                      </RequireModule>
                    }
                  />
                )),
              )}
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>


            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ToastProvider>
  );
}
