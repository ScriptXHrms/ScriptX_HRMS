import {
  BadgeIndianRupee,
  Boxes,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  FolderKanban,
  House,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  MessageSquareMore,
  Plane,
  Settings,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

/**
 * Role-specific sidebar configuration. `module` is the privilege needed to see
 * an item; `children` renders as a collapsible group.
 */
export const adminNav = [
  { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard, module: 'dashboard' },
  {
    label: 'Finance',
    icon: BadgeIndianRupee,
    module: 'finance',
    children: [
      { label: 'Finance Dashboard', path: '/admin/finance/recurring' },
      { label: 'Payroll', path: '/admin/finance/payroll' },
      { label: 'Accounts', path: '/admin/finance/accounts' },
      { label: 'Income', path: '/admin/finance/income' },
      { label: 'Expenses', path: '/admin/finance/expenses' },
      { label: 'Client Payments', path: '/admin/finance/payments' },
      { label: 'Bank Statement', path: '/admin/finance/bank-statement' },
      { label: 'Subscriptions', path: '/admin/finance/subscriptions' },
    ],
  },
  {
    label: 'On Boarding',
    icon: UsersRound,
    module: 'onboarding',
    children: [
      { label: 'Departments', path: '/admin/departments' },
      { label: 'Roles', path: '/admin/roles' },
      { label: 'Employees', path: '/admin/employees' },
      { label: 'Relieving List', path: '/admin/relieving' },
      { label: 'Relieved List', path: '/admin/relieved' },
    ],
  },
  {
    label: 'Employee',
    icon: CalendarCheck,
    module: 'attendance',
    children: [
      { label: 'Shifts', path: '/admin/shifts' },
      {
        label: 'Attendance',
        path: '/admin/attendance',
        activeFor: ['/admin/attendance-add', '/admin/attendance-tracker', '/admin/attendance-monthly', '/admin/attendance-overall'],
      },
    ],
  },
  {
    label: 'Projects',
    icon: FolderKanban,
    module: 'projects',
    children: [
      { label: 'Project List', path: '/admin/projects' },
      {
        label: 'Tasks',
        path: '/admin/task-board',
        activeFor: ['/admin/tasks'],
      },
      { label: 'Daily Reports', path: '/admin/daily-reports' },
    ],
  },
  {
    label: 'Clients',
    icon: BriefcaseBusiness,
    module: 'clients',
    children: [
      { label: 'Client List', path: '/admin/clients' },
      { label: 'Invoices', path: '/admin/invoices' },
    ],
  },
  {
    label: 'Leaves',
    path: '/admin/leaves',
    icon: Plane,
    module: 'leave',
    activeFor: ['/admin/leave-options', '/admin/leave-types'],
  },
  { label: 'Work From Home', path: '/admin/wfh', icon: House, module: 'wfh' },
  { label: 'Requests', path: '/admin/requests', icon: MessageSquareMore, module: 'requests' },
  { label: 'Content Calendar', path: '/admin/content-calendar', icon: CalendarRange, module: 'projects' },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone, module: 'announcements' },
  { label: 'Privileges', path: '/admin/privileges', icon: ShieldCheck, module: 'privileges' },
  { label: 'Assets', path: '/admin/assets', icon: Boxes, module: 'assets' },
  { label: 'Holidays', path: '/admin/holidays', icon: CalendarDays, module: 'holidays' },
  { label: 'Settings', path: '/admin/settings', icon: Settings, module: 'settings' },
];

export const ADMIN_PROFILE_LINKS = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { label: 'Attendance', to: '/admin/attendance', icon: CalendarCheck, module: 'attendance' },
  { label: 'All Tasks', to: '/admin/tasks', icon: ListChecks, module: 'projects' },
  { label: 'Settings', to: '/admin/settings', icon: Settings, module: 'settings' },
];

/** Leaf items with their group label, for breadcrumbs and search. */
export const flattenNav = (items) =>
  items.flatMap((item) => (item.children ? item.children.map((child) => ({ ...child, group: item.label, icon: item.icon })) : [item]));

export const matchesPath = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

/** Sign-in page of the other portal. It's a separate app, so link to it with a plain <a>. */
export const EMPLOYEE_LOGIN_URL =
  import.meta.env.VITE_EMPLOYEE_URL ??
  (import.meta.env.PROD ? 'https://employeescriptx.web.app/employee/login' : 'http://localhost:5174/employee/login');
