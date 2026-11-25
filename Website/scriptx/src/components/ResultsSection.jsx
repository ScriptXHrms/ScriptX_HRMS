import React, { useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  BarChart, 
  ArrowUpRight, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';

export default function ResultsSection({ onOpenAuditModal }) {
  const sectionRef = useRef(null);

  const stats = [
    {
      id: 'clients',
      number: '250+',
      label: 'Global Clients & Founders',
      desc: 'High-growth startups, VC-backed tech founders, and market leaders scaled.',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Global Roster'
    },
    {
      id: 'projects',
      number: '500+',
      label: 'Campaigns & Retainers',
      desc: 'Executed across LinkedIn, X, Meta Ads, SEO, and omnichannel funnels.',
      icon: Briefcase,
      color: 'from-purple-500 to-pink-600',
      badge: '100% Tracked'
    },
    {
      id: 'leads',
      number: '$24M+',
      label: 'Tracked Inbound Pipeline',
      desc: 'Direct qualified pipeline & contract value generated for our clients.',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Real Revenue'
    },
    {
      id: 'growth',
      number: '380%',
      label: 'Avg 90-Day Growth Rate',
      desc: 'Organic impression acceleration and inbound sales conversion increase.',
      icon: TrendingUp,
      color: 'from-amber-500 to-rose-600',
      badge: 'Compounding ROI'
    }
  ];

  return (
    <section ref={sectionRef} id="results" className="relative py-24 md:py-32 bg-[#06080F] border-t border-white/5 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <BarChart className="w-3.5 h-3.5 text-emerald-400" />
            Proven Impact & Data
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Real Numbers. Real Pipeline.{' '}
            <span className="text-gradient-cyan">Zero Fluff.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            We measure our success not just by vanity likes, but by qualified discovery calls, pipeline volume, and bottom-line enterprise valuation.
          </p>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="relative rounded-2xl glass-card p-6 sm:p-7 hover:border-indigo-500/40 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${stat.color} p-0.5 shadow-lg group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {stat.badge}
                  </span>
                </div>

                <div className="mb-2">
                  <h3 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight group-hover:text-indigo-200 transition-colors font-mono">
                    {stat.number}
                  </h3>
                </div>

                <h4 className="text-sm font-bold text-slate-200 mb-2">
                  {stat.label}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {stat.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-slate-500 font-mono">
                  <span>Verified 2024-2026 Audit</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* High-Impact Comparison: Traditional Agency vs ScriptX Authority Engine */}
        <div className="rounded-2xl glass-card p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">The Asymmetric Advantage</span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              Why Founders Choose The ScriptX Authority Model
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* The Old Way */}
            <div className="rounded-xl bg-[#0b0e17] p-6 border border-rose-500/20">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-500/20 text-rose-400 font-bold text-sm uppercase tracking-wider">
                <span>✕ Traditional Marketing Agencies</span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Post generic company updates nobody reads or engages with.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Waste $10,000s on blind ads that stop the second budget runs out.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Demand 8-10 hours/week of founder interviews, recording, and approvals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Report on meaningless vanity impressions without pipeline tracking.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Treat you like just another ticket in an outsourced junior queue.</span>
                </li>
              </ul>
            </div>

            {/* The ScriptX Way */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-950/40 via-[#0e1424] to-[#0c101d] p-6 border border-indigo-500/40 shadow-xl shadow-indigo-950/50">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-500/30">
                <span className="text-indigo-300 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  The ScriptX Personal Branding Engine
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  RECOMMENDED
                </span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Founder-Led Authority:</strong> People trust humans. We position the founder as the voice of the industry.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Compounding Organic Asset:</strong> Your personal network & authority remains yours forever, never decaying.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Friction Workflow:</strong> Only 45 minutes once a week. We extract your insights and ghostwrite the rest.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Bottom-Line Attribution:</strong> Direct inbound DMs, high-ticket deal closing funnels, and measurable pipeline.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Dedicated Senior Team:</strong> Brand strategist, executive copywriter, and media buyer dedicated to your account.</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onOpenAuditModal}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
            >
              <span>See What We Can Achieve For Your Brand</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
