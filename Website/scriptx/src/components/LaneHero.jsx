import React from 'react';
import { ArrowRight, UserCheck, Users, Handshake, Award } from 'lucide-react';
import LaneNavbar from './LaneNavbar';
import person1 from '../assets/Person_1.jpeg';

export default function LaneHero({ onRequestCall, onBookConsultation }) {
  const stats = [
    {
      icon: UserCheck,
      number: '200+',
      label: 'Successful Mentors'
    },
    {
      icon: Users,
      number: '6M+',
      label: 'Followers Generated'
    },
    {
      icon: Handshake,
      number: '3k+',
      label: 'Satisfied Clients'
    },
    {
      icon: Award,
      number: '500+',
      label: 'Branding Projects'
    }
  ];

  return (
    <section id="home" className="relative min-h-[720px] md:min-h-[820px] flex flex-col justify-between overflow-hidden bg-neutral-950 text-white">
      
      {/* Studio Background Image with Person_1 flipped and positioned inside the target hero area */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={person1}
          alt="ScriptX Personal Branding Creator"
          className="w-full h-full object-cover object-[18%_28%] scale-x-[-1] opacity-80 transition-transform duration-1000"
        />
        {/* Dark Vignette & Soft Gradient from left for optimal headline contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/50 to-transparent" />
        {/* Subtle Brand Purple Light Glow in Upper Left and Lower Center */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#703BF7]/20 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Floating Glass Navbar */}
      <LaneNavbar onBookConsultation={onBookConsultation} />

      {/* Main Hero Center-Left Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 w-full pt-36 sm:pt-44 md:pt-48 pb-12 flex-grow flex flex-col justify-center">
        <div className="max-w-2xl">
          
          {/* Main Headline from Reference Image 1 */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-8 font-sans drop-shadow-md">
            You're More Than a Brand. <br />
            <span className="text-white">You're a Movement.</span>
          </h1>

          {/* Action Button & Subtext Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            <button
              onClick={onRequestCall}
              className="btn-lane-glass group rounded-full pl-6 pr-2.5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-4 cursor-pointer shadow-lg hover:border-white/50 w-fit"
            >
              <span>Request a Call</span>
              <div className="w-8 h-8 rounded-full bg-white text-[#703BF7] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-xs">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>

            <p className="text-xs sm:text-sm text-neutral-300/90 max-w-xs font-normal leading-relaxed">
              Helping you turn connections into opportunities through authentic branding.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Metrics Bar (Image 1 Bottom Overlay) */}
      <div className="relative z-10 border-t border-white/10 bg-neutral-950/40 backdrop-blur-md py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none font-sans">
                    {item.number}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-300/85 mt-1 font-medium">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
