import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PageLoader from '../components/PageLoader';
import { api } from '../api/client';
import { flattenNav, matchesPath } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { useFadeIn } from '../lib/animate';
import { readJSON, writeJSON, STORAGE_PREFIX } from '../utils/storage';
import { cx } from '../utils/cx';

const COLLAPSE_KEY = `${STORAGE_PREFIX}.ui.sidebarCollapsed`;
const NOTIFICATION_REFRESH_MS = 60000;

/**
 * Shared chrome for both portals (sidebar + topbar + animated page outlet).
 * AdminLayout and EmployeeLayout pass their own navigation, search index and
 * profile links.
 */
export default function PortalShell({ role, portalLabel, roleLabel, navItems, homePath, searchItems, searchPlaceholder, profileLinks }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => readJSON(COLLAPSE_KEY, false, { validate: (v) => typeof v === 'boolean' }));
  const [mobileOpen, setMobileOpen] = useState(false);
  const outletRef = useFadeIn(location.pathname);
  const { data: inbox, reload: reloadInbox, setData: setInbox } = useApi('/notifications');

  useEffect(() => {
    const id = setInterval(reloadInbox, NOTIFICATION_REFRESH_MS);
    return () => clearInterval(id);
  }, [reloadInbox]);

  useEffect(() => {
    writeJSON(COLLAPSE_KEY, collapsed);
  }, [collapsed]);

  // Close the mobile drawer and reset scroll on navigation.
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleLogout = useCallback(async () => {
    await logout();
    toast.info('Signed out', `You have been signed out of the ${portalLabel}.`);
    navigate(`/${role}/login`, { replace: true });
  }, [logout, toast, portalLabel, navigate, role]);

  const notifications = useMemo(
    () =>
      (inbox?.items ?? []).map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        minutesAgo: Math.max(0, Math.round((Date.now() - new Date(n.createdAt)) / 60000)),
      })),
    [inbox],
  );

  const handleNotificationClick = (notification) => {
    setInbox((prev) => ({ ...prev, items: prev.items.map((n) => (n._id === notification.id ? { ...n, read: true } : n)) }));
    api.put(`/notifications/${notification.id}/read`).catch(() => {});
    if (notification.link) navigate(notification.link);
  };

  const markAllRead = async () => {
    setInbox((prev) => ({ ...prev, items: prev.items.map((n) => ({ ...n, read: true })) }));
    await api.post('/notifications/read-all').catch(() => {});
    toast.success('All caught up', 'All notifications are marked as read.');
  };

  const leaves = flattenNav(navItems);
  const current = leaves.find((item) => matchesPath(location.pathname, item.path)) ?? leaves[0];
  const breadcrumbs =
    current.path === homePath
      ? [{ label: portalLabel }, { label: current.label }]
      : [{ label: portalLabel, to: homePath }, ...(current.group ? [{ label: current.group }] : []), { label: current.label }];

  if (!user) return null;

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-pop"
      >
        Skip to content
      </a>

      <Sidebar
        items={navItems}
        portalLabel={portalLabel}
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        onLogout={handleLogout}
      />

      <div className={cx('flex min-h-dvh flex-col transition-[padding] duration-300', collapsed ? 'lg:pl-[84px]' : 'lg:pl-[272px]')}>
        <Topbar
          title={current.label}
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setMobileOpen(true)}
          searchItems={searchItems}
          searchPlaceholder={searchPlaceholder}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={markAllRead}
          user={user}
          roleLabel={roleLabel}
          profileLinks={profileLinks}
          onLogout={handleLogout}
        />

        <main id="main-content" className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div ref={outletRef}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        <footer className="px-4 pb-6 text-center text-xs text-muted sm:px-6 lg:px-8">
          © {new Date().getFullYear()} ScriptX Private Limited
        </footer>
      </div>
    </div>
  );
}
