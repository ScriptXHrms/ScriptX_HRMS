import React, { useState } from 'react';
import { 
  Star, 
  ArrowUpRight, 
  Play
} from 'lucide-react';
import { LinkedInIcon } from './Icons';

import video1 from '../assets/videos/video_1.mp4';
import video2 from '../assets/videos/video_2.mp4';
import video3 from '../assets/videos/video_3.mp4';
import video4 from '../assets/videos/video_4.mp4';

export default function TestimonialsSection({ onOpenVideoModal, onOpenAuditModal }) {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Column 1 Testimonials (Moves Top to Bottom)
  const column1 = [
    {
      id: 'c1-1',
      name: 'Ayush Singh',
      role: 'Founder & CEO',
      company: 'OmniFlow AI',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      shortText: 'ScriptX extracted my perspective during a 45-minute monthly sprint and produced 15 high-retention videos with 2 distinct studio backgrounds. Our reach skyrocketed from 12k to over 1.8M monthly impressions.',
      fullText: 'Within 90 days, 14 enterprise buyers booked demos directly from my LinkedIn DMs. ScriptX is not just an agency—they are an indispensable growth partner.',
      linkedIn: 'https://linkedin.com',
      metric: '15 Videos • 2 Sets',
      highlightBadge: '+1.8M Monthly Reach',
      videoSrc: video1,
      videoIndex: 0,
      videoTitle: 'AI Founder Authority'
    },
    {
      id: 'c1-2',
      name: 'Saksham Bhasin',
      role: 'Co-Founder & CTO',
      company: 'CloudScale Systems',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      shortText: 'As a technical founder, I always hated self-promotion. ScriptX translated deep architectural insights into authentic executive authority without any of the cringe influencer tropes.',
      fullText: 'We hired 3 world-class senior engineers who explicitly joined because they followed my technical breakdown videos on LinkedIn and X. ScriptX handles 95% of the work seamlessly.',
      linkedIn: 'https://linkedin.com',
      metric: '10 Videos • 1 Set',
      highlightBadge: 'Top Tech Talent Hired',
      videoSrc: video3,
      videoIndex: 2,
      videoTitle: 'Technical CTO Voice'
    },
    {
      id: 'c1-3',
      name: 'Vikramaditya Verma',
      role: 'Head of Growth',
      company: 'NeoPay FinTech',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      shortText: 'ScriptX combined founder video storytelling with organic algorithmic distribution, driving 2.4M monthly impressions and establishing an enterprise inbound qualified lead pipeline.',
      fullText: 'They calibrated our studio lighting, built multi-camera setups, and established a steady stream of enterprise inbound qualified leads.',
      linkedIn: 'https://linkedin.com',
      metric: '20 Videos • 3 Sets',
      highlightBadge: '2.4M Video Views',
      videoSrc: video1,
      videoIndex: 0,
      videoTitle: 'FinTech Growth Narrative'
    }
  ];

  // Column 2 Testimonials (Moves Bottom to Top)
  const column2 = [
    {
      id: 'c2-1',
      name: 'Chandranshu Bhardwaj',
      role: 'Managing Director',
      company: 'Apex Venture Capital',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      shortText: 'In venture capital, top founder deal flow goes to the most visible, high-conviction voices. ScriptX built my executive personal brand from scratch with their 20-video monthly package across 3 cinematic backgrounds.',
      fullText: 'We saw a 4x increase in tier-1 founder inbound pitches and secured features in TechCrunch and Forbes. The compounding return on authority has been generational.',
      linkedIn: 'https://linkedin.com',
      metric: '20 Videos • 3 Sets',
      highlightBadge: '4x Deal Flow Inbound',
      videoSrc: video2,
      videoIndex: 1,
      videoTitle: 'VC Managing Director'
    },
    {
      id: 'c2-2',
      name: 'Elena Rostova',
      role: 'Principal Partner',
      company: 'Rostova Global Strategy',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      shortText: 'ScriptX executed our executive branding, high-converting video narratives, and performance distribution under one cohesive vision. Our average consulting deal size increased from $25,000 to over $95,000.',
      fullText: 'Their reporting is transparent, their team is proactive, and their creative standards are genuinely world-class. If you are serious about building category leadership, hire ScriptX.',
      linkedIn: 'https://linkedin.com',
      metric: '15 Videos • 2 Sets',
      highlightBadge: 'Average Deal Size $95k+',
      videoSrc: video4,
      videoIndex: 3,
      videoTitle: 'Executive Strategy Brand'
    },
    {
      id: 'c2-3',
      name: 'Sukanya Rashmi',
      role: 'Healthcare Executive & Author',
      company: 'Veda Wellness Group',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      shortText: 'Launching my book and private practice required an unmatched digital presence. ScriptX produced 15 videos a month across clinical and podcast studio backgrounds, booking out private consultations 3 months in advance.',
      fullText: 'I could never have achieved this momentum while running my clinics. ScriptX only requires 2 hours of my time each month. Best marketing investment ever.',
      linkedIn: 'https://linkedin.com',
      metric: '15 Videos • 2 Sets',
      highlightBadge: 'Booked Out 3 Months',
      videoSrc: video2,
      videoIndex: 1,
      videoTitle: 'Healthcare Authority'
    }
  ];

  const renderCard = (item, uniqueKey) => {
    const isExpanded = expandedCards[uniqueKey];
    return (
      <div
        key={uniqueKey}
        onClick={() => onOpenVideoModal(item.videoIndex)}
        className="rounded-3xl bg-white border border-black/10 p-5 sm:p-6 flex flex-col justify-between hover:border-[#40108c]/50 hover:shadow-paper-lg transition-all duration-300 group shadow-paper cursor-pointer select-none"
      >
        <div>
          {/* Top Row: Double Quote SVG & Highlight Badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="text-2xl text-neutral-400 group-hover:text-[#40108c] transition-colors leading-none">
              <svg className="w-7 h-7 fill-current opacity-80" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#40108c]/10 text-[#40108c] border border-[#40108c]/20 font-bold">
                {item.highlightBadge}
              </span>
            </div>
          </div>

          {/* Embedded Looping Video Card Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-neutral-900 aspect-video mb-3.5 border border-black/10 group-hover:border-[#40108c]/40 transition-colors shadow-xs">
            <video
              src={item.videoSrc}
              muted
              playsInline
              loop
              autoPlay
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            
            {/* Play badge overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full btn-brand-gradient text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-[#f3c72b]/60">
                <Play className="w-4 h-4 fill-[#f3c72b] text-[#f3c72b] ml-0.5" />
              </div>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-neutral-300">
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[#f3c72b] font-bold">
                {item.videoTitle}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white">
                Click to Watch ↗
              </span>
            </div>
          </div>

          {/* Testimonial Quote */}
          <p className="text-xs text-neutral-700 leading-relaxed mb-2 font-normal">
            "{item.shortText}"
            {isExpanded && (
              <span className="block mt-2 text-neutral-900 font-medium animate-in fade-in duration-200">
                {item.fullText}
              </span>
            )}
          </p>

          <button
            onClick={(e) => toggleExpand(uniqueKey, e)}
            className="text-[11px] font-bold text-[#40108c] hover:underline mb-3 block transition-colors cursor-pointer"
          >
            {isExpanded ? 'Show less' : 'Read full case story...'}
          </button>
        </div>

        {/* Bottom Author Row matching TakeUforward */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={item.avatar}
              alt={item.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#40108c]/20 shadow-xs"
            />
            <div>
              <h4 className="font-headline font-bold text-xs text-[#111418] group-hover:text-[#40108c] transition-colors">
                {item.name}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                <span>{item.role}</span>
                <span>•</span>
                <span className="text-neutral-800 font-semibold">{item.company}</span>
              </div>
            </div>
          </div>

          {/* LinkedIn Icon Pill */}
          <a
            href={item.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-[#0077b5]/15 text-neutral-600 hover:text-[#0077b5] border border-black/5 flex items-center justify-center transition-colors flex-shrink-0"
            title="View LinkedIn Profile"
          >
            <LinkedInIcon className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <section id="testimonials" className="relative py-24 md:py-36 bg-[#EDEEEC] text-[#111418] border-t border-black/5 overflow-hidden">
      
      {/* Background soft ambient lighting with subtle violet & gold tints */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[500px] bg-[#40108c]/6 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[450px] bg-[#f3c72b]/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TakeUforward-Style 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column (Sticky Column matching TakeUforward) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-xs border border-black/10 text-[#40108c] text-xs font-semibold mb-5">
              <span className="w-2 h-2 rounded-full bg-[#f3c72b]"></span>
              <span>Testimonials</span>
            </div>

            <h2 className="font-headline font-black text-3xl sm:text-5xl lg:text-6xl text-[#111418] tracking-tight leading-[1.08] mb-5">
              Trusted by <br />
              <span>Thousands</span> <br />
              <span className="font-serif-display italic font-normal text-[#40108c]">
                of Founders.
              </span>
            </h2>

            <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed mb-6 max-w-sm">
              Watch real personal branding videos produced by ScriptX (Video 01 to Video 04). Hear how founders scaled authority and inbound qualified pipeline.
            </p>

            {/* Google Verified Reviews Badge (Clean Paper White) */}
            <div className="p-4 rounded-2xl bg-white border border-black/10 mb-6 max-w-sm shadow-paper">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                    G
                  </div>
                  <span className="text-xs font-bold text-[#111418] tracking-tight">Google Verified Agency Reviews</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#40108c]">4.9 / 5.0</span>
              </div>
              <div className="flex items-center gap-1 mb-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-[#f3c72b] text-[#f3c72b]" />
                ))}
                <span className="text-xs text-neutral-700 ml-2 font-medium">100+ 5-Star Reviews</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                100% verified CEO, VP & Founder client reviews.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="#pricing"
                onClick={onOpenAuditModal}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full btn-brand-gradient text-white font-headline font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all border border-[#f3c72b]/50 cursor-pointer"
              >
                <span>Hall of Fame &rarr;</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </a>

              <button
                onClick={() => onOpenVideoModal(0)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white hover:bg-neutral-50 border border-black/10 text-[#111418] font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[#40108c] text-[#40108c]" />
                <span>Watch 4 Videos</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 mt-4 font-mono">
              Hover over any card to pause auto-scroll & play video.
            </p>
          </div>

          {/* Right Column: Two-Column Animated Marquee (Col 1: Top to Bottom | Col 2: Bottom to Top) */}
          <div className="lg:col-span-7 relative h-[740px] overflow-hidden pause-marquee-hover rounded-3xl">
            
            {/* Top & Bottom gradient fade masks in light page color */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#EDEEEC] via-[#EDEEEC]/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#EDEEEC] via-[#EDEEEC]/80 to-transparent z-20 pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-full">
              
              {/* Column 1: Animated Top to Bottom */}
              <div className="flex flex-col gap-5 animate-marquee-down">
                {[...column1, ...column1].map((item, idx) => 
                  renderCard(item, `col1-${item.id}-${idx}`)
                )}
              </div>

              {/* Column 2: Animated Bottom to Top */}
              <div className="flex flex-col gap-5 animate-marquee-up">
                {[...column2, ...column2].map((item, idx) => 
                  renderCard(item, `col2-${item.id}-${idx}`)
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
