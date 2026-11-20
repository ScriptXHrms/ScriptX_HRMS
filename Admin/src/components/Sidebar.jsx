import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { BrandMark } from './BrandLogo';
import Avatar from './Avatar';
import { matchesPath } from '../config/navigation';
import { prefersReducedMotion, tweenFrom, tweenTo, usePresence } from '../lib/animate';
import { cx } from '../utils/cx';

export const SIDEBAR_WIDTH = { expanded: 272, collapsed: 84 };

function ActiveBackdrop({ showBar = true }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const tween = tweenFrom(ref.current, { autoAlpha: 0, scaleX: 0.94 }, { autoAlpha: 1, scaleX: 1, duration: 0.22, ease: 'power2.out' });
    return () => tween.kill();
  }, []);
  return (
    <span ref={ref} className="absolute inset-0 origin-left rounded-xl bg-brand-700 shadow-sm">
      {showBar && <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold-400" />}
    </span>
  );
}

function NavItem({ item, collapsed }) {
  const Icon = item.icon;
  const location = useLocation();
  const alsoActive = item.activeFor?.some((path) => matchesPath(location.pathname, path)) ?? false;
  return (
    <li>
      <NavLink
        to={item.path}
        title={collapsed ? item.label : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cx(
            'group relative flex min-h-[44px] items-center gap-3 rounded-xl text-sm font-medium transition-colors',
            collapsed ? 'justify-center px-0' : 'px-3',
            isActive || alsoActive ? 'text-white' : 'text-muted hover:bg-brand-50 hover:text-brand-700',
          )
        }
      >
        {({ isActive }) => (
          <>
            {(isActive || alsoActive) && <ActiveBackdrop />}
            <Icon size={19} className="relative z-10 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="relative z-10 flex-1 truncate">{item.label}</span>}
          </>
        )}
      </NavLink>
    </li>
  );
}

