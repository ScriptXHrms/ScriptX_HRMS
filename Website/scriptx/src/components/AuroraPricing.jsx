import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Palette,
  ArrowRight
} from 'lucide-react';

export default function AuroraPricing({ onOpenBooking, selectedPlan: externalPlan }) {
  const [selectedPlan, setSelectedPlan] = useState(externalPlan || '15'); // '10', '15', '20'

  const plans = {
    '10': {
      videos: 10,
      price: '₹40,000',
      priceNum: '40K',
      regularPrice: '₹55,000',
      period: 'per month',
      badge: 'Starter Brand Engine',
      bgChanges: '1 Studio Background Setup',
      bgDetail: 'Clean cinematic studio or executive office background with professional key & rim lighting.',
      highlight: false,
      deliverables: [
        '10 High-Retention Scripted Videos / Month',
        '1 Distinct Cinematic Background Setup',
        '100% Done-For-You Executive Scriptwriting & Storyboards',
        'Studio-Grade Editing: Dynamic Cuts, Sound FX & Motion Captions',
        'Custom Click-Optimized Thumbnails & Creative Covers',
        'Publishing on LinkedIn + Instagram + YouTube Shorts',
        'Bi-Weekly Strategic Analytics & Reach Review'
      ]
    },
    '15': {
      videos: 15,
      price: '₹60,000',
      priceNum: '60K',
      regularPrice: '₹85,000',
      period: 'per month',
      badge: '★ Most Popular for Founders & CEOs',
      bgChanges: '2 Distinct Background Changes',
      bgDetail: 'Switch between 2 premium environments (e.g. Executive Boardroom + Moody Podcast / Tech Studio Set).',
      highlight: true,
      deliverables: [
        '15 High-Retention Scripted Videos / Month',
        '2 Distinct Background Changes (Multi-Angle Aesthetic)',
        'Everything in 10-Video Plan +',
        'Viral Hook Vault: Tailored 3-Second Scroll-Stopping Openers',
        'Custom 2D/3D Motion Graphic Overlays & Brand Graphics',
        'Direct Message (DM) Inbound Lead Capture Playbook',
        'Dedicated Senior Content Director & Priority Turnaround'
      ]
    },
    '20': {
      videos: 20,
      price: '₹80,000',
      priceNum: '80K',
      regularPrice: '₹1,20,000',
      period: 'per month',
      badge: 'Enterprise Market Dominance',
      bgChanges: '3 Distinct Background Changes',
      bgDetail: 'Full 3-environment cinematic variety (e.g. Studio Interview + Whiteboard Teardown + Casual Lounge Vibe).',
      highlight: false,
      deliverables: [
        '20 High-Retention Scripted Videos / Month (Daily Mon-Fri)',
        '3 Distinct Background Changes (Full Visual Variety)',
        'Everything in 15-Video Plan +',
        'Podcast / Fireside Interview Video Repurposing',
        'Omnichannel Funnel Integration (LinkedIn, IG, YT Shorts, X)',
        'Inbound Sales Pipeline Tracking & Monthly Attribution',
        '24/7 VIP WhatsApp Priority Lane with Agency Founders'
      ]
    }
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleButtonClick = (planKey, e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSelectedPlan(planKey);
    if (onOpenBooking) {
      onOpenBooking(planKey);
    }
  };

  return (
    <section id="pricing" className="py-24 md:py-36 bg-[#F4F4F2] relative overflow-hidden text-[#111418] border-t border-black/5">
      
      {/* Background Soft Atmospheric Ambient Lights in Light Violet & Gold */}
      <div className="absolute top-1/4 left-1/4 w-[650px] h-[550px] bg-[#40108c]/6 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[450px] bg-[#f3c72b]/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/10 text-[#40108c] text-xs font-semibold mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f3c72b]" />
            <span>TRANSPARENT AGENCY PACKAGES • SCRIPTX RETAINERS</span>
          </div>

          <h2 className="font-headline text-4xl sm:text-6xl text-[#111418] tracking-tight leading-[1.08]">
            One predictable investment. <br />
            <span className="font-serif-display italic font-normal text-[#40108c]">
              A complete Done-For-You video engine.
            </span>
          </h2>
          <p className="text-[#6B7280] text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Choose your monthly volume. We handle 100% of the scripting, shoot direction, editing, and distribution. You only invest 2 hours a month.
          </p>

          {/* Interactive Tier Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 p-1.5 rounded-full bg-white border border-black/10 shadow-sm max-w-md mx-auto">
            {[
              { id: '10', label: '10 Videos', price: '₹40K', bg: '1 Background' },
              { id: '15', label: '15 Videos ★', price: '₹60K', bg: '2 Backgrounds' },
              { id: '20', label: '20 Videos', price: '₹80K', bg: '3 Backgrounds' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSelectPlan(tab.id)}
                className={`flex-1 py-2.5 px-3 rounded-full text-xs font-headline font-bold transition-all duration-300 flex flex-col items-center gap-0.5 cursor-pointer ${
                  selectedPlan === tab.id
                    ? 'btn-brand-gradient text-white shadow-md scale-105 border-[#f3c72b]'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono ${selectedPlan === tab.id ? 'text-[#f3c72b]' : 'text-[#40108c]'}`}>
                  {tab.price}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 Tier Cards Side-by-Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 items-stretch">
          
          {/* Card 1: 10 Videos / 40K */}
          <div 
            onClick={() => setSelectedPlan('10')}
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer border bg-white ${
              selectedPlan === '10'
                ? 'border-2 border-[#40108c] shadow-[0_20px_50px_rgba(64,16,140,0.15)] ring-2 ring-[#40108c]/20 scale-[1.02] z-10'
                : 'border-black/10 shadow-paper hover:shadow-paper-lg hover:border-black/20'
            }`}
          >
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#40108c] block mb-2 font-bold">
                TIER 01 • STARTER
              </span>
              <h3 className="font-headline font-black text-2xl text-[#111418]">10 Videos</h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Ideal for busy founders starting their video presence.
              </p>

              <div className="p-3.5 rounded-xl bg-[#FAF8FC] border border-[#40108c]/15 mb-6">
                <span className="text-[10px] font-mono text-[#40108c] font-bold block uppercase tracking-wider">
                  Studio Background Setup:
                </span>
                <span className="font-bold text-sm text-[#111418] flex items-center gap-1.5 mt-0.5">
                  <Palette className="w-4 h-4 text-[#40108c]" />
                  1 Studio Background Change
                </span>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif-display text-4xl text-[#111418] italic font-bold">
                    ₹40,000
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">/ month</span>
                </div>
                <span className="text-[10px] text-neutral-400 line-through">Regular ₹55,000</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-neutral-100 text-xs text-neutral-700">
                {plans['10'].deliverables.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => handleButtonClick('10', e)}
              className={`w-full mt-8 py-3.5 rounded-full text-xs font-headline font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedPlan === '10'
                  ? 'btn-brand-gradient text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              <span>Get Started with 10 Videos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: 15 Videos / 60K [HIGHLIGHTED - MOST POPULAR] */}
          <div 
            onClick={() => setSelectedPlan('15')}
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer border-2 relative ${
              selectedPlan === '15'
                ? 'bg-gradient-to-b from-[#FAF8FC] via-white to-white border-[#40108c] shadow-[0_25px_60px_rgba(64,16,140,0.18)] scale-[1.04] z-10 ring-2 ring-[#40108c]/25'
                : 'bg-white border-[#40108c]/40 hover:border-[#40108c] shadow-paper hover:shadow-paper-lg'
            }`}
          >
            {/* Top Recommended Pill */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full btn-brand-gradient text-white text-[10px] font-headline font-black uppercase tracking-wider shadow-lg whitespace-nowrap flex items-center gap-1 border border-[#f3c72b]">
              <span className="text-[#f3c72b]">★</span>
              <span>MOST POPULAR FOR CEOS & LEADERS</span>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#40108c] block mb-2 font-bold">
                TIER 02 • AUTHORITY GROWTH
              </span>
              <h3 className="font-headline font-black text-2xl text-[#111418]">15 Videos</h3>
              <p className="text-xs text-neutral-600 mt-1 mb-4">
                The optimal velocity to trigger algorithmic compounding.
              </p>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#40108c]/8 to-[#f3c72b]/15 border border-[#40108c]/25 mb-6">
                <span className="text-[10px] font-mono text-[#40108c] font-bold block uppercase tracking-wider">
                  Studio Background Setup:
                </span>
                <span className="font-bold text-sm text-[#111418] flex items-center gap-1.5 mt-0.5">
                  <Palette className="w-4 h-4 text-[#40108c]" />
                  2 Distinct Background Changes
                </span>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Switch between 2 professional sets (e.g. Boardroom + Moody Studio).
                </p>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif-display text-5xl text-[#40108c] italic font-bold">
                    ₹60,000
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">/ month</span>
                </div>
                <span className="text-[10px] text-neutral-400 line-through">Regular ₹85,000</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-neutral-100 text-xs text-neutral-800 font-medium">
                {plans['15'].deliverables.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#40108c] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => handleButtonClick('15', e)}
              className="w-full mt-8 py-3.5 rounded-full btn-brand-gradient text-white text-xs font-headline font-bold shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-[#f3c72b]/70"
            >
              <span>Get Started with 15 Videos &rarr;</span>
            </button>
          </div>

          {/* Card 3: 20 Videos / 80K */}
          <div 
            onClick={() => setSelectedPlan('20')}
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer border bg-white ${
              selectedPlan === '20'
                ? 'border-2 border-[#40108c] shadow-[0_20px_50px_rgba(64,16,140,0.15)] ring-2 ring-[#40108c]/20 scale-[1.02] z-10'
                : 'border-black/10 shadow-paper hover:shadow-paper-lg hover:border-black/20'
            }`}
          >
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#40108c] block mb-2 font-bold">
                TIER 03 • MARKET DOMINANCE
              </span>
              <h3 className="font-headline font-black text-2xl text-[#111418]">20 Videos</h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Full omnipresent dominance: 1 video every single business day.
              </p>

              <div className="p-3.5 rounded-xl bg-[#FAF8FC] border border-[#40108c]/15 mb-6">
                <span className="text-[10px] font-mono text-[#40108c] font-bold block uppercase tracking-wider">
                  Studio Background Setup:
                </span>
                <span className="font-bold text-sm text-[#111418] flex items-center gap-1.5 mt-0.5">
                  <Palette className="w-4 h-4 text-[#40108c]" />
                  3 Distinct Background Changes
                </span>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Maximum visual variety across 3 unique cinematic locations/sets.
                </p>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif-display text-4xl text-[#111418] italic font-bold">
                    ₹80,000
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">/ month</span>
                </div>
                <span className="text-[10px] text-neutral-400 line-through">Regular ₹1,20,000</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-neutral-100 text-xs text-neutral-700">
                {plans['20'].deliverables.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => handleButtonClick('20', e)}
              className={`w-full mt-8 py-3.5 rounded-full text-xs font-headline font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedPlan === '20'
                  ? 'btn-brand-gradient text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              <span>Get Started with 20 Videos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
