import React from 'react';
import { ArrowRight } from 'lucide-react';
import person2 from '../assets/Person_2.jpeg';
import person3 from '../assets/Person_3.png';

export default function LaneAbout({ onRequestCall }) {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        
        {/* Section Top Eyebrow Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-10 border-b border-neutral-100 gap-3">
          <div className="text-xs font-semibold text-neutral-400 tracking-wider">
            — About ScriptX
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            <span>With over 10 years helping professionals stand out in competitive markets.</span>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Heading, Bio & CTA */}
          <div className="lg:col-span-6">
            <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight leading-[1.12] mb-6 font-sans">
              Meet ScriptX Your <br />
              <span className="text-[#703BF7]">Personal Branding Partner</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal mb-8 max-w-xl">
              With over 10 years helping founders, executives, and creators stand out in competitive markets, ScriptX specializes in crafting authentic personal brands that align with your career goals, values, and personality. Whether you're a corporate executive, doctor, tech founder, or thought leader—we'll guide you to discover your unique voice and communicate it with confidence.
            </p>

            <button
              onClick={onRequestCall}
              className="btn-lane-primary group rounded-full pl-6 pr-2.5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-4 cursor-pointer shadow-md shadow-[#703BF7]/25 w-fit"
            >
              <span>Request a Call</span>
              <div className="w-8 h-8 rounded-full bg-white text-[#703BF7] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-xs">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>
          </div>

          {/* Right Column: Visual Composite with Person_2.jpeg and Person_3.png */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Portrait / Studio Photo (Person_2.jpeg with face clearly visible and lifted up) */}
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] sm:aspect-[16/11] border border-neutral-100 bg-neutral-100 relative group">
                <img
                  src={person2}
                  alt="ScriptX Personal Branding Creator"
                  className="w-full h-full object-cover object-[center_32%] transition-transform duration-700 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/30 to-transparent pointer-events-none" />
              </div>

              {/* Floating Highlight Card on Top-Right (Person_3.png) */}
              <div className="absolute -top-6 -right-3 sm:-right-6 w-56 sm:w-64 bg-white rounded-2xl p-4 sm:p-5 card-soft-shadow border border-neutral-100 z-10 animate-in fade-in zoom-in-95 duration-500 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#703BF7]/15 flex items-center justify-center text-[#703BF7]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#703BF7]" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#703BF7]" />
                    <span>Worldwide</span>
                  </div>
                </div>

                {/* Small Thumbnail (Person_3.png) */}
                <div className="rounded-xl overflow-hidden h-20 mb-3 bg-neutral-100 border border-neutral-200/60">
                  <img
                    src={person3}
                    alt="ScriptX Studio Production"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug mb-1">
                  Bestselling Authority
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-relaxed">
                  Techniques and principles crafted specifically for founders, leaders, and creators.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
