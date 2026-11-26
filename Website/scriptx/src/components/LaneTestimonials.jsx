import React, { useState } from 'react';
import { Link2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LaneTestimonials() {
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "Before working with ScriptX, I struggled to articulate what made me unique. Now, my personal brand speaks for me—even before I enter the room.",
      name: 'David R.',
      role: 'Marketing Strategist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 2,
      quote: "Thanks to your coaching, I finally have a LinkedIn profile and personal website that reflect who I am. I've already received two job offers within weeks!",
      name: 'Nadia S.',
      role: 'UX Designer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 3,
      quote: "I used to feel invisible in my industry. Now I get invited to podcasts, panels, and conferences—just by showing up as my authentic self. Your process works.",
      name: 'James T.',
      role: 'Tech Consultant',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
    }
  ];

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-[#FAF9FD] border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold text-neutral-400 tracking-wider mb-3">
            Testimonials
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight leading-[1.12] mb-4 font-sans">
            What My Clients Are Saying
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-lg mx-auto">
            Hear from professionals who've transformed their careers and confidence through personal branding.
          </p>
        </div>

        {/* 3 Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveSlide(idx)}
              className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between cursor-pointer ${
                activeSlide === idx
                  ? 'border-[#703BF7]/50 shadow-md ring-2 ring-[#703BF7]/20 -translate-y-1'
                  : 'border-neutral-200/60 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                {/* Card Top Row: Link Icon & Quotes */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-3xl font-serif text-neutral-200 select-none leading-none">
                    ““
                  </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 font-normal">
                  {item.quote}
                </p>
              </div>

              {/* Author Row */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-100"
                />
                <div>
                  <div className="font-bold text-xs sm:text-sm text-neutral-900 leading-tight">
                    {item.name}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Pagination Controls (Exact match to Reference Images 7 & 8) */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveSlide(prev => (prev > 0 ? prev - 1 : testimonials.length - 1))}
            className="w-9 h-9 rounded-full border border-neutral-300 hover:border-neutral-400 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous Page"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            onClick={() => setActiveSlide(prev => (prev < testimonials.length - 1 ? prev + 1 : 0))}
            className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            aria-label="Next Page"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

      </div>
    </section>
  );
}