function NavGroup({ item, collapsed, open, onToggle, onExpandSidebar }) {
  const Icon = item.icon;
  const location = useLocation();
  const panelRef = useRef(null);
  const first = useRef(true);
  const containsActive = item.children.some((child) => matchesPath(location.pathname, child.path) || child.activeFor?.some((p) => matchesPath(location.pathname, p)));

  // Height tween for opening and closing; the first render just snaps into place.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;
    if (first.current) {
      first.current = false;
      panel.style.height = open ? 'auto' : '0px';
      return undefined;
    }
    if (prefersReducedMotion()) {
      panel.style.height = open ? 'auto' : '0px';
      return undefined;
    }
    const tween = open
      ? tweenFrom(panel, { height: 0 }, { height: 'auto', duration: 0.24, ease: 'power2.out', clearProps: 'none' })
      : tweenTo(panel, { height: 0, duration: 0.2, ease: 'power2.in' });
    return () => tween.kill();
  }, [open]);

  return (
    <li>
      <button
        type="button"
        title={collapsed ? item.label : undefined}
        aria-label={collapsed ? item.label : undefined}
        aria-expanded={collapsed ? undefined : open}
        onClick={() => (collapsed ? onExpandSidebar(item.label) : onToggle(item.label))}
        className={cx(
          'relative flex min-h-[44px] w-full items-center gap-3 rounded-xl text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-0' : 'px-3',
          containsActive ? 'text-brand-700' : 'text-muted hover:bg-brand-50 hover:text-brand-700',
          containsActive && collapsed && 'bg-brand-50',
        )}
      >
        <Icon size={19} className="relative z-10 shrink-0" aria-hidden="true" />
        {!collapsed && (
          <>
            <span className="relative z-10 flex-1 truncate text-left">{item.label}</span>
            <ChevronDown size={16} className={cx('transition-transform', open && 'rotate-180')} aria-hidden="true" />
          </>
        )}
      </button>
      {!collapsed && (
        <div ref={panelRef} className="overflow-hidden">
          <ul className="mt-1 ml-[21px] space-y-0.5 border-l border-line pl-2.5">
            {item.children.map((child) => (
              <li key={child.path}>
                <NavLink
                  to={child.path}
                  tabIndex={open ? undefined : -1}
                  className={({ isActive }) => {
                    const isAlsoActive = child.activeFor?.some((p) => matchesPath(location.pathname, p)) ?? false;
                    return cx(
                      'relative flex min-h-[38px] items-center rounded-lg px-3 text-[13px] font-medium transition-colors',
                      isActive || isAlsoActive ? 'text-white' : 'text-muted hover:bg-brand-50 hover:text-brand-700',
                    );
                  }}
                >
                  {({ isActive }) => {
                    const isAlsoActive = child.activeFor?.some((p) => matchesPath(location.pathname, p)) ?? false;
                    return (
                      <>
                        {(isActive || isAlsoActive) && <ActiveBackdrop showBar={false} />}
                        <span className="relative z-10 truncate">{child.label}</span>
                      </>
                    );
                  }}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function SidebarContent({ items, collapsed, portalLabel, user, onLogout, onToggleCollapse, onClose, variant, closeButtonRef }) {
  const location = useLocation();
  const activeGroup = items.find((item) => item.children?.some((child) => matchesPath(location.pathname, child.path)))?.label ?? null;
  const [openGroup, setOpenGroup] = useState(activeGroup);

  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  const visible = items.filter((item) => !item.hidden);

  const expandSidebar = (label) => {
    setOpenGroup(label);
    onToggleCollapse();
  };

  return (
    <div className="flex h-full flex-col">
      <div className={cx('flex h-[72px] shrink-0 items-center gap-3 border-b border-line', collapsed ? 'justify-center px-2' : 'px-4')}>
        <BrandMark size={42} alt="ScriptX logo" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] leading-tight font-extrabold tracking-tight text-brand-700">
              ScriptX <span className="text-ink">HRMS</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              {portalLabel}
            </p>
          </div>
        )}
        {variant === 'mobile' && (
          <button ref={closeButtonRef} type="button" onClick={onClose} className="icon-btn" aria-label="Close navigation menu">
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav aria-label={`${portalLabel} navigation`} className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted uppercase">Menu</p>}
        <ul className="space-y-1">
          {visible.map((item) =>
            item.children ? (
              <NavGroup
                key={item.label}
                item={item}
                collapsed={collapsed}
                open={openGroup === item.label}
                onToggle={(label) => setOpenGroup((current) => (current === label ? null : label))}
                onExpandSidebar={expandSidebar}
              />
            ) : (
              <NavItem key={item.path} item={item} collapsed={collapsed} />
            ),
          )}
        </ul>
      </nav>

      <div className="shrink-0 space-y-1 border-t border-line p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-canvas p-2.5">
            <Avatar name={user.name} photo={user.photo} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.designation}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
          aria-label="Log out"
          className={cx(
            'flex min-h-[44px] w-full items-center gap-3 rounded-xl text-sm font-semibold text-red-600 transition-colors hover:bg-red-50',
            collapsed ? 'justify-center' : 'px-3',
          )}
        >
          <LogOut size={19} aria-hidden="true" />
          {!collapsed && 'Log out'}
        </button>
        {variant === 'desktop' && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : undefined}
            className={cx(
              'flex min-h-[44px] w-full items-center gap-3 rounded-xl text-sm font-medium text-muted transition-colors hover:bg-brand-50 hover:text-brand-700',
              collapsed ? 'justify-center' : 'px-3',
            )}
          >
            {collapsed ? <PanelLeftOpen size={19} aria-hidden="true" /> : <PanelLeftClose size={19} aria-hidden="true" />}
            {!collapsed && 'Collapse'}
          </button>
        )}
      </div>
    </div>
  );
}

const overlayIn = (el) => tweenFrom(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 });
const overlayOut = (el, onComplete) => tweenTo(el, { autoAlpha: 0, duration: 0.16, onComplete });
const drawerIn = (el) => tweenFrom(el, { xPercent: -100 }, { xPercent: 0, duration: 0.3, ease: 'power3.out' });
const drawerOut = (el, onComplete) => tweenTo(el, { xPercent: -100, duration: 0.2, ease: 'power2.in', onComplete });

/**
 * Role-aware sidebar: fixed + collapsible on desktop (lg+), slide-in drawer on
 * smaller screens. Navigation items come from config/navigation.js.
 */
export default function Sidebar({ items, portalLabel, user, collapsed, onToggleCollapse, mobileOpen, onMobileClose, onLogout }) {
  const closeButtonRef = useRef(null);
  const asideRef = useRef(null);
  const [overlayMounted, overlayRef] = usePresence(mobileOpen, overlayIn, overlayOut);
  const [drawerMounted, drawerRef] = usePresence(mobileOpen, drawerIn, drawerOut);

  useLayoutEffect(() => {
    const tween = tweenTo(asideRef.current, { width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded, duration: 0.3, ease: 'power3.out' });
    return () => tween.kill();
  }, [collapsed]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onMobileClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(frame);
    };
  }, [mobileOpen, onMobileClose]);

  const shared = { items, portalLabel, user, onLogout };

  return (
    <>
      <aside
        ref={asideRef}
        style={{ width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }}
        className="fixed inset-y-0 left-0 z-30 hidden overflow-hidden border-r border-line bg-white lg:block"
      >
        <SidebarContent {...shared} collapsed={collapsed} onToggleCollapse={onToggleCollapse} variant="desktop" />
      </aside>

      {overlayMounted && (
        <div ref={overlayRef} className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] lg:hidden" onClick={onMobileClose} aria-hidden="true" />
      )}
      {drawerMounted && (
        <aside
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-y-0 left-0 z-50 w-[288px] max-w-[85vw] bg-white shadow-pop lg:hidden"
        >
          <SidebarContent {...shared} collapsed={false} onClose={onMobileClose} variant="mobile" closeButtonRef={closeButtonRef} />
        </aside>
      )}
    </>
  );
}
