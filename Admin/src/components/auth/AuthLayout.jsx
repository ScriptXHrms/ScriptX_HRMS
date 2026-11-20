import { BrandMark } from '../BrandLogo';
import { DeskWorkIllustration } from '../Illustrations';
import { useFadeIn } from '../../lib/animate';

/**
 * Split-screen auth layout: a purple brand panel with an employee at work (desktop only)
 * and the sign-in card.
 */
export default function AuthLayout({ portal, children }) {
  const panelRef = useFadeIn(portal);
  const cardRef = useFadeIn(portal);
  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="relative hidden w-[44%] max-w-[640px] flex-col overflow-hidden bg-brand-700 p-10 text-white lg:flex xl:p-14">
        <div className="hex-pattern absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-brand-600/60 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <BrandMark size={48} className="ring-white/20" />
          <div>
            <p className="text-lg leading-tight font-extrabold tracking-tight">ScriptX HRMS</p>
            <p className="text-sm text-brand-200">{portal === 'admin' ? 'Admin Portal' : 'Employee Portal'}</p>
          </div>
        </div>

        <div ref={panelRef} className="relative flex flex-1 items-center justify-center py-8">
          <DeskWorkIllustration className="h-auto w-full max-w-[520px]" />
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div ref={cardRef} className="w-full max-w-[440px]">
          <div className="card p-6 sm:p-8">{children}</div>
          <p className="mt-6 text-center text-xs text-muted">© {new Date().getFullYear()} ScriptX Private Limited</p>
        </div>
      </main>
    </div>
  );
}
