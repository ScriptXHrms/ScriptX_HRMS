import { useMemo } from 'react';
import PortalShell from './PortalShell';
import { ADMIN_PROFILE_LINKS, adminNav, flattenNav } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import { useApi, useLookups } from '../hooks/useApi';

export default function AdminLayout() {
  const { can, session } = useAuth();
  const navItems = useMemo(() => adminNav.filter((item) => can(item.module)), [can]);
  const { employees = [] } = useLookups(can('onboarding') ? 'employees' : null);
  const { data: taskData } = useApi(can('projects') ? '/tasks' : null);
  const homePath = navItems[0]?.path ?? navItems[0]?.children?.[0]?.path ?? '/admin/dashboard';

  const searchItems = useMemo(
    () => [
      ...flattenNav(navItems).map((item) => ({ id: `page-${item.path}`, label: item.label, description: item.group ?? 'Page', to: item.path, group: 'Pages' })),
      ...(taskData?.items ?? []).map((task) => ({
        id: `task-${task._id}`,
        label: task.title,
        description: `${task.taskId} · ${task.project?.client?.company_name ?? ''} · ${task.status}`,
        to: `/admin/tasks/${task._id}`,
        group: 'Tasks',
      })),
      ...employees.map((employee) => ({
        id: `person-${employee._id}`,
        label: employee.name,
        description: employee.employeeId,
        to: `/admin/employees/${employee._id}`,
        group: 'People',
      })),
    ],
    [navItems, taskData, employees],
  );

  const profileLinks = useMemo(() => ADMIN_PROFILE_LINKS.filter((link) => can(link.module)), [can]);

  return (
    <PortalShell
      role="admin"
      portalLabel="Admin Portal"
      roleLabel={session?.isSuperAdmin ? 'Administrator' : 'HR Staff'}
      navItems={navItems}
      homePath={homePath}
      searchItems={searchItems}
      searchPlaceholder="Search tasks, people, pages…"
      profileLinks={profileLinks}
    />
  );
}
