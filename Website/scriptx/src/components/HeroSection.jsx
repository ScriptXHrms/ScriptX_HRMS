import React, { useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  Play, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Flame, 
  Star 
} from 'lucide-react';
import gsap from 'gsap';

export default function HeroSection({ onOpenAuditModal, onOpenVideoModal }) {
  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro animations
      gsap.from(headlineRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2
      });

      gsap.from(subtextRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.4
      });

      gsap.from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.6
      });

      gsap.from(visualRef.current, {
        scale: 0.94,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.5
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-radial-gradient">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none -z-10" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-lg shadow-indigo-950/40 hover:border-indigo-400/50 transition-colors cursor-pointer group">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white tracking-wide">Top-Tier Digital Marketing & Personal Branding</span>
            <span className="text-slate-500">|</span>
            <span className="text-indigo-300 group-hover:text-indigo-200 flex items-center gap-1">
              ScriptX Authority Engine <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 ref={headlineRef} className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.08] mb-6">
            Turn Quiet Expertise Into <br />
            <span className="text-gradient-purple">Personal Brand</span> &{' '}
            <span className="text-gradient-cyan">Inbound Revenue.</span>
          </h1>

          <p ref={subtextRef} className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto mb-9">
            We partner with Founders, Executives, and Growing Companies to build category-defining personal brands, run high-converting digital marketing, and turn organic authority into a predictable pipeline.
          </p>

          {/* Action Buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={onOpenAuditModal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Book A Free Strategy Audit</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <a
              href="#case-studies"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#111726]/90 hover:bg-[#161e33] border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>View Case Studies (380% Avg ROI)</span>
            </a>

            <button
              onClick={onOpenVideoModal}
              className="w-full sm:w-auto px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Play className="w-3 h-3 fill-indigo-400 ml-0.5" />
              </div>
              <span>Watch 2-Min Breakdown</span>
            </button>
          </div>

          {/* Micro trust features */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>45 Mins/Week Founder Input</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Guaranteed Content Authority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No 6-Month Lock-ins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-slate-300 font-semibold">4.9/5 from 120+ Founders</span>
            </div>
          </div>
        </div>

        {/* Visual Showcase: High-Authority Command Center Bento */}
        <div ref={visualRef} className="mt-14 max-w-5xl mx-auto relative">
          {/* Glowing frame backdrop */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-500/30 blur-xl opacity-60"></div>
          
          <div className="relative rounded-2xl glass-card p-4 sm:p-6 shadow-2xl border border-white/10 overflow-hidden">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="ml-3 text-xs font-mono text-slate-400">scriptx-authority-engine.app / personal-brand-metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE AUDIENCE ENGINE
                </span>
              </div>
            </div>

            {/* Grid Metrics & Authority Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Executive Profile Card */}
              <div className="rounded-xl bg-[#0a0e18]/90 p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                        alt="Client Founder" 
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/60 p-0.5"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1 text-white">
                        <Award className="w-3 h-3" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm">Elena Rostova</h4>
                        <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                      </div>
                      <p className="text-xs text-indigo-300 font-medium">B2B AI SaaS Founder & CEO</p>
                      <p className="text-[11px] text-slate-400">Personal Brand Retainer: Month 6</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Organic Reach</span>
                      <span className="font-bold text-emerald-400">+14.2M views</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Inbound Booked Calls</span>
                      <span className="font-bold text-white">287 Qualified DMs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Pipeline Generated</span>
                      <span className="font-bold text-indigo-300 font-mono">$1.84M USD</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Top 0.1% Creator on LinkedIn
                  </span>
                  <span>99.4% CSAT</span>
                </div>
              </div>

              {/* Mid Growth Metric Chart Mockup */}
              <div className="rounded-xl bg-[#0a0e18]/90 p-5 border border-white/5 md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">Multi-Channel Distribution</span>
                      <h4 className="text-base font-bold text-white">Audience Growth & Inbound Lead Conversion</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-medium">
                        ScriptX Managed
                      </span>
                    </div>
                  </div>

                  {/* Visual simulated growth bars */}
                  <div className="grid grid-cols-6 gap-2 items-end h-28 my-2 pt-4 px-2">
                    <div className="flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full bg-slate-800 rounded-t h-[20%] transition-all"></div>
                      <span className="text-[10px] text-slate-500 font-mono">M1</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full bg-indigo-900/60 rounded-t h-[35%] transition-all"></div>
                      <span className="text-[10px] text-slate-500 font-mono">M2</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full bg-indigo-700/70 rounded-t h-[52%] transition-all"></div>
                      <span className="text-[10px] text-slate-500 font-mono">M3</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full bg-indigo-600 rounded-t h-[68%] transition-all"></div>
                      <span className="text-[10px] text-slate-500 font-mono">M4</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full bg-indigo-500 rounded-t h-[82%] transition-all"></div>
                      <span className="text-[10px] text-slate-500 font-mono">M5</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t h-[100%] transition-all relative group">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-cyan-300 bg-cyan-950/80 px-1 rounded border border-cyan-500/40 whitespace-nowrap">
                          +430%
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-bold font-mono">M6</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
                  <div className="p-2 rounded-lg bg-white/[0.02]">
                    <p className="text-[10px] text-slate-400">Total Impressions</p>
                    <p className="text-sm font-bold text-white font-mono">24.5M+</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02]">
                    <p className="text-[10px] text-slate-400">Avg Engagement Rate</p>
                    <p className="text-sm font-bold text-emerald-400 font-mono">5.82%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02]">
                    <p className="text-[10px] text-slate-400">Customer Acq. Cost</p>
                    <p className="text-sm font-bold text-cyan-300 font-mono">-64% Lower</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Floating Pill Highlights */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>Active Channels: <strong>LinkedIn • X (Twitter) • YouTube Shorts • Meta Ads • Newsletter</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Recent Win:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Forbes Feature Secured
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  $48k Deal Closed from single post
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Social Proof Brand Marquee */}
        <div className="mt-16 pt-10 border-t border-white/5">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 font-mono mb-6">
            TRUSTED BY FOUNDERS & EXECUTIVES FEATURED ACROSS TOP ECOSYSTEMS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-display font-black text-lg tracking-wider text-slate-400">Y COMBINATOR</span>
            <span className="font-display font-black text-lg tracking-wider text-slate-400">FORBES 30U30</span>
            <span className="font-display font-black text-lg tracking-wider text-slate-400">TECHCRUNCH</span>
            <span className="font-display font-black text-lg tracking-wider text-slate-400">TEDx SPEAKER</span>
            <span className="font-display font-black text-lg tracking-wider text-slate-400">SEQUOIA BACKED</span>
            <span className="font-display font-black text-lg tracking-wider text-slate-400">INC. 5000</span>
          </div>
        </div>

      </div>
    </section>
  );
}
