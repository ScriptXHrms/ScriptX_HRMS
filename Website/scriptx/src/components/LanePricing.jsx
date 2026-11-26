import React from 'react';
import { Check, Sparkles, Video, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LanePricing({ onSelectPlan }) {
  const plans = [
    {
      id: '10',
      name: '10 Videos / month',
      price: '₹40,000',
      period: '/month',
      setup: '1 Studio Background Change',
      popular: false,
      description: 'Ideal for founders and consultants establishing their core weekly executive presence.',
      features: [
        '10 High-converting short-form videos',
        '1 Studio setup & background variation',
        '100% Done-For-You research & scriptwriting',
        'Live directed studio filming session (2 hours)',
        '4K cinematic editing, dynamic captions & sound FX',
        'Formatted for LinkedIn & Instagram Reels',
        'Monthly strategy & performance report'
      ],
      buttonText: 'Choose 10 Videos Plan',
      planLabel: '10 Videos (₹40,000/mo)'
    },
    {
      id: '15',
      name: '15 Videos / month',
      price: '₹60,000',
      period: '/month',
      setup: '2 Distinct Background Changes',
      popular: true,
      description: 'Best for CEOs and high-growth founders dominating LinkedIn & Instagram authority.',
      features: [
        '15 High-converting short-form videos',
        '2 Distinct studio backgrounds & lighting setups',
        '100% Done-For-You narrative & storytelling scripts',
        'High-retention visual hooks & custom B-roll inserts',
        '4K cinematic multi-angle editing & sound FX',
        'Multi-platform posting: LinkedIn, Instagram, YouTube Shorts',
        'Bi-weekly brand review & direct WhatsApp support',
        'Dedicated Creative Director guidance'
      ],
      buttonText: 'Choose 15 Videos Plan',
      planLabel: '15 Videos (₹60,000/mo)'
    },
    {
      id: '20',
      name: '20 Videos / month',
      price: '₹80,000',
      period: '/month',
      setup: '3 Distinct Background Changes',
      popular: false,
      description: 'For category leaders and enterprise executives demanding complete market omnipresence.',
      features: [
        '20 High-converting short-form videos',
        '3 Distinct studio backgrounds & cinematic sets',
        'Complete executive ghostwriting & strategic positioning',
        'Priority filming sprints with full creative crew',
        'Hollywood-grade color grading & kinetic typography',
        'Omnipresence distribution on LinkedIn, IG, YouTube, X',
        'Direct 24/7 WhatsApp VIP line with Creative Director',
        'Mutual NDA & enterprise confidentiality guarantee'
      ],
      buttonText: 'Choose 20 Videos Plan',
      planLabel: '20 Videos (₹80,000/mo)'
    }
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white border-t border-neutral-100 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#703BF7]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Eyebrow */}
        <div className="text-xs font-semibold text-neutral-400 tracking-wider mb-4">
          — Retainer Packages
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 sm:pb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight leading-[1.12] font-sans">
              Scalable Video Retainers <br />
              <span className="text-[#703BF7]">Built for Market Authorities</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-neutral-500 max-w-sm font-normal leading-relaxed">
            Pick the monthly volume that matches your growth goals. From scriptwriting to studio filming and multi-channel posting, 100% Done-For-You.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-14">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#FAF8FF] to-white border-2 border-[#703BF7] shadow-xl shadow-[#703BF7]/15 lg:-translate-y-2'
                  : 'bg-white border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-neutral-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#703BF7] text-white text-[10px] font-bold tracking-wider uppercase px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>Most Popular for CEOs & Leaders</span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg sm:text-xl text-neutral-900 font-sans">
                    {plan.name}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-[#703BF7]/10 flex items-center justify-center text-[#703BF7]">
                    <Video className="w-4 h-4" />
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight font-sans">
                    {plan.price}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">
                    {plan.period}
                  </span>
                </div>

                {/* Studio Setup Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#703BF7]/10 text-[#703BF7] text-xs font-semibold mb-5">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>{plan.setup}</span>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed mb-6 pb-6 border-b border-neutral-100">
                  {plan.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Included in Retainer:
                  </div>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-700 leading-snug">
                      <div className="w-4 h-4 rounded-full bg-[#703BF7]/15 text-[#703BF7] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectPlan(plan.planLabel)}
                className={`w-full rounded-full py-3.5 px-6 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  plan.popular
                    ? 'btn-lane-primary shadow-lg shadow-[#703BF7]/30'
                    : 'bg-neutral-900 hover:bg-[#703BF7] text-white'
                }`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          ))}
        </div>

        {/* Guarantee Banner below pricing */}
        <div className="p-6 rounded-3xl bg-[#FAF9FD] border border-neutral-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#703BF7]/10 text-[#703BF7] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-neutral-900 font-sans">
                Need a Custom Executive Sprint or Multi-Founder Production?
              </div>
              <div className="text-xs text-neutral-500">
                We handle private on-site studio setups, podcast series, and executive keynotes.
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('Custom Executive Retainer')}
            className="text-xs font-semibold text-[#703BF7] hover:text-[#5E2EE0] hover:underline cursor-pointer flex-shrink-0 inline-flex items-center gap-1"
          >
            <span>Request Custom Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
