import React from 'react';
import { 
  Compass, 
  PenTool, 
  Send, 
  LineChart, 
  CheckCircle, 
  Clock, 
  Zap
} from 'lucide-react';

export default function ProcessSection({ onOpenAuditModal }) {
  const steps = [
    {
      step: '01',
      title: 'Deep Discovery & Voice Extraction',
      timeframe: 'Week 1 — Onboarding',
      desc: 'We conduct a 45-minute deep-dive diagnostic session to extract your authentic worldview, career war stories, proprietary frameworks, and Ideal Customer Profile (ICP).',
      deliverables: [
        'Brand Narrative & Voice Playbook',
        'Competitor & Category White-Space Audit',
        'Custom 90-Day Content Roadmap'
      ],
      icon: Compass,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      step: '02',
      title: 'Editorial & Creative Production',
      timeframe: 'Ongoing Weekly Engine',
      desc: 'Our senior ghostwriters and video producers turn your raw ideas into punchy, high-hook LinkedIn posts, Twitter threads, viral video reels, and long-form authority newsletters.',
      deliverables: [
        '3-5 Weekly Ghostwritten Authority Pieces',
        'Custom 2D/3D Carousel & Infographic Assets',
        'Short-Form Video Scripting & Captioning'
      ],
      icon: PenTool,
      color: 'from-purple-500 to-pink-600'
    },
    {
      step: '03',
      title: 'Omnichannel Distribution & Amplification',
      timeframe: 'Continuous Algorithmic Optimization',
      desc: 'We publish at peak algorithmic windows, nurture comment sections, run precision retargeting ads to amplify winning posts, and pitch you to high-profile podcasts.',
      deliverables: [
        'Cross-Platform Scheduling (LinkedIn, X, YouTube)',
        'Strategic Commenting & Industry Engagement',
        'Top 1% Tier-1 Podcast Booking Outreach'
      ],
      icon: Send,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      step: '04',
      title: 'Inbound Conversion & Revenue Tracking',
      timeframe: 'Compounding Enterprise Pipeline',
      desc: 'We convert high-intent impressions into inbound DMs, newsletter subscribers, and qualified discovery calls scheduled straight onto your calendar.',
      deliverables: [
        'Executive DM Playbook & Lead Routing',
        'High-Converting Landing Page & Lead Magnet',
        'Monthly Attribution & Revenue ROI Dashboard'
      ],
      icon: LineChart,
      color: 'from-amber-500 to-rose-600'
    }
  ];

  return (
    <section id="process" className="relative py-24 md:py-32 bg-[#080B13] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            The Proven 4-Step Architecture
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-4">
            How We Turn 45 Mins/Week Into <br />
            <span className="text-gradient-purple">Omnipresent Authority</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            No endless review rounds. No guesswork. A battle-tested process designed specifically for busy founders and executives.
          </p>
        </div>

        {/* 4 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-2xl glass-card p-6 border border-white/10 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-black text-slate-600 group-hover:text-indigo-400 transition-colors">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/10">
                      {item.timeframe}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} p-0.5 shadow-md mb-4`}>
                    <div className="w-full h-full bg-[#0a0e18] rounded-[10px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-3 group-hover:text-indigo-200 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Key Deliverables</span>
                  {item.deliverables.map((del, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Founder Commitment Guarantee Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0e1424] via-[#10172b] to-[#0c101c] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base sm:text-lg">
                The 45-Minute Founder Guarantee
              </h4>
              <p className="text-xs sm:text-sm text-slate-400">
                You spend 45 minutes on Zoom on Monday. We deliver a complete week of thought leadership, video clips, and ad assets by Thursday.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuditModal}
            className="whitespace-nowrap px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/30"
          >
            Start Your Onboarding
          </button>
        </div>

      </div>
    </section>
  );
}
