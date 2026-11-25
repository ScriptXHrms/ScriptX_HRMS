import React from 'react';
import { 
  Target, 
  Lightbulb, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Lock, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

export default function AboutSection({ onOpenAuditModal }) {
  const teamMembers = [
    {
      name: 'Logeshwaran K.',
      role: 'Founder & Chief Growth Architect',
      specialty: 'Executive Narrative & Performance Systems',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      badge: 'Agency Founder'
    },
    {
      name: 'Samantha Vance',
      role: 'Director of Executive Ghostwriting',
      specialty: 'Ex-Forbes Contributor & LinkedIn Top Voice Strategist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      badge: 'Editorial Lead'
    },
    {
      name: 'David Reynolds',
      role: 'Head of Paid Media & Ad Funnels',
      specialty: '$18M+ Managed Meta & Google Ad Spend',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      badge: 'Performance Lead'
    },
    {
      name: 'Aisha Al-Mansoor',
      role: 'Creative Director & Web Experience',
      specialty: 'High-Converting UI/UX & Brand Systems',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      badge: 'Design Director'
    }
  ];

  const pillars = [
    {
      title: '95% Done-For-You Leverage',
      desc: 'You invest just 45 minutes once a week. We extract your genius, draft your copy, produce your videos, and manage inbound conversations.',
      icon: Clock,
      color: 'text-indigo-400'
    },
    {
      title: 'Zero AI Slop • 100% Authentic Voice',
      desc: 'No generic ChatGPT clones. We spend deep hours studying your tonality, perspective, and core stories so every word resonates with genuine human nuance.',
      icon: Sparkles,
      color: 'text-amber-400'
    },
    {
      title: 'Obsessed with Pipeline & Revenue',
      desc: 'Vanity follower counts do not pay bills. We connect your personal brand directly into closed deals, speaking fees, and measurable client pipeline.',
      icon: TrendingUp,
      color: 'text-emerald-400'
    },
    {
      title: 'Absolute Discretion & Brand Safety',
      desc: 'We sign strict non-disclosure agreements with all clients. Your private company data and proprietary IP remain 100% protected at all times.',
      icon: Lock,
      color: 'text-cyan-400'
    }
  ];

  return (
    <section id="about" className="relative py-24 md:py-32 bg-[#06080F] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            About ScriptX Agency
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-4">
            We Turn Quiet Experts Into <br />
            <span className="text-gradient-purple">Industry Celebrities.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            ScriptX was founded on a simple realization: In the age of AI noise and faceless companies, the ultimate unfair advantage in business is an iconic, trusted Personal Brand.
          </p>
        </div>

        {/* Mission & Vision Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          
          {/* Mission */}
          <div className="rounded-2xl glass-card p-6 sm:p-8 border border-white/10 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-indigo-400 font-semibold tracking-wider uppercase block mb-1">
              OUR MISSION
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-3">
              Democratizing Executive Influence
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Our mission is to help exceptional founders, executives, and builders capture the market attention they genuinely deserve. We dismantle the friction of content creation so leaders can build enduring digital assets and compounding business leverage.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Authentic storytelling backed by mathematical performance marketing.</span>
            </div>
          </div>

          {/* Vision */}
          <div className="rounded-2xl glass-card p-6 sm:p-8 border border-white/10 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Lightbulb className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-purple-400 font-semibold tracking-wider uppercase block mb-1">
              OUR VISION FOR 2026+
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-3">
              The Founder Is The New Marketing Department
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Traditional company pages get 1/10th the engagement of human profiles. By 2027, the most valuable companies will be steered by public-facing founders who command trust, attract top-1% talent, and close enterprise deals through organic gravity.
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Personal reputation is the only moat that software cannot duplicate.</span>
            </div>
          </div>

        </div>

        {/* Why Choose Us - 4 Pillars */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">The ScriptX Standard</span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              Why Founders Choose To Build With Us
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="rounded-xl bg-[#0c101c] p-6 border border-white/5 hover:border-indigo-500/30 transition-all duration-300">
                  <div className={`mb-4 ${p.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-white mb-2">{p.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Details */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">The Brain Trust</span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
                Meet Your Dedicated Growth Team
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2 sm:mt-0">
              You are backed by senior operators, ex-journalists, viral media strategists, and multi-million dollar ad buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="rounded-xl glass-card p-5 border border-white/5 hover:border-white/10 group transition-all text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-400 transition-all"
                  />
                  <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] text-white font-mono font-medium shadow-md">
                    {member.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">{member.name}</h4>
                <p className="text-xs text-indigo-400 font-medium mb-2">{member.role}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{member.specialty}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onOpenAuditModal}
              className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              <span>Work Directly With Our Senior Team</span>
              <ArrowUpRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
