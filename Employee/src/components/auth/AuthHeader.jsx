import { BrandLogo } from '../BrandLogo';

/** Logo, product name, portal label and heading at the top of a login card. */
export default function AuthHeader({ portalLabel, portalIcon: PortalIcon, title, subtitle }) {
  return (
    <div className="text-center">
      <BrandLogo className="mx-auto h-28 w-28 rounded-2xl object-cover sm:h-32 sm:w-32" />
      <p className="text-sm font-bold tracking-wide text-brand-700">ScriptX HRMS</p>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700">
        <PortalIcon size={14} aria-hidden="true" />
        {portalLabel}
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
    </div>
  );
}
