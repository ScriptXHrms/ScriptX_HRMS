import { useMemo, useState } from 'react';
import { BookOpenText, CalendarHeart } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import PageLoader from '../components/PageLoader';
import SectionCard from '../components/SectionCard';
import Tabs from '../components/Tabs';
import { useApi } from '../hooks/useApi';
import { formatLongDate, todayISO } from '../utils/dateUtils';

const HOLIDAYS_TAB = 'holidays';

function HolidayList() {
  const year = todayISO().slice(0, 4);
  const { data, loading } = useApi(`/holidays?from=${year}-01-01&to=${year}-12-31`);
  if (loading && !data) return <PageLoader />;
  const items = data?.items ?? [];
  return (
    <SectionCard title={`Holidays in ${year}`}>
      {items.length === 0 ? (
        <EmptyState icon={CalendarHeart} title="No holidays added" className="py-6" />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((holiday) => (
            <li key={holiday._id} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm font-semibold text-ink">{holiday.reason}</span>
              <span className="text-sm text-muted">{formatLongDate(holiday.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/** Read-only policy text, edited by admins under Settings. */
export default function PolicyPage({ group, title, description, withHolidays = false }) {
  const { data, loading } = useApi(`/protocols?group=${group}`);
  const policies = useMemo(() => data?.items ?? [], [data]);
  const [active, setActive] = useState(null);
  const current = active ?? policies[0]?.key;

  if (loading && !data) return <PageLoader />;

  const tabs = [...policies.map((p) => ({ id: p.key, label: p.title })), ...(withHolidays ? [{ id: HOLIDAYS_TAB, label: 'Holiday' }] : [])];
  const policy = policies.find((p) => p.key === current);

  return (
    <div>
      <PageHeader title={title} description={description} />
      {tabs.length === 0 ? (
        <div className="card">
          <EmptyState icon={BookOpenText} title="No policies yet" description="HR hasn’t published these yet." />
        </div>
      ) : (
        <>
          <Tabs label={title} active={current} onChange={setActive} tabs={tabs} className="mb-5" />
          {current === HOLIDAYS_TAB ? (
            <HolidayList />
          ) : (
            <SectionCard title={policy?.title}>
              <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-ink">
                {policy?.body.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}
