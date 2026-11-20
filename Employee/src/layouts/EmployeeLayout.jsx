import { useMemo } from 'react';
import PortalShell from './PortalShell';
import { EMPLOYEE_PROFILE_LINKS, employeeNav } from '../config/navigation';
import { useApi } from '../hooks/useApi';

export default function EmployeeLayout() {
  const { data } = useApi('/tasks');

  const searchItems = useMemo(
    () => [
      ...employeeNav.map((item) => ({ id: `page-${item.path}`, label: item.label, description: 'Page', to: item.path, group: 'Pages' })),
      ...(data?.items ?? []).map((task) => ({
        id: `task-${task._id}`,
        label: task.title,
        description: `${task.taskId} · ${task.status}`,
        to: `/employee/tasks/${task._id}`,
        group: 'Tasks',
      })),
    ],
    [data],
  );

  return (
    <PortalShell
      role="employee"
      portalLabel="Employee Portal"
      roleLabel="Employee"
      navItems={employeeNav}
      homePath="/employee/dashboard"
      searchItems={searchItems}
      searchPlaceholder="Search my tasks, pages…"
      profileLinks={EMPLOYEE_PROFILE_LINKS}
    />
  );
}
