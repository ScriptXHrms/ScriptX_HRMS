import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart2,
  Building2,
  Calendar,
  CircleDollarSign,
  CreditCard,
  Receipt,
  Repeat,
  Scale,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/dateUtils';
import { currentMonth, formatMoney, monthLabel } from '../../utils/format';
import { cx } from '../../utils/cx';

/* ---------------- Sparkline SVG Component ---------------- */
function Sparkline({ color = '#10B981', trend = 'up' }) {
  const d =
    trend === 'up'
      ? 'M 0,28 C 20,24 35,32 50,18 C 65,10 80,22 100,8'
      : 'M 0,10 C 20,14 35,8 50,22 C 65,30 80,18 100,32';
  return (
    <svg className="h-9 w-20 shrink-0 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Dynamic Spending & Inflow Chart Component ---------------- */
function SpendingChart({ data = [], selectedDay, onSelectDay }) {
  const safeData = useMemo(() => {
    if (data && data.length > 0) return data;
    return [
      { day: 'Mon', income: 42000, expenses: 18000 },
      { day: 'Tue', income: 38000, expenses: 22000 },
      { day: 'Wed', income: 30000, expenses: 14000 },
      { day: 'Thu', income: 48000, expenses: 25000 },
      { day: 'Fri', income: 62000, expenses: 28000 },
      { day: 'Sat', income: 75000, expenses: 26250 },
      { day: 'Sun', income: 45000, expenses: 19000 },
    ];
  }, [data]);

  const maxVal = useMemo(() => {
    const highest = Math.max(...safeData.map((d) => Math.max(Number(d.income || 0), Number(d.expenses || 0))), 1000);
    return Math.ceil(highest / 10000) * 10000 || 50000;
  }, [safeData]);

  const chartPoints = useMemo(() => {
    const count = safeData.length;
    const startX = 60;
    const endX = 540;
    const step = count > 1 ? (endX - startX) / (count - 1) : 0;
    return safeData.map((d, i) => ({
      ...d,
      x: startX + i * step,
      incomeVal: Number(d.income || 0),
      expenseVal: Number(d.expenses || 0),
    }));
  }, [safeData]);

  const getY = (val) => 200 - (val / (maxVal * 1.15)) * 175;

  const incomePoints = chartPoints.map((d) => ({ x: d.x, y: getY(d.incomeVal) }));
  const expensePoints = chartPoints.map((d) => ({ x: d.x, y: getY(d.expenseVal) }));

  const makeCurve = (pts) => {
    if (!pts.length) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const incomePath = makeCurve(incomePoints);
  const expensePath = makeCurve(expensePoints);
  const incomeArea = chartPoints.length > 0 ? `${incomePath} L ${chartPoints.at(-1).x},200 L ${chartPoints[0].x},200 Z` : '';
  const expenseArea = chartPoints.length > 0 ? `${expensePath} L ${chartPoints.at(-1).x},200 L ${chartPoints[0].x},200 Z` : '';

  const activeIndex = chartPoints.findIndex((d) => d.day === selectedDay);
  const activeItem = chartPoints[activeIndex >= 0 ? activeIndex : chartPoints.length - 1];

  const isNearRight = activeItem && activeItem.x > 420;
  const isNearLeft = activeItem && activeItem.x < 140;
  const tooltipXClass = isNearRight
    ? '-translate-x-[85%]'
    : isNearLeft
    ? '-translate-x-[15%]'
    : '-translate-x-1/2';

  const yLabels = [
    { label: `${Math.round(maxVal / 1000)}k`, y: 25 },
    { label: `${Math.round((maxVal * 0.75) / 1000)}k`, y: 70 },
    { label: `${Math.round((maxVal * 0.5) / 1000)}k`, y: 115 },
    { label: `${Math.round((maxVal * 0.25) / 1000)}k`, y: 160 },
    { label: '0k', y: 200 },
  ];

  return (
    <div className="relative w-full overflow-visible select-none">
      <svg className="w-full h-56" viewBox="0 0 580 230" preserveAspectRatio="none">
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Grid Lines & Labels */}
        {yLabels.map((line) => (
          <g key={line.label}>
            <text x="36" y={line.y + 4} textAnchor="end" className="text-[11px] fill-slate-400 font-medium">
              {line.label}
            </text>
            <line x1="46" y1={line.y} x2="560" y2={line.y} stroke="#F1F5F9" strokeWidth="1" />
          </g>
        ))}

        {/* Shaded Areas */}
        {incomeArea && <path d={incomeArea} fill="url(#incomeGrad)" />}
        {expenseArea && <path d={expenseArea} fill="url(#expenseGrad)" />}

        {/* Smooth Curves */}
        {incomePath && <path d={incomePath} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />}
        {expensePath && <path d={expensePath} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />}

        {/* Active Vertical Guide Line */}
        {activeItem && (
          <line
            x1={activeItem.x}
            y1="25"
            x2={activeItem.x}
            y2="200"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-70"
          />
        )}

        {/* Day X Labels & Click Targets */}
        {chartPoints.map((d) => {
          const isActive = d.day === activeItem?.day;
          return (
            <g key={d.day || d.date} className="cursor-pointer" onClick={() => onSelectDay(d.day)}>
              <rect x={d.x - 24} y="0" width="48" height="230" fill="transparent" />
              <text
                x={d.x}
                y="222"
                textAnchor="middle"
                className={cx('text-[12px] font-semibold transition-colors', isActive ? 'fill-slate-900 font-bold' : 'fill-slate-400')}
              >
                {d.day}
              </text>
            </g>
          );
        })}

        {/* Active Points */}
        {activeItem && (
          <>
            <circle cx={activeItem.x} cy={getY(activeItem.incomeVal)} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx={activeItem.x} cy={getY(activeItem.expenseVal)} r="5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2.5" />
          </>
        )}
      </svg>

      {/* Floating Active Tooltip */}
      {activeItem && (
        <div
          className={cx(
            'pointer-events-none absolute z-50 rounded-xl bg-slate-900/95 px-3.5 py-2 text-white shadow-2xl backdrop-blur-md transition-all duration-200 whitespace-nowrap',
            tooltipXClass,
          )}
          style={{
            left: `${(activeItem.x / 580) * 100}%`,
            top: '8px',
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium leading-tight">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-slate-200 font-bold">₹{activeItem.incomeVal.toLocaleString()}</span>
            <span className="text-slate-400">• Inflow</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium leading-tight">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span className="text-slate-200 font-bold">₹{activeItem.expenseVal.toLocaleString()}</span>
            <span className="text-slate-400">• Outflow</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Donut Chart Component ---------------- */
function ExpenseDonut({ total = 0, slices = [] }) {
  const R = 64;
  const C = 2 * Math.PI * R;
  const sumPct = slices.reduce((acc, s) => acc + (s.pct || 0), 0) || 100;
  let offset = 0;

  const paths = slices.map((slice) => {
    const fraction = (slice.pct || 0) / sumPct;
    const strokeDasharray = `${fraction * C} ${C}`;
    const strokeDashoffset = -offset;
    offset += fraction * C;
    return { ...slice, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform overflow-visible" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={R} fill="transparent" stroke="#F1F5F9" strokeWidth="26" />
        {paths.map((p) => (
          <circle
            key={p.name}
            cx="80"
            cy="80"
            r={R}
            fill="transparent"
            stroke={p.color}
            strokeWidth="26"
            strokeDasharray={p.strokeDasharray}
            strokeDashoffset={p.strokeDashoffset}
            className="transition-all duration-300"
          />
        ))}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center px-2">
        <span className="text-lg font-black text-slate-900 tabular-nums">{formatMoney(total)}</span>
        <span className="text-[11px] font-semibold text-slate-400">Total Outflow</span>
      </div>
    </div>
  );
}

/* ---------------- Main Finance Dashboard Component ---------------- */
export default function AdminRecurring() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch consolidated finance overview from the backend
  const { data: overviewData } = useApi('/finance/overview');

  const kpis = overviewData?.kpis;
  const modules = overviewData?.modules;
  const chartData = overviewData?.spendingOverview ?? [];
  const rawBreakdown = overviewData?.expenseBreakdown;

  const donutSlices = useMemo(() => {
    if (rawBreakdown && rawBreakdown.length > 0) return rawBreakdown;
    return [
      { name: 'Payroll Salaries', pct: 60, color: '#8B5CF6' },
      { name: 'Company Expenses', pct: 25, color: '#F43F5E' },
      { name: 'Subscriptions', pct: 15, color: '#3B82F6' },
    ];
  }, [rawBreakdown]);

  const transactions = useMemo(() => {
    if (overviewData?.recentTransactions && overviewData.recentTransactions.length > 0) {
      return overviewData.recentTransactions;
    }
    return [];
  }, [overviewData]);

  const allTxList = useMemo(() => {
    return overviewData?.allTransactions ?? transactions;
  }, [overviewData, transactions]);

  // Filtered transactions for quick view and modal
  const filteredTransactions = useMemo(() => {
    return allTxList.filter((t) => {
      if (activeTab !== 'all' && t.module !== activeTab) return false;
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        return (
          (t.title || '').toLowerCase().includes(query) ||
          (t.category || '').toLowerCase().includes(query) ||
          (t.moduleLabel || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allTxList, activeTab, searchFilter]);

  const totalOutflowVal = kpis?.totalOutflow?.month ?? 0;
  const totalInflowVal = kpis?.totalRevenue?.month ?? 0;
  const netBalanceVal = kpis?.netBalance?.month ?? (totalInflowVal - totalOutflowVal);
  const isNetPositive = netBalanceVal >= 0;

  // Breakdown values for the 4 consolidated cards
  const incomeVal = modules?.income?.thisMonth ?? (kpis?.totalRevenue?.income ?? 0);
  const clientPaymentsVal = modules?.clientPayments?.totalReceived ?? 0;
  const clientPaymentsMonthVal = modules?.clientPayments?.thisMonthReceived ?? (kpis?.totalRevenue?.clientPayments ?? clientPaymentsVal);
  const expenseVal = modules?.expenses?.thisMonth ?? (kpis?.totalOutflow?.expenses ?? 0);
  const payrollVal = modules?.payroll?.net ?? (kpis?.totalOutflow?.payroll ?? 0);
  const subsVal = modules?.subscriptions?.monthlyCost ?? (kpis?.totalOutflow?.subscriptions ?? 0);
  const budgetVal = modules?.clientPayments?.totalBudget ?? (kpis?.clientReceivables?.totalBudget ?? 0);
  const pendingReceivablesVal = modules?.clientPayments?.balance ?? (kpis?.clientReceivables?.pending ?? 0);

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      {/* ---------------- 0. HEADER & CONTEXT ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Finance Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated overview across Revenue, Payroll, Expenses, Client Payments & Subscriptions.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-2xl bg-white border border-slate-200/80 px-3 py-1.5 shadow-xs">
          <Calendar size={15} className="text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">{monthLabel(overviewData?.month || currentMonth())}</span>
        </div>
      </div>

      {/* ---------------- 1. EXECUTIVE KPI SUMMARY CARDS ---------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Net Balance (Profit) */}
        <div className="relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  'flex h-11 w-11 items-center justify-center rounded-2xl',
                  isNetPositive ? 'bg-emerald-100/70 text-emerald-600' : 'bg-rose-100/70 text-rose-600',
                )}
              >
                <Scale size={20} />
              </div>
              <div>
                <span className="block text-[11px] font-semibold tracking-wide text-slate-400">Net Balance (Profit)</span>
                <span className="block text-xl font-black text-slate-900 sm:text-2xl tabular-nums">
                  {formatMoney(netBalanceVal)}
                </span>
              </div>
            </div>
            <Sparkline color={isNetPositive ? '#10B981' : '#F43F5E'} trend={isNetPositive ? 'up' : 'down'} />
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className={isNetPositive ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>
                {isNetPositive ? '↑ Surplus' : '↓ Deficit'}
              </span>
              <span className="text-slate-400 font-medium">• This Month</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 tabular-nums">
              Inflow ({formatMoney(totalInflowVal)}) - Outflow ({formatMoney(totalOutflowVal)})
            </div>
          </div>
        </div>

        {/* Card 2: Total Inflow / Revenue */}
        <div className="relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-600">
                <ArrowUpRight size={22} />
              </div>
              <div>
                <span className="block text-[11px] font-semibold tracking-wide text-slate-400">Total Inflow / Revenue</span>
                <span className="block text-xl font-black text-slate-900 sm:text-2xl tabular-nums">
                  {formatMoney(totalInflowVal)}
                </span>
              </div>
            </div>
            <Sparkline color="#10B981" trend="up" />
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span>↑</span>
              <span>Income + Client Payments</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 tabular-nums">
              Income: {formatMoney(incomeVal)} + Client Payments: {formatMoney(clientPaymentsMonthVal)}
            </div>
          </div>
        </div>

        {/* Card 3: Total Outflow (Spending) */}
        <div className="relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100/70 text-rose-500">
                <CreditCard size={20} />
              </div>
              <div>
                <span className="block text-[11px] font-semibold tracking-wide text-slate-400">Total Outflow (Spending)</span>
                <span className="block text-xl font-black text-slate-900 sm:text-2xl tabular-nums">
                  {formatMoney(totalOutflowVal)}
                </span>
              </div>
            </div>
            <Sparkline color="#F43F5E" trend="down" />
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
              <span>Payroll + Expenses + Subscriptions</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 tabular-nums">
              Payroll: {formatMoney(payrollVal)} + Expenses: {formatMoney(expenseVal)} + Subscriptions: {formatMoney(subsVal)}
            </div>
          </div>
        </div>

        {/* Card 4: Pending Receivables */}
        <div className="relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-600">
                <CircleDollarSign size={20} />
              </div>
              <div>
                <span className="block text-[11px] font-semibold tracking-wide text-slate-400">Pending Receivables</span>
                <span className="block text-xl font-black text-slate-900 sm:text-2xl tabular-nums">
                  {formatMoney(pendingReceivablesVal)}
                </span>
              </div>
            </div>
            <Sparkline color="#F59E0B" trend="up" />
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <span>Client Project Balances Due</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 tabular-nums">
              Budget: {formatMoney(budgetVal)} • Received: {formatMoney(clientPaymentsVal)}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 2. MIDDLE ROW: SPENDING & INFLOW OVERVIEW & OUTFLOW BREAKDOWN ---------------- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* SPENDING & INFLOW OVERVIEW (7 cols on lg) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] lg:col-span-7">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Cashflow Trend (Inflow vs Outflow)</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Inflow (Revenue)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                Outflow (Spending)
              </span>
            </div>
          </div>
          <SpendingChart data={chartData} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </div>

        {/* EXPENSE BREAKDOWN (5 cols on lg) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] lg:col-span-5">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-bold text-slate-900">Company Outflow Breakdown</h2>
            <span className="text-xs text-slate-400">Monthly Share</span>
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row lg:flex-col xl:flex-row">
            <ExpenseDonut total={totalOutflowVal} slices={donutSlices} />
            <div className="w-full space-y-3 sm:w-auto xl:w-48">
              {donutSlices.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900">{item.pct}%</span>
                  </div>
                  {item.amount !== undefined && (
                    <div className="pl-4 text-[11px] font-semibold text-slate-400 tabular-nums">
                      {formatMoney(item.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 4. BOTTOM ROW: RECENT FINANCIAL TRANSACTIONS ---------------- */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Financial Activity</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              {allTxList.length} Total
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'payments', label: 'Client Payments' },
              { id: 'income', label: 'Income' },
              { id: 'expenses', label: 'Expenses' },
              { id: 'payroll', label: 'Payroll' },
              { id: 'subscriptions', label: 'Subscriptions' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  'rounded-full px-3 py-1 text-xs font-bold transition-all',
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
                )}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowAllTransactions(true)}
              className="ml-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
            >
              View Full History →
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No transactions found for this filter.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTransactions.slice(0, 10).map((t) => {
              const isPositive = t.amount > 0 || t.type === 'inflow';
              return (
                <div
                  key={t.id || t.title}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/70 p-3.5 border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cx(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                        t.module === 'payments'
                          ? 'bg-indigo-50 text-indigo-600'
                          : t.module === 'income'
                          ? 'bg-emerald-50 text-emerald-600'
                          : t.module === 'payroll'
                          ? 'bg-purple-50 text-purple-600'
                          : t.module === 'subscriptions'
                          ? 'bg-sky-50 text-sky-600'
                          : 'bg-rose-50 text-rose-600',
                      )}
                    >
                      {t.module === 'payments' && <Building2 size={18} />}
                      {t.module === 'income' && <TrendingUp size={18} />}
                      {t.module === 'payroll' && <Users size={18} />}
                      {t.module === 'subscriptions' && <Repeat size={18} />}
                      {t.module === 'expenses' && <Receipt size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="block truncate text-xs font-bold text-slate-800">{t.title}</span>
                        <span
                          className={cx(
                            'rounded-md px-1.5 py-0.2 text-[9px] font-bold uppercase shrink-0',
                            t.module === 'payments'
                              ? 'bg-indigo-100 text-indigo-800'
                              : t.module === 'income'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.module === 'payroll'
                              ? 'bg-purple-100 text-purple-800'
                              : t.module === 'subscriptions'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800',
                          )}
                        >
                          {t.moduleLabel || t.module}
                        </span>
                      </div>
                      <span className="block truncate text-[11px] font-medium text-slate-400">
                        {t.category} {t.date ? `• ${formatDate(t.date)}` : ''}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cx(
                      'text-xs font-extrabold tabular-nums shrink-0',
                      isPositive ? 'text-emerald-600' : 'text-rose-500',
                    )}
                  >
                    {isPositive ? `+ ${formatMoney(Math.abs(t.amount))}` : `- ${formatMoney(Math.abs(t.amount))}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------- VIEW ALL TRANSACTIONS MODAL ---------------- */}
      {showAllTransactions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Receipt size={20} />
                <h3 className="text-base font-bold text-slate-900">All Company Financial Transactions</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllTransactions(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter controls inside modal */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'payments', label: 'Client Payments' },
                  { id: 'income', label: 'Income' },
                  { id: 'expenses', label: 'Expenses' },
                  { id: 'payroll', label: 'Payroll' },
                  { id: 'subscriptions', label: 'Subscriptions' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cx(
                      'rounded-full px-2.5 py-1 text-xs font-bold transition-all',
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search transactions…"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500 w-48"
              />
            </div>

            <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto pr-1">
              {filteredTransactions.map((t) => {
                const isPositive = t.amount > 0 || t.type === 'inflow';
                return (
                  <div
                    key={t.id || t.title}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cx(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs',
                          t.module === 'payments'
                            ? 'text-indigo-600'
                            : t.module === 'income'
                            ? 'text-emerald-600'
                            : t.module === 'payroll'
                            ? 'text-purple-600'
                            : t.module === 'subscriptions'
                            ? 'text-sky-600'
                            : 'text-rose-600',
                        )}
                      >
                        {t.module === 'payments' && <Building2 size={16} />}
                        {t.module === 'income' && <TrendingUp size={16} />}
                        {t.module === 'payroll' && <Users size={16} />}
                        {t.module === 'subscriptions' && <Repeat size={16} />}
                        {t.module === 'expenses' && <Receipt size={16} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="block truncate text-xs font-bold text-slate-900">{t.title}</span>
                          <span
                            className={cx(
                              'rounded-md px-1.5 py-0.2 text-[9px] font-bold uppercase shrink-0',
                              t.module === 'payments'
                                ? 'bg-indigo-100 text-indigo-800'
                                : t.module === 'income'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.module === 'payroll'
                                ? 'bg-purple-100 text-purple-800'
                                : t.module === 'subscriptions'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-rose-100 text-rose-800',
                            )}
                          >
                            {t.moduleLabel || t.module}
                          </span>
                        </div>
                        <span className="block truncate text-[11px] text-slate-500">
                          {t.category} {t.date ? `• ${formatDate(t.date)}` : ''}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cx(
                        'text-xs font-black tabular-nums shrink-0',
                        isPositive ? 'text-emerald-600' : 'text-rose-500',
                      )}
                    >
                      {isPositive ? `+ ${formatMoney(Math.abs(t.amount))}` : `- ${formatMoney(Math.abs(t.amount))}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-400">
                Showing {filteredTransactions.length} entries
              </span>
              <button
                type="button"
                onClick={() => setShowAllTransactions(false)}
                className="btn btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
