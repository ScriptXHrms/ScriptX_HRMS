import {
  BookOpenText,
  CalendarCheck,
  CalendarRange,
  CircleUserRound,
  ClipboardList,
  FileClock,
  House,
  KanbanSquare,
  LayoutDashboard,
  MessageSquareMore,
  Plane,
  UserCog,
} from 'lucide-react';

export const employeeNav = [
  { label: 'My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
  { label: 'Attendance', path: '/employee/attendance', icon: CalendarCheck, activeFor: ['/employee/attendance-monthly'] },
  // Opened from the Attendance page; listed for the top bar title and search, not the sidebar.
  { label: 'Monthly Attendance', path: '/employee/attendance-monthly', icon: FileClock, hidden: true },
  { label: 'Daily Reports', path: '/employee/daily-reports', icon: ClipboardList },
  { label: 'Leaves', path: '/employee/leaves', icon: Plane },
  { label: 'Work From Home', path: '/employee/wfh', icon: House },
  { label: 'Tasks', path: '/employee/tasks', icon: KanbanSquare },
  { label: 'Content Calendar', path: '/employee/content-calendar', icon: CalendarRange },
  { label: 'Requests', path: '/employee/requests', icon: MessageSquareMore },
  { label: 'Company Policy', path: '/employee/policy', icon: BookOpenText },
  { label: 'My Profile', path: '/employee/profile', icon: CircleUserRound },
];

export const EMPLOYEE_PROFILE_LINKS = [
  { label: 'My Profile', to: '/employee/profile', icon: CircleUserRound },
  { label: 'Tasks', to: '/employee/tasks', icon: KanbanSquare },
  { label: 'Leaves', to: '/employee/leaves', icon: UserCog },
];

/** Leaf items with their group label, for breadcrumbs and search. */
export const flattenNav = (items) =>
  items.flatMap((item) => (item.children ? item.children.map((child) => ({ ...child, group: item.label, icon: item.icon })) : [item]));

export const matchesPath = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

/** Sign-in page of the other portal. It's a separate app, so link to it with a plain <a>. */
export const ADMIN_LOGIN_URL = import.meta.env.VITE_ADMIN_URL ?? '/admin/login';
