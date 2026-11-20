/** Admin portal areas that can be delegated to HR staff from the Privileges page. */
export const MODULES = [
  { key: 'dashboard', label: 'Overview' },
  { key: 'finance', label: 'Finance' },
  { key: 'onboarding', label: 'On Boarding' },
  { key: 'attendance', label: 'Attendance & Shifts' },
  { key: 'leave', label: 'Leave' },
  { key: 'wfh', label: 'Work From Home' },
  { key: 'requests', label: 'Requests' },
  { key: 'projects', label: 'Projects & Tasks' },
  { key: 'clients', label: 'Clients & Invoices' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'privileges', label: 'Privileges' },
  { key: 'assets', label: 'Assets' },
  { key: 'holidays', label: 'Holidays' },
  { key: 'settings', label: 'Settings' },
];

export const MODULE_KEYS = MODULES.map((m) => m.key);
