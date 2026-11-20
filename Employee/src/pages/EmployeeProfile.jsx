import { useId, useState } from 'react';
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Cake,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  HeartPulse,
  Hourglass,
  Landmark,
  Link2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';
import { getInitials } from '../components/Avatar';
import { BrandMark } from '../components/BrandLogo';
import EmptyState from '../components/EmptyState';
import PageLoader from '../components/PageLoader';
import StatusBadge from '../components/StatusBadge';
import { fileUrl } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { useRiseIn } from '../lib/animate';
import { cx } from '../utils/cx';
import { diffInDays, formatDate, formatShortDate, formatTime, todayISO } from '../utils/dateUtils';
import { monthLabel } from '../utils/format';

/* ---------- helpers ---------- */

const has = (value) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0);

function tenureLabel(joined) {
  const today = todayISO();
  const days = joined ? diffInDays(joined, today) : -1;
  if (days < 0) return '—';
  if (days < 31) return `${days} day${days === 1 ? '' : 's'}`;
  const [y1, m1, d1] = joined.split('-').map(Number);
  const [y2, m2, d2] = today.split('-').map(Number);
  const months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years} yr${years > 1 ? 's' : ''}`, rest && `${rest} mo`].filter(Boolean).join(' ') || `${days} days`;
}

function nextBirthday(dob) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob ?? '')) return null;
  const today = todayISO();
  const on = (year) => {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return `${year}-${dob.slice(5) === '02-29' && !leap ? '02-28' : dob.slice(5)}`;
  };
  const year = Number(today.slice(0, 4));
  const next = on(year) >= today ? on(year) : on(year + 1);
  return { days: diffInDays(today, next), date: next };
}

/** "••••••1234": enough to recognise the number, not enough to read it over a shoulder. */
function mask(value, keep = 4) {
  const text = String(value).replace(/\s+/g, '');
  return text.length <= keep ? text : `${'•'.repeat(Math.min(8, text.length - keep))}${text.slice(-keep)}`;
}

/** Experience dates are free text: "2024-03-01", "2024-03" or anything else. */
function looseDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return formatDate(value);
  if (/^\d{4}-\d{2}$/.test(value ?? '')) return monthLabel(value);
  return value ?? '';
}

/* ---------- small pieces ---------- */

function Portrait({ employee, className }) {
  return employee.photo ? (
    <img src={fileUrl(employee.photo)} alt="" className={cx('rounded-full object-cover', className)} />
  ) : (
    <span className={cx('flex items-center justify-center rounded-full bg-gold-100 font-extrabold text-brand-800 select-none', className)} aria-hidden="true">
      {getInitials(employee.name)}
    </span>
  );
}

function CopyButton({ value, label, tone = 'light' }) {
  const toast = useToast();
  if (!has(value)) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success('Copied', String(value));
    } catch {
      toast.error('Couldn’t copy', 'Select the text and copy it instead.');
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className={cx(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
        tone === 'dark' ? 'text-brand-200 hover:bg-white/10 hover:text-white' : 'text-muted hover:bg-brand-50 hover:text-brand-700',
      )}
    >
      <Copy size={14} aria-hidden="true" />
    </button>
  );
}

function Panel({ icon: Icon, title, action, index, className, children }) {
  const ref = useRiseIn(index);
  const id = useId();
  return (
    <section ref={ref} aria-labelledby={id} className={cx('card p-5 sm:p-6', className)}>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Icon size={18} aria-hidden="true" />
        </span>
        <h2 id={id} className="text-base font-bold text-ink">
          {title}
        </h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}

/** Label over value, with a thin brand rule on the left. */
function Fields({ items }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.filter(Boolean).map(({ label, value, action, wide }) => (
        <div key={label} className={cx('min-w-0 border-l-2 border-brand-100 pl-3', wide && 'sm:col-span-2')}>
          <dt className="text-[11px] font-semibold tracking-wider text-muted uppercase">{label}</dt>
          <dd className="mt-0.5 flex min-w-0 items-center gap-1 text-sm font-semibold break-words text-ink">
            <span className="min-w-0">{has(value) ? value : '—'}</span>
            {action}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function HeroTile({ icon: Icon, label, value, note, action }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur-sm">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-brand-200 uppercase">
        <Icon size={13} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 flex min-w-0 items-center gap-1 text-sm font-bold text-white">
        <span className="truncate">{value}</span>
        {action}
      </p>
      {note && <p className="mt-0.5 truncate text-xs text-brand-200">{note}</p>}
    </div>
  );
}

/** Decorative bars drawn from the employee ID, so every card looks its own. Not a scannable code. */
function IdStripes({ text }) {
  const widths = [...text].flatMap((ch) => {
    const code = ch.charCodeAt(0);
    return [1 + (code % 3), 1 + ((code >> 2) % 2), 2 + ((code >> 1) % 2), 1];
  });
  return (
    <div className="flex h-9 items-stretch justify-center" aria-hidden="true">
      {widths.map((width, i) => (
        <span key={i} className={i % 2 ? '' : 'bg-ink'} style={{ width }} />
      ))}
    </div>
  );
}

/* ---------- sections ---------- */

function Hero({ employee }) {
  const ref = useRiseIn(0);
  const birthday = nextBirthday(employee.dateOfBirth);
  const leaving = employee.status !== 'Active' && employee.relieving?.lastWorkingDate;
  return (
    <section ref={ref} className="relative overflow-hidden rounded-3xl bg-brand-700 text-white shadow-card" aria-label="Profile summary">
      <div className="hex-pattern absolute inset-0" aria-hidden="true" />
      <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-brand-500/40 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gold-400 via-gold-300 to-transparent" aria-hidden="true" />
      <div className="relative grid gap-6 p-6 sm:p-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Portrait employee={employee} className="h-24 w-24 shrink-0 text-3xl ring-4 ring-gold-400 ring-offset-4 ring-offset-brand-700 sm:h-28 sm:w-28 sm:text-4xl" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.25em] text-gold-300 uppercase">ScriptX team member</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight break-words sm:text-4xl">{employee.name}</h2>
            <p className="mt-1 text-sm text-brand-100 sm:text-base">{[employee.role?.name, employee.department?.name].filter(Boolean).join(' · ') || '—'}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-gold-400 py-0.5 pr-1 pl-2.5 text-xs font-extrabold tracking-wide text-brand-900">
                {employee.employeeId}
                <CopyButton value={employee.employeeId} label="employee ID" />
              </span>
              <StatusBadge value={employee.status} />
              {/* <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/15">{employee.employeeType}</span>
              {employee.experienceLevel && <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/15">{employee.experienceLevel}</span>} */}
            </div>
            {leaving && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gold-400/15 px-3 py-1.5 text-xs font-semibold text-gold-200 ring-1 ring-gold-300/30">
                <Hourglass size={13} aria-hidden="true" />
                Last working day: {formatDate(employee.relieving.lastWorkingDate)}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <HeroTile icon={Sparkles} label="With ScriptX" value={tenureLabel(employee.dateOfJoining)} note={employee.dateOfJoining ? `Since ${formatDate(employee.dateOfJoining)}` : undefined} />
          <HeroTile
            icon={Clock3}
            label="Shift"
            value={employee.shift?.name ?? 'Not assigned'}
            note={employee.shift ? `${formatTime(employee.shift.from)} – ${formatTime(employee.shift.to)}` : undefined}
          />
          <HeroTile
            icon={Cake}
            label="Birthday"
            value={birthday ? (birthday.days === 0 ? 'Today!' : `In ${birthday.days} day${birthday.days === 1 ? '' : 's'}`) : '—'}
            note={birthday ? formatShortDate(birthday.date) : undefined}
          />
          <HeroTile icon={Mail} label="Work email" value={employee.email} action={<CopyButton value={employee.email} label="work email" tone="dark" />} />
        </div>
      </div>
    </section>
  );
}

function CardHeader({ subtitle, compact }) {
  return (
    <div className={cx('relative bg-brand-700 px-5 pt-8 text-white', compact ? 'pb-5' : 'pb-14')}>
      <div className="hex-pattern absolute inset-0" aria-hidden="true" />
      <span className="absolute top-3 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-brand-900/60 ring-1 ring-white/20" aria-hidden="true" />
      <div className="relative flex items-center gap-2.5">
        <BrandMark size={34} />
        <div className="leading-tight">
          <p className="text-sm font-extrabold">
            ScriptX <span className="text-gold-300">HRMS</span>
          </p>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-brand-200 uppercase">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function BackRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon size={14} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-wider text-muted uppercase">{label}</p>
        <div className="text-xs font-semibold break-words text-ink">{children}</div>
      </div>
    </div>
  );
}

/**
 * The ID card turns over on hover; the button does the same for touch and keyboard.
 * Front: who you are. Back: how to reach you, who to call, and where to return the card.
 */
function IdCardPanel({ employee, company }) {
  const ref = useRiseIn(1);
  const [flipped, setFlipped] = useState(false);
  const contacts = (employee.emergencyContacts ?? []).slice(0, 2);
  const reach = [company?.companyPhone, company?.companyEmail, company?.companyWebsite].filter(Boolean);
  const face = 'flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-pop ring-1 ring-line [grid-area:1/1] [backface-visibility:hidden]';

  return (
    <section ref={ref} aria-label="Employee ID card" className="mx-auto w-full max-w-[340px]">
      <div className="group [perspective:1400px]">
        <div
          data-flip-card
          className={cx(
            'grid transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none group-hover:[transform:rotateY(180deg)]',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          <div className={face} data-face="front">
            <CardHeader subtitle="Employee ID" />
            <div className="relative z-10 -mt-11 flex justify-center">
              <Portrait employee={employee} className="h-24 w-24 text-3xl ring-4 ring-white" />
            </div>
            <div className="flex flex-1 flex-col px-5 pt-3 pb-5 text-center">
              <p className="text-lg font-extrabold text-ink">{employee.name}</p>
              <p className="text-sm font-semibold text-brand-700">{employee.role?.name ?? '—'}</p>
              <p className="text-xs text-muted">{employee.department?.name ?? ''}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-left">
                {[
                  ['ID', employee.employeeId],
                  ['Joined', formatDate(employee.dateOfJoining)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-canvas px-3 py-2">
                    <dt className="text-[10px] font-semibold tracking-wider text-muted uppercase">{label}</dt>
                    <dd className="text-sm font-bold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto pt-4">
                <IdStripes text={employee.employeeId} />
                <p className="mt-1 font-mono text-[11px] tracking-[0.3em] text-muted">{employee.employeeId}</p>
              </div>
            </div>
          </div>

          <div className={cx(face, '[transform:rotateY(180deg)]')} data-face="back">
            <CardHeader subtitle="Contact card" compact />
            <div className="flex-1 space-y-3.5 px-5 py-4">
              <BackRow icon={MapPin} label="Address">
                {employee.address ? (
                  <>
                    <span className="line-clamp-3 whitespace-pre-line">{employee.address}</span>
                    {employee.pincode && <span className="text-brand-700">PIN {employee.pincode}</span>}
                  </>
                ) : (
                  '—'
                )}
              </BackRow>
              <BackRow icon={Phone} label="Phone">
                {employee.phone || '—'}
              </BackRow>
              <BackRow icon={HeartPulse} label="In an emergency, call">
                {contacts.length === 0 ? (
                  '—'
                ) : (
                  <ul className="space-y-1">
                    {contacts.map((contact) => (
                      <li key={contact._id ?? contact.contact} className="flex items-baseline justify-between gap-2">
                        <span className="min-w-0 truncate">
                          {contact.fullName}
                          {contact.relation && <span className="font-medium text-muted"> · {contact.relation}</span>}
                        </span>
                        <span className="shrink-0 text-green-700 tabular-nums">{contact.contact}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </BackRow>
            </div>
            <div className="border-t border-dashed border-line bg-brand-50/60 px-5 py-4">
              <p className="text-[10px] font-semibold tracking-wider text-muted uppercase">If found, please return to</p>
              <p className="mt-0.5 text-sm font-extrabold text-brand-800">{company?.companyName || 'ScriptX'}</p>
              {company?.companyAddress && <p className="mt-0.5 line-clamp-3 text-xs whitespace-pre-line text-ink">{company.companyAddress}</p>}
              {reach.length > 0 && <p className="mt-1 text-xs font-semibold break-words text-brand-700">{reach.join(' · ')}</p>}
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
      >
        <RefreshCw size={13} aria-hidden="true" />
        {flipped ? 'Show front' : 'Flip card'}
      </button>
    </section>
  );
}

const CHECKS = [
  ['Photo', (e) => e.photo],
  ['Phone', (e) => e.phone],
  ['Personal email', (e) => e.personalEmail],
  ['Date of birth', (e) => e.dateOfBirth],
  ['Address', (e) => e.address],
  ['Emergency contact', (e) => e.emergencyContacts?.length],
  ['Bank account', (e) => e.bank?.accountNo],
  ['PAN', (e) => e.panNo],
  ['Skills', (e) => e.skills?.length],
  ['LinkedIn', (e) => e.linkedIn],
];
const RING = 2 * Math.PI * 34;

function CompletenessPanel({ employee, index }) {
  const missing = CHECKS.filter(([, test]) => !test(employee)).map(([label]) => label);
  const percent = Math.round(((CHECKS.length - missing.length) / CHECKS.length) * 100);
  return (
    <Panel icon={BadgeCheck} title="Profile strength" index={index}>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden="true">
            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" className="stroke-brand-50" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cx('transition-[stroke-dashoffset] duration-700', percent === 100 ? 'stroke-green-600' : 'stroke-brand-700')}
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - percent / 100)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-ink tabular-nums">{percent}%</span>
        </div>
        <div className="min-w-0 text-sm">
          {missing.length === 0 ? (
            <p className="font-semibold text-green-700">Everything HR needs is on record.</p>
          ) : (
            <>
              <p className="font-semibold text-ink">Ask HR to add:</p>
              <p className="mt-1 text-muted">{missing.join(', ')}</p>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

function EmergencyPanel({ contacts, index }) {
  return (
    <Panel icon={HeartPulse} title="Emergency contacts" index={index}>
      {contacts.length === 0 ? (
        <p className="text-sm text-muted">No contacts on record.</p>
      ) : (
        <ul className="space-y-3">
          {contacts.map((contact) => (
            <li key={contact._id ?? contact.contact} className="flex items-center gap-3 rounded-2xl border border-line p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700" aria-hidden="true">
                {getInitials(contact.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{contact.fullName || '—'}</p>
                <p className="text-xs text-muted">{contact.relation || 'Contact'}</p>
              </div>
              {contact.contact && (
                <a href={`tel:${contact.contact}`} className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700 transition-colors hover:bg-green-100">
                  <Phone size={13} aria-hidden="true" />
                  {contact.contact}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function BankPanel({ employee, index }) {
  const [revealed, setRevealed] = useState(false);
  const rows = [
    ['Bank', employee.bank?.bankName],
    ['Account number', employee.bank?.accountNo, true],
    ['Branch', employee.bank?.branch],
    ['IFSC', employee.bank?.ifscCode],
    ['GPay number', employee.bank?.gpayNumber, true],
    ['PAN', employee.panNo, true],
    ['Aadhaar', employee.aadharNo, true],
    ['UAN', employee.uanNo, true],
    ['EPFO account', employee.epfoAccountNumber, true],
    ['ESI IP number', employee.ipNumber, true],
    ['Insurance number', employee.insuranceNo, true],
    ['Passport', employee.passportNo, true],
  ].filter(([, value]) => has(value));
  const anySecret = rows.some(([, , secret]) => secret);

  return (
    <Panel
      icon={Landmark}
      title="Bank & IDs"
      index={index}
      action={
        anySecret && (
          <button type="button" onClick={() => setRevealed((v) => !v)} aria-pressed={revealed} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50">
            {revealed ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
            {revealed ? 'Hide' : 'Show'}
          </button>
        )
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No bank or ID details on record.</p>
      ) : (
        <dl className="divide-y divide-line/70">
          {rows.map(([label, value, secret]) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="font-semibold text-ink tabular-nums">{secret && !revealed ? mask(value) : value}</dd>
            </div>
          ))}
          {employee.passportExpiry && (
            <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <dt className="text-muted">Passport expiry</dt>
              <dd className="font-semibold text-ink">{formatDate(employee.passportExpiry)}</dd>
            </div>
          )}
        </dl>
      )}
    </Panel>
  );
}

function JourneyPanel({ employee, index }) {
  const steps = [
    ...(employee.education ?? [])
      .filter((item) => item.schoolName || item.departmentName)
      .map((item, i) => ({
        key: `edu-${i}`,
        icon: GraduationCap,
        title: item.departmentName || 'Studies',
        place: item.schoolName,
        when: item.endYear ? `Completed ${item.endYear}` : '',
        // Just the year, so a degree finished in 2020 comes before a job that started mid-2020.
        sort: item.endYear || '0000',
      })),
    ...(employee.experience ?? [])
      .filter((item) => item.companyName || item.jobTitle)
      .map((item, i) => ({
        key: `job-${i}`,
        icon: Briefcase,
        title: item.jobTitle || 'Role',
        place: [item.companyName, item.companyIndustry].filter(Boolean).join(' · '),
        when: [looseDate(item.startWork), looseDate(item.endWork)].filter(Boolean).join(' – '),
        detail: item.responsibilities,
        sort: item.startWork || '0000',
      })),
    employee.dateOfJoining && {
      key: 'scriptx',
      icon: Star,
      title: employee.role?.name ?? 'Joined the team',
      place: `ScriptX${employee.department?.name ? ` · ${employee.department.name}` : ''}`,
      when: `Joined ${formatDate(employee.dateOfJoining)}`,
      sort: employee.dateOfJoining,
      current: true,
    },
  ]
    .filter(Boolean)
    .sort((a, b) => a.sort.localeCompare(b.sort));

  return (
    <Panel icon={Sparkles} title="Journey" index={index}>
      {steps.length === 0 ? (
        <p className="text-sm text-muted">Education and past experience show up here once HR adds them.</p>
      ) : (
        <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.key} className="relative flex gap-4">
                <span
                  className={cx(
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                    step.current ? 'bg-gold-400 text-brand-900' : 'bg-brand-50 text-brand-700',
                  )}
                >
                  <Icon size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-bold text-ink">{step.title}</p>
                  {step.place && <p className="text-sm text-muted">{step.place}</p>}
                  {step.when && <p className={cx('mt-0.5 text-xs font-semibold', step.current ? 'text-gold-700' : 'text-brand-700')}>{step.when}</p>}
                  {step.detail && <p className="mt-1 text-xs leading-relaxed text-muted">{step.detail}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {steps.length === 1 && <p className="mt-4 text-xs text-muted">Education and past experience show up here once HR adds them.</p>}
    </Panel>
  );
}

function Address({ title, address, pincode }) {
  return (
    <div className="rounded-2xl bg-canvas p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
        <MapPin size={13} aria-hidden="true" />
        {title}
      </p>
      <p className="mt-1.5 text-sm font-semibold whitespace-pre-line text-ink">{address || '—'}</p>
      {pincode && <p className="mt-1 text-xs font-semibold text-brand-700">PIN {pincode}</p>}
    </div>
  );
}

const link = (href, text, external) => (
  <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="hover:text-brand-700 hover:underline">
    {text}
  </a>
);

/* ---------- page ---------- */

/** Read-only: HR keeps these details up to date. */
export default function EmployeeProfile() {
  const { data, loading, error } = useApi('/employees/me/profile');
  // Company name, address and contacts for the back of the ID card.
  const { data: settings } = useApi('/settings');

  if (loading && !data) return <PageLoader />;
  if (error) return <div className="card"><EmptyState title="Couldn’t load your profile" description={error.message} /></div>;

  const employee = data.item;
  const documents = (employee.documents ?? []).filter((doc) => doc.files?.length);

  return (
    <div className="space-y-6">
      <Hero employee={employee} />
      <p className="text-sm text-muted">Your details on record. Ask HR if anything needs to change.</p>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Panel icon={Building2} title="Work" index={2}>
            <Fields
              items={[
                { label: 'Department', value: employee.department?.name },
                { label: 'Role', value: employee.role?.name },
                { label: 'Employee type', value: employee.employeeType },
                { label: 'Experience', value: employee.experienceLevel },
                { label: 'Joining date', value: has(employee.dateOfJoining) ? formatDate(employee.dateOfJoining) : '' },
                has(employee.confirmationDate) && { label: 'Confirmed on', value: formatDate(employee.confirmationDate) },
                employee.employeeType === 'Intern' && { label: 'Internship', value: employee.internDuration },
                { label: 'Shift', value: employee.shift ? `${employee.shift.name} · ${formatTime(employee.shift.from)} – ${formatTime(employee.shift.to)}` : '' },
                { label: 'Work email', value: employee.email, action: <CopyButton value={employee.email} label="work email" />, wide: true },
              ]}
            />
          </Panel>

          <Panel icon={UserRound} title="Personal" index={3}>
            <Fields
              items={[
                { label: 'Date of birth', value: has(employee.dateOfBirth) ? formatDate(employee.dateOfBirth) : '' },
                { label: 'Gender', value: employee.gender ? employee.gender[0] + employee.gender.slice(1).toLowerCase() : '' },
                { label: 'Marital status', value: employee.maritalStatus },
                employee.maritalStatus === 'Married' && { label: 'Spouse', value: employee.spouseName },
                { label: 'Father’s name', value: employee.fatherName },
                { label: 'Mother’s name', value: employee.motherName },
              ]}
            />
          </Panel>

          <Panel icon={Phone} title="Contact" index={4}>
            <Fields
              items={[
                { label: 'Phone', value: employee.phone && link(`tel:${employee.phone}`, employee.phone), action: <CopyButton value={employee.phone} label="phone number" /> },
                { label: 'Personal email', value: employee.personalEmail && link(`mailto:${employee.personalEmail}`, employee.personalEmail) },
                {
                  label: 'LinkedIn',
                  value: employee.linkedIn && (
                    <a href={employee.linkedIn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                      <Link2 size={14} aria-hidden="true" />
                      View profile
                    </a>
                  ),
                  wide: true,
                },
              ]}
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Address title="Current address" address={employee.address} pincode={employee.pincode} />
              <Address title="Permanent address" address={employee.permanentAddress} pincode={employee.permanentPincode} />
            </div>
          </Panel>

          <Panel icon={Sparkles} title="Skills" index={5}>
            {has(employee.skills) ? (
              <ul className="flex flex-wrap gap-2">
                {employee.skills.map((skill) => (
                  <li key={skill} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 ring-1 ring-brand-100 ring-inset">
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No skills listed yet.</p>
            )}
          </Panel>

          <JourneyPanel employee={employee} index={6} />

          <Panel icon={FileText} title="Documents" index={7}>
            {documents.length === 0 ? (
              <p className="text-sm text-muted">No documents on file.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {documents.flatMap((doc) =>
                  doc.files.map((file) => (
                    <li key={file.url}>
                      <a
                        href={fileUrl(file.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-2xl border border-line p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                          <FileText size={16} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">{doc.title || 'Document'}</span>
                          <span className="block truncate text-xs text-muted">{file.name}</span>
                        </span>
                      </a>
                    </li>
                  )),
                )}
              </ul>
            )}
          </Panel>
        </div>

        <aside className="space-y-6" aria-label="ID card and records">
          <IdCardPanel employee={employee} company={settings?.item} />
          <CompletenessPanel employee={employee} index={2} />
          <EmergencyPanel contacts={employee.emergencyContacts ?? []} index={3} />
          <BankPanel employee={employee} index={4} />
        </aside>
      </div>
    </div>
  );
}
