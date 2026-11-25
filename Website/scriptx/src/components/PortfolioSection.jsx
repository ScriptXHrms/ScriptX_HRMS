import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  TrendingUp, 
  Sparkles
} from 'lucide-react';

export default function PortfolioSection({ onOpenAuditModal }) {
  const [selectedCase, setSelectedCase] = useState(0);

  const cases = [
    {
      id: 'saas-founder',
      client: 'DevFlow AI (B2B SaaS)',
      founder: 'Marcus Vance, CEO',
      industry: 'Enterprise Software & DevTools',
      category: 'Personal Branding & Inbound Funnel',
      headline: 'From Zero Social Presence to $1.9M Inbound Enterprise Pipeline in 6 Months',
      overview: 'Marcus had built an outstanding AI developer tool but relied completely on expensive cold outreach. ScriptX developed a proprietary executive narrative around "The Future of Autonomous Engineering", scaling Marcus from 2,100 to 118,000 LinkedIn followers.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
      before: {
        followers: '2,100',
        inboundLeads: '1-2 / month',
        monthlyReach: '14,000 views',
        pipeline: '$0 attributed'
      },
      after: {
        followers: '118,400',
        inboundLeads: '45+ qualified / mo',
        monthlyReach: '4.2M views',
        pipeline: '$1,920,000 closed'
      },
      results: [
        '+5,500% Growth in Executive Reach',
        'Featured as LinkedIn Top Voice 2025',
        'Signed 14 Enterprise Contracts from Direct DMs',
        'Invited as Keynote Speaker at WebSummit'
      ],
      quote: "ScriptX took 45 minutes of my time each Monday and converted it into the single largest customer acquisition channel for our company. The ROI is staggering.",
      tagColor: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'health-d2c',
      client: 'Kura Health & Longevity',
      founder: 'Dr. Aris Thorne, Co-Founder',
      industry: 'Healthcare & Functional Nutrition',
      category: 'Meta Ads & Founder Storytelling',
      headline: 'Scaling D2C Health Brand from $40k/mo to $380k/mo with 5.4x Blended ROAS',
      overview: 'Combining Dr. Thorne\'s clinical authority on video reels with high-converting Meta and Google search ads. We restructured their entire direct-response funnel, reducing customer acquisition costs by 58%.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      before: {
        followers: '8,400',
        inboundLeads: '220 orders / mo',
        monthlyReach: '65,000 views',
        pipeline: '$42,000/mo'
      },
      after: {
        followers: '84,500',
        inboundLeads: '3,800 orders / mo',
        monthlyReach: '6.8M views',
        pipeline: '$384,000/mo'
      },
      results: [
        '5.4x Blended Return on Ad Spend (ROAS)',
        'Customer Acquisition Cost dropped by 58%',
        'Viral Reels generated over 12M organic views',
        'Zero ad fatigue due to our rapid creative testing system'
      ],
      quote: "The combination of personal brand authenticity and disciplined paid media is unstoppable. ScriptX delivered far beyond what any prior agency could.",
      tagColor: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'real-estate',
      client: 'Vanguard Luxury Estates',
      founder: 'Sophia Chen, Principal Broker',
      industry: 'High-End Real Estate & Development',
      category: 'Omnichannel Video & High-Net-Worth Authority',
      headline: '$24.5M in Luxury Properties Sold Directly Through Instagram & LinkedIn Brand',
      overview: 'Sophia needed to attract ultra-high-net-worth investors and buyers without appearing transactional. We crafted cinematic property walkthroughs and high-authority market trend analysis, positioning Sophia as the definitive luxury real estate authority.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      before: {
        followers: '4,200',
        inboundLeads: '3 referrals / qtr',
        monthlyReach: '28,000 views',
        pipeline: '$2.5M listings'
      },
      after: {
        followers: '92,300',
        inboundLeads: '24 HNW inquiries / mo',
        monthlyReach: '3.9M views',
        pipeline: '$24,500,000 sales'
      },
      results: [
        '$24.5M in direct property transaction volume',
        'Average inquiry deal size of $2.2M',
        'Direct DM connections with celebrity & tech investors',
        'Ranked #1 Real Estate Creator in Region'
      ],
      quote: "HNW clients now message me directly having watched my videos for months. ScriptX made me the first phone call they make.",
      tagColor: 'from-amber-500 to-orange-600'
    },
    {
      id: 'fintech-seo',
      client: 'LedgerVault Security',
      founder: 'Devon Ortiz, VP Marketing',
      industry: 'FinTech & Cyber Compliance',
      category: 'SEO Dominance & Thought Leadership',
      headline: 'Ranking #1 for 140+ Commercial Buying Keywords & Driving 420% Organic Demos',
      overview: 'A full-scale technical and programmatic SEO overhaul paired with authoritative whitepapers and executive essays. We displaced incumbent competitors and secured dominant search engine positions.',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      before: {
        followers: '3,800',
        inboundLeads: '15 demos / mo',
        monthlyReach: '12k search visits',
        pipeline: '$180k pipeline'
      },
      after: {
        followers: '41,200',
        inboundLeads: '142 demos / mo',
        monthlyReach: '260k search visits',
        pipeline: '$1,450,000 pipeline'
      },
      results: [
        '#1 Google Rank for 142 High-Intent Commercial Queries',
        'Zero ad spend required for 75% of inbound pipeline',
        '420% Increase in Enterprise Demo Bookings',
        'Acquired Tier-1 Backlinks from Bloomberg, TechCrunch'
      ],
      quote: "Our organic inbound pipeline surpassed all our paid channels combined within 8 months. ScriptX executes with mathematical precision.",
      tagColor: 'from-purple-500 to-pink-600'
    }
  ];

  const current = cases[selectedCase];

  return (
    <section id="case-studies" className="relative py-24 md:py-32 bg-[#080B13] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Verified Case Studies
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Before & After <span className="text-gradient-purple">Breakthroughs</span>
            </h2>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mt-4 md:mt-0">
            Real data from founders and brands who stopped relying on luck and deployed the ScriptX Growth Engine.
          </p>
        </div>

        {/* Case Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {cases.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setSelectedCase(idx)}
              className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                selectedCase === idx
                  ? 'bg-[#121829] border-indigo-500/50 shadow-lg shadow-indigo-950/40'
                  : 'bg-[#0d111d] border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-mono text-indigo-400 block mb-1">CASE 0{idx + 1}</span>
              <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">{c.client}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.category}</p>
            </button>
          ))}
        </div>

        {/* Active Case Study Detail Card */}
        <div className="rounded-2xl glass-card p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-mono font-medium">
                  {current.industry}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 text-[11px] font-mono">
                  {current.category}
                </span>
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-4 leading-tight">
                {current.headline}
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {current.overview}
              </p>

              {/* Before vs After Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                
                {/* BEFORE */}
                <div className="rounded-xl bg-[#0a0d16] p-4 border border-rose-500/20">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-500/10">
                    <span className="text-xs font-mono text-rose-400 font-bold uppercase">Before ScriptX</span>
                    <span className="text-[10px] text-slate-500">Day 0</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audience:</span>
                      <span className="font-mono text-slate-300">{current.before.followers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Inbound:</span>
                      <span className="font-mono text-slate-300">{current.before.inboundLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Organic Reach:</span>
                      <span className="font-mono text-slate-300">{current.before.monthlyReach}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tracked Pipeline:</span>
                      <span className="font-mono text-rose-400">{current.before.pipeline}</span>
                    </div>
                  </div>
                </div>

                {/* AFTER */}
                <div className="rounded-xl bg-[#0d1424] p-4 border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/20">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> After ScriptX
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Month 6</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audience:</span>
                      <span className="font-mono text-white font-bold">{current.after.followers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Inbound:</span>
                      <span className="font-mono text-emerald-400 font-bold">{current.after.inboundLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Organic Reach:</span>
                      <span className="font-mono text-cyan-300 font-bold">{current.after.monthlyReach}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tracked Pipeline:</span>
                      <span className="font-mono text-emerald-400 font-bold">{current.after.pipeline}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Key Results bullets */}
              <div className="space-y-1.5 mb-6">
                {current.results.map((res, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <span>{res}</span>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="p-4 rounded-xl bg-white/[0.02] border-l-2 border-indigo-500 text-xs text-slate-300 italic mb-6">
                "{current.quote}"
                <footer className="text-slate-400 font-bold not-italic mt-2 block">
                  — {current.founder}
                </footer>
              </blockquote>

              <button
                onClick={onOpenAuditModal}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <span>Replicate These Results For Your Brand</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">
                <img 
                  src={current.image} 
                  alt={current.client} 
                  className="w-full h-80 lg:h-[480px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="p-4 rounded-xl bg-[#090d16]/90 backdrop-blur-md border border-white/10">
                    <span className="text-[10px] font-mono text-indigo-400 block mb-1">CLIENT HIGHLIGHT</span>
                    <h5 className="font-bold text-sm text-white">{current.client}</h5>
                    <p className="text-xs text-slate-400">{current.founder}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
