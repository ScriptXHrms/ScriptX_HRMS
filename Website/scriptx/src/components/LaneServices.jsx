import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import person1 from '../assets/Person_1.jpeg';
import person2 from '../assets/Person_2.jpeg';
import person3 from '../assets/Person_3.png';
import person4 from '../assets/Person_4.png';

export default function LaneServices({ onBookCall }) {
  const [activeCard, setActiveCard] = useState(0);

  // Mapped according to user request:
  // Card 1 marked '4' -> Person_4.png
  // Card 2 marked '2' -> Person_2.jpeg
  // Card 3 marked '1' -> Person_1.jpeg
  // Card 4 marked '3' -> Person_3.png
  const services = [
    {
      id: 0,
      date: '15/09/2024',
      title: 'Brand Discovery Session',
      description: 'Gain clarity on your strengths, values, and brand positioning.',
      image: person4,
      imagePosition: 'object-center'
    },
    {
      id: 1,
      date: '19/12/2024',
      title: 'Brand Coaching Program',
      description: 'A deep-dive program to shape your story, image, and online presence.',
      image: person2,
      imagePosition: 'object-[center_22%]'
    },
    {
      id: 2,
      date: '30/12/2024',
      title: 'LinkedIn & Social Profile Makeover',
      description: 'Optimize your digital footprint for visibility and impact.',
      image: person1,
      imagePosition: 'object-center'
    },
    {
      id: 3,
      date: '27/04/2024',
      title: 'Content Strategy & Visibility Coaching',
      description: 'Learn how to create engaging content that builds authority and trust.',
      image: person3,
      imagePosition: 'object-center'
    }
  ];

  return (
    <section id="services" className="py-20 sm:py-28 bg-[#FAF9FD] border-t border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        
        {/* Eyebrow */}
        <div className="text-xs font-semibold text-neutral-400 tracking-wider mb-6">
          — Our Services
        </div>

        {/* Section Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 gap-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight leading-[1.12] font-sans">
            <span className="text-[#703BF7]">Personal</span> Branding Services <br />
            Tailored for You
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 max-w-xs font-normal leading-relaxed">
            A range of 1:1 and executive coaching packages to help you elevate your personal brand.
          </p>
        </div>

        {/* 4 Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {services.map((item, idx) => {
            const isActive = activeCard === idx;
            return (
              <div
                key={item.id}
                onClick={() => setActiveCard(idx)}
                className={`rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer min-h-[390px] ${
                  isActive
                    ? 'bg-[#703BF7] text-white shadow-xl shadow-[#703BF7]/25 -translate-y-1.5'
                    : 'bg-white text-neutral-900 border border-neutral-200/60 shadow-xs hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Card Top Meta */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-mono px-3 py-1 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                      }`}
                    >
                      {item.date}
                    </span>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                        isActive
                          ? 'bg-white text-[#703BF7] shadow-xs'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h3
                    className={`font-bold text-lg sm:text-xl tracking-tight leading-snug mb-2 font-sans ${
                      isActive ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed ${
                      isActive ? 'text-white/80' : 'text-neutral-500'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Card Bottom Image Thumbnail */}
                <div className="mt-6 rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-100/50 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-full object-cover ${item.imagePosition || 'object-center'} transition-transform duration-500 hover:scale-105`}
                  />
                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      isActive
                        ? 'bg-gradient-to-t from-[#703BF7]/40 to-transparent'
                        : 'bg-gradient-to-t from-neutral-900/20 to-transparent'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Row matching Reference Image 3 */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200/70 shadow-sm gap-6">
          <div>
            <div className="font-bold text-base sm:text-lg text-neutral-900 font-sans mb-1">
              Ready to take your personal brand to the next level?
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Schedule your 30-minute discovery consultation and get actionable feedback.
            </p>
          </div>

          <button
            onClick={onBookCall}
            className="btn-lane-primary group rounded-full pl-6 pr-2.5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-4 cursor-pointer shadow-md shadow-[#703BF7]/25 w-fit flex-shrink-0"
          >
            <span>Book a Call Now</span>
            <div className="w-8 h-8 rounded-full bg-white text-[#703BF7] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-xs">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}
