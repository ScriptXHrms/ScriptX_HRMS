import React, { useState } from 'react';
import { 
  Laptop, 
  Stethoscope, 
  Film, 
  Briefcase,
  ChevronRight,
  ArrowRight,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PathSection({ onEnrollClick }) {
  const [selectedPersona, setSelectedPersona] = useState(0);

  const personas = [
    {
      id: 'engineer',
      role: 'Software Engineer',
      icon: Laptop,
      emoji: '💻',
      color: '#40108c',
      accentColor: '#f3c72b',
      pathD: 'M 40 100 Q 180 20 320 100 T 600 100',
      pointABadge: 'Zero Social Presence • Anonymous Developer',
      pointBBadge: 'Top 1% Tech Voice • $5k/mo Advisory Inbound',
      oneLiner: 'From anonymous code ticket pusher to the go-to technical voice engineering leaders and VC startups actively recruit.',
      metricGain: '+4,800% Higher Inbound Opportunity Volume',
      transformation: '300 Github stars & 0 reach ➔ 80k LinkedIn followers & $5k/mo advisory'
    },
    {
      id: 'doctor',
      role: 'Doctor & Healthcare',
      icon: Stethoscope,
      emoji: '🩺',
      color: '#27C93F',
      accentColor: '#40108c',
      pathD: 'M 40 100 C 150 160, 250 10, 380 90 S 520 30 600 100',
      pointABadge: 'Restricted Local Clinic • Repetitive Patient Fatigue',
      pointBBadge: 'National Medical Authority • Booked Out Private Consults',
      oneLiner: 'From explaining the same medical condition 40 times a day in clinics to educating 500,000 patients online with trusted credibility.',
      metricGain: '3-Month Waitlist for Private Consultations',
      transformation: 'Local clinic practice ➔ National authority & private telehealth waitlist'
    },
    {
      id: 'creative',
      role: 'Filmmaker & Video Editor',
      icon: Film,
      emoji: '🎬',
      color: '#40108c',
      accentColor: '#f3c72b',
      pathD: 'M 40 100 Q 150 190 300 50 T 600 100',
      pointABadge: 'Fiverr / Upwork Price Competition • ₹15k Per Project',
      pointBBadge: 'Direct Brand Ambassador • ₹2,00,000 Sponsorship Deals',
      oneLiner: 'From begging cheap clients on freelance marketplaces to receiving ₹2,00,000 brand sponsorships from premier camera and software companies.',
      metricGain: '12x Increase in Average Client Contract Size',
      transformation: 'Client burnout on Upwork ➔ Retainer brand ambassador & digital assets'
    },
    {
      id: 'founder',
      role: 'Business Owner & Founder',
      icon: Briefcase,
      emoji: '🏢',
      color: '#FFD93D',
      accentColor: '#f3c72b',
      pathD: 'M 40 100 Q 200 30 350 130 T 600 100',
      pointABadge: 'Burning ₹2L/mo on Cold Paid Ads • Faceless Brand',
      pointBBadge: 'High-Trust Founder Gravity • 4x Closing Rate',
      oneLiner: 'From burning ₹2,00,000/mo on cold paid ads to generating effortless inbound qualified pipeline through public founder authority.',
      metricGain: '-62% Customer Acquisition Cost via Organic Gravity',
      transformation: 'Faceless company logo ➔ High-trust founder moat with 4x deal conversion'
    }
  ];

  const current = personas[selectedPersona];

  return (
    <section className="py-24 md:py-36 bg-[#EDEEEC] border-t border-black/5 overflow-hidden">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-black/5 text-[#40108c] text-xs font-semibold uppercase tracking-wider mb-3">
            <Target className="w-3.5 h-3.5 text-[#f3c72b]" />
            <span>The Transformation Architecture</span>
          </div>
          
          <h2 className="font-headline text-3xl sm:text-5xl text-[#111418] tracking-tight">
            The Executive Trajectory, <br />
            <span className="font-serif-display italic font-normal text-4xl sm:text-6xl text-[#40108c]">
              in one single line.
            </span>
          </h2>
          <p className="text-neutral-600 text-sm mt-3">
            Select your background on the left to see your bespoke Done-For-You brand roadmap.
          </p>
        </div>

        {/* Master Interactive Showcase Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white rounded-3xl p-6 sm:p-10 shadow-paper-lg border border-black/5">
          
          {/* Persona List on Left (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold tracking-wider block mb-3 px-1">
                Select Your Starting Archetype:
              </span>

              <div className="space-y-2.5">
                {personas.map((p, idx) => {
                  const isSelected = selectedPersona === idx;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersona(idx)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border flex items-center justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#190d2e] to-[#110722] text-white border-[#f3c72b]/60 shadow-xl scale-[1.02]'
                          : 'bg-[#F9F9F7] text-neutral-700 border-black/5 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm ${isSelected ? 'bg-white/10' : 'bg-white'}`}>
                          {p.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline font-bold text-sm sm:text-base">{p.role}</h4>
                            {isSelected && (
                              <span className="px-2 py-0.2 rounded-full bg-[#40108c] text-[#f3c72b] border border-[#f3c72b]/40 text-[9px] font-bold font-mono">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            {p.transformation}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#FFD93D] translate-x-1' : 'text-neutral-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#40108c]/10 to-[#f3c72b]/10 border border-[#f3c72b]/30 text-xs">
              <span className="font-bold text-[#40108c] block mb-1">
                ⚡ Tailored Playbook Included
              </span>
              <p className="text-neutral-600 text-[11px]">
                Every student receives their niche-specific viral hook vault, DM closing templates, and pricing formulas.
              </p>
            </div>
          </div>

          {/* Right A to B Trajectory Laboratory (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-gradient-to-b from-[#FAF8FC] to-[#F5F2F9] rounded-2xl p-6 sm:p-8 border border-black/5 shadow-inner">
            
            {/* Top Bar with Badges */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-black/5 gap-2 text-xs">
              <span className="font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                Trajectory Engine
              </span>
              <span className="px-3 py-1 rounded-full btn-brand-gradient text-white font-bold text-[11px] shadow-sm">
                {current.role} Trajectory
              </span>
            </div>

            {/* A to B Visualizer Canvas with Radiant Node B */}
            <div className="relative py-12 my-6">
              
              {/* Node A (Where you start) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-300 shadow-md flex items-center justify-center text-2xl">
                  {current.emoji}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 text-[10px] font-mono font-bold mt-2 whitespace-nowrap shadow-sm">
                  Point A: Unknown
                </span>
              </div>

              {/* Glowing SVG Wave Path */}
              <svg className="w-full h-36 overflow-visible" viewBox="0 0 640 200">
                <path
                  d={current.pathD}
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                <motion.path
                  key={selectedPersona}
                  d={current.pathD}
                  stroke={current.color}
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              </svg>

              {/* Node B (Where you finish) with pulsing gold rays */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="relative">
                  <span className="absolute -inset-3 rounded-2xl bg-[#40108c] animate-ping opacity-35"></span>
                  <div className="w-14 h-14 rounded-2xl bg-[#110722] text-[#f3c72b] border-2 border-[#f3c72b] shadow-xl flex items-center justify-center text-2xl relative z-10">
                    👑
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#110722] text-[#f3c72b] text-[10px] font-mono font-bold mt-2 whitespace-nowrap shadow-sm border border-[#f3c72b]/50">
                  Point B: Category Authority
                </span>
              </div>

            </div>

            {/* Comparative Breakdown & Metric Gain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-rose-200/60">
                <span className="text-[10px] font-mono text-rose-600 font-bold uppercase block mb-1">
                  ✕ Before ScriptX Partnership:
                </span>
                <p className="text-neutral-700 font-medium">{current.pointABadge}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-sm">
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase block mb-1">
                  ✓ With ScriptX Video Engine:
                </span>
                <p className="text-neutral-900 font-bold">{current.pointBBadge}</p>
              </div>
            </div>

            {/* One-Liner Box with Button */}
            <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#40108c] font-bold block mb-1 tracking-wider">
                  Your Definitive Shift:
                </span>
                <p className="font-headline font-bold text-sm sm:text-base text-[#111418] leading-snug">
                  "{current.oneLiner}"
                </p>
              </div>
              <a
                href="#pricing"
                onClick={onEnrollClick}
                className="whitespace-nowrap px-5 py-2.5 rounded-full btn-brand-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md self-end sm:self-auto hover:scale-105 active:scale-95 transition-all"
              >
                <span>Claim Retainer Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
