import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import person3 from '../assets/Person_3.png';

export default function LaneProcess({ onLearnMore }) {
  const [activeStep, setActiveStep] = useState(2); // Step 3 ("Develop") is active in Reference Image 4

  const steps = [
    {
      id: 0,
      title: 'Understand your goals, values & uniqueness',
      description: 'We conduct in-depth discovery sessions to identify your core strengths, audience demographics, and authentic brand voice.'
    },
    {
      id: 1,
      title: 'Craft your positioning and messaging',
      description: 'We define your clear unique value proposition, signature storylines, and strategic framework to position you as an undisputed authority.'
    },
    {
      id: 2,
      title: 'Develop',
      description: 'We help you create authentic content, optimize your social and professional profiles, and establish a powerful online presence that reflects your values, voice, and vision—consistently.'
    },
    {
      id: 3,
      title: 'Launch your authentic personal brand',
      description: 'We execute high-impact multi-channel distribution, strategic PR placements, and ongoing engagement strategies to scale your reach.'
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-12 gap-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight leading-[1.12] font-sans">
            Our <span className="text-[#703BF7]">Coaching Process</span>, <br />
            Simplified
          </h2>

          <button
            onClick={onLearnMore}
            className="btn-lane-primary group rounded-full pl-6 pr-2.5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-4 cursor-pointer shadow-md shadow-[#703BF7]/25 w-fit"
          >
            <span>Explore Pricing</span>
            <div className="w-8 h-8 rounded-full bg-white text-[#703BF7] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-xs">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* 2-Column Process Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Interactive Steps Accordion */}
          <div className="lg:col-span-6 space-y-3">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`rounded-2xl transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#2D2D2D] text-white p-5 sm:p-6 shadow-xl shadow-neutral-900/10'
                      : 'bg-white hover:bg-neutral-50 border border-neutral-200/70 p-4 sm:p-5 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`font-semibold text-sm sm:text-base tracking-tight ${
                        isActive ? 'text-white font-bold' : 'text-neutral-700'
                      }`}
                    >
                      {step.title}
                    </span>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                        isActive
                          ? 'bg-white text-neutral-900 rotate-90 shadow-xs'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  {isActive && (
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-3.5 pr-6 font-normal animate-in fade-in duration-200">
                      {step.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Studio Discussion Photo (Person_3.png) */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-neutral-100 border border-neutral-100 relative group">
              <img
                src={person3}
                alt="ScriptX Studio Production Session"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
