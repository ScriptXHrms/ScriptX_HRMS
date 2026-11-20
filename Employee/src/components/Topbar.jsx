import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LogOut,
  Megaphone,
  Menu,
  Plane,
  TriangleAlert,
} from 'lucide-react';
import Avatar from './Avatar';
import GlobalSearch from './GlobalSearch';
import { useClickOutside } from '../hooks/useClickOutside';
import { dropdownIn, dropdownOut, usePresence } from '../lib/animate';
import { formatDayDate, timeAgo, todayISO } from '../utils/dateUtils';
import { cx } from '../utils/cx';

const NOTIFICATION_ICONS = {
  task: ClipboardList,
  leave: Plane,
  attendance: CalendarCheck,
  alert: TriangleAlert,
  campaign: Megaphone,
  content: CalendarDays,
  announcement: Megaphone,
};

function NotificationMenu({ notifications, onItemClick, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [mounted, panelRef] = usePresence(open, dropdownIn, dropdownOut);
  useClickOutside([ref], () => setOpen(false), open);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="sm:relative">
      <button
        type="button"
        className="icon-btn"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-ink ring-2 ring-canvas">
            {unread}
          </span>
        )}
      </button>
      {mounted && (
          <div
            ref={panelRef}
            className="fixed inset-x-4 top-[76px] z-40 origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-pop sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <p className="text-sm font-bold text-ink">Notifications</p>
                <p className="text-xs text-muted">{unread ? `${unread} unread` : 'You’re all caught up'}</p>
              </div>
              <button
                type="button"
                onClick={onMarkAllRead}
                disabled={unread === 0}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent"
              >
                <CheckCheck size={14} aria-hidden="true" />
                Mark all as read
              </button>
            </div>
            <ul className="scroll-thin max-h-[min(24rem,60vh)] divide-y divide-line overflow-y-auto">
              {notifications.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</li>}
              {notifications.map((n) => {
                const Icon = NOTIFICATION_ICONS[n.type] ?? Bell;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onItemClick(n);
                      }}
                      className={cx(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas',
                        !n.read && 'bg-brand-50/50',
                      )}
                    >
                      <span
                        className={cx(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          n.type === 'alert' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700',
                        )}
                      >
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-ink">{n.title}</span>
                          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400" aria-label="Unread" />}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted">{n.message}</span>
                        <span className="mt-1 block text-[11px] font-medium text-muted/80">{timeAgo(n.minutesAgo)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
      )}
    </div>
  );
}

function ProfileMenu({ user, roleLabel, links, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [mounted, panelRef] = usePresence(open, dropdownIn, dropdownOut);
  useClickOutside([ref], () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="flex items-center gap-2 rounded-xl p-1 pr-1.5 transition-colors hover:bg-brand-50 sm:pr-2.5"
      >
        <Avatar name={user.name} photo={user.photo} size="sm" />
        <span className="hidden min-w-0 text-left md:block">
          <span className="block max-w-[140px] truncate text-sm leading-tight font-semibold text-ink">{user.name}</span>
          <span className="block text-xs leading-tight text-muted">{roleLabel}</span>
        </span>
        <ChevronDown size={16} className={cx('hidden text-muted transition-transform sm:block', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {mounted && (
          <div
            ref={panelRef}
            className="absolute top-full right-0 z-40 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-pop"
          >
            <div className="flex items-center gap-3 border-b border-line p-4">
              <Avatar name={user.name} photo={user.photo} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{user.fullName ?? user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
                <p className="mt-1 inline-flex rounded-md bg-gold-50 px-1.5 py-0.5 text-[11px] font-semibold text-gold-700 ring-1 ring-gold-200 ring-inset">
                  {roleLabel}
                </p>
              </div>
            </div>
            <ul className="p-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Icon size={17} className="text-muted" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line p-1.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={17} aria-hidden="true" />
                Log out
              </button>
            </div>
          </div>
      )}
    </div>
  );
}

/**
 * Sticky top bar: mobile menu toggle, page title + breadcrumb, search,
 * date, notifications and the account menu.
 */
export default function Topbar({
  title,
  breadcrumbs,
  onMenuClick,
  searchItems,
  searchPlaceholder,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  user,
  roleLabel,
  profileLinks,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="flex h-[72px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <button type="button" className="icon-btn -ml-1 lg:hidden" onClick={onMenuClick} aria-label="Open navigation menu">
          <Menu size={22} aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol className="flex items-center gap-1 text-xs text-muted">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight size={12} aria-hidden="true" />}
                  {crumb.to ? (
                    <Link to={crumb.to} className="transition-colors hover:text-brand-700">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-medium text-ink/80">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="truncate text-lg leading-tight font-bold text-ink sm:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <GlobalSearch items={searchItems} placeholder={searchPlaceholder} />
          <p className="hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium whitespace-nowrap text-muted xl:flex">
            <CalendarDays size={16} className="text-brand-700" aria-hidden="true" />
            <time dateTime={todayISO()}>{formatDayDate(new Date())}</time>
          </p>
          <NotificationMenu notifications={notifications} onItemClick={onNotificationClick} onMarkAllRead={onMarkAllRead} />
          <ProfileMenu user={user} roleLabel={roleLabel} links={profileLinks} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
