import React from 'react';
import { 
  HeartPulse, 
  Building, 
  GraduationCap, 
  Laptop, 
  ShoppingBag, 
  Mic2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function IndustriesSection({ onOpenAuditModal }) {
  const industries = [
    {
      id: 'healthcare',
      title: 'Healthcare & Wellness',
      tagline: 'Clinical Credibility & High-Trust Patient Acquisition',
      desc: 'Position doctors, health-tech founders, and wellness innovators as premier experts while staying strictly compliant with medical advertising regulations.',
      channels: ['Founder Storytelling', 'Meta Medical Funnels', 'Educational Short-Form Reels'],
      icon: HeartPulse,
      color: 'from-rose-500 to-pink-600',
      stat: '+340% Consult Inquiries'
    },
    {
      id: 'real-estate',
      title: 'Real Estate & Luxury Living',
      tagline: 'High-Net-Worth Investor & Buyer Attraction',
      desc: 'Build undeniable authority for luxury developers, brokers, and architectural visionaries. We turn listings into viral cinematic tours that reach qualified investors.',
      channels: ['Cinematic Video Walkthroughs', 'LinkedIn HNW Outreach', 'Geo-Targeted Ads'],
      icon: Building,
      color: 'from-amber-500 to-orange-600',
      stat: '$24M+ Property Deals'
    },
    {
      id: 'education',
      title: 'Education & EdTech',
      tagline: 'Student Enrollment & Thought Leadership',
      desc: 'Empower edtech CEOs, university programs, and educational course creators to establish authoritative curricula and drive high-volume student enrollments.',
      channels: ['Authority Newsletters', 'YouTube Long-Form Breakdowns', 'Google Search SEO'],
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-600',
      stat: '50k+ Enrolled Students'
    },
    {
      id: 'it-saas',
      title: 'IT, SaaS & Tech Founders',
      tagline: 'B2B Category Dominance & Enterprise Pipeline',
      desc: 'Help technical founders and software executives translate complex engineering breakthroughs into compelling market movements that close enterprise contracts.',
      channels: ['LinkedIn Executive Presence', 'Product-Led SEO', 'Tech PR & Podcast Tours'],
      icon: Laptop,
      color: 'from-indigo-500 to-purple-600',
      stat: '$1.8M Avg SaaS Pipeline'
    },
    {
      id: 'ecommerce',
      title: 'E-commerce & High-Growth D2C',
      tagline: 'Founder-Led Brands & High-ROAS Media',
      desc: 'D2C brands with public founders achieve 4x higher retention and significantly lower customer acquisition costs. We merge founder authenticity with rapid paid ad scaling.',
      channels: ['TikTok/Reels Founder Vlogs', 'Meta & TikTok Performance Ads', 'Omnichannel CRO'],
      icon: ShoppingBag,
      color: 'from-emerald-500 to-teal-600',
      stat: '5.2x Average ROAS'
    },
    {
      id: 'creators',
      title: 'Keynote Speakers & Coaches',
      tagline: 'Monetize Audience Authority at High Ticket',
      desc: 'Transform your existing following into a multi-tiered monetization machine—from $15k+ keynote speaking bookings to high-ticket mastermind advisory programs.',
      channels: ['Keynote Speaker Kits', 'High-Ticket DM Funnels', 'Viral Personal Storytelling'],
      icon: Mic2,
      color: 'from-violet-500 to-fuchsia-600',
      stat: '$15k+ Keynote Inbound'
    }
  ];

  return (
    <section id="industries" className="relative py-24 md:py-32 bg-[#06080F] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Specialized Vertical Expertise
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Tailored Growth Engines For <br />
            <span className="text-gradient-cyan">High-Value Industries</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            We don't use cookie-cutter playbooks. Every industry demands nuanced compliance, distinct language, and specific acquisition funnels.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.id}
                className="rounded-2xl glass-card p-6 sm:p-7 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${ind.color} p-0.5 shadow-md group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full bg-[#0a0e18] rounded-[10px] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-emerald-400 font-bold">
                      {ind.stat}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-1 group-hover:text-cyan-200 transition-colors">
                    {ind.title}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400 mb-3">{ind.tagline}</p>
                  
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {ind.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">Core Growth Channels:</span>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {ind.channels.map((ch, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                        {ch}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={onOpenAuditModal}
                    className="text-xs font-semibold text-white group-hover:text-cyan-400 flex items-center gap-1 transition-colors"
                  >
                    <span>View {ind.title} Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
