import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  MousePointer2
} from 'lucide-react';
import { motion } from 'framer-motion';
import scriptxLogo from '../assets/scriptx-logo.jpeg';
import img1 from '../assets/Img_1.png';
import img2 from '../assets/Img_2.png';
import img3 from '../assets/Img_3.png';
import img4 from '../assets/Img_4.png';

export default function CreatorHero({ onWatchVideo, onEnrollClick }) {
  const [isHoveredKnob, setIsHoveredKnob] = useState(false);

  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-[#EDEEEC]">
      
      {/* Background radial atmosphere with brand violet & gold */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#40108c]/12 via-[#f3c72b]/6 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 relative">
        
        {/* Floating UI Card 1: Organic Reach / Impressions (Top Left) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute -top-4 left-0 w-64 z-10 rotate-[-3deg] hover:scale-105 transition-transform drop-shadow-xl"
        >
          {/* Animated Cursor Label: Founder */}
          <motion.div 
            animate={{ 
              x: [0, 8, -6, 0], 
              y: [0, -8, 5, 0] 
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -left-4 flex items-center gap-1.5 z-20 pointer-events-none"
          >
            <MousePointer2 className="w-5 h-5 text-[#40108c] fill-[#40108c] drop-shadow-md" />
            <span className="px-2.5 py-0.5 rounded-full bg-[#40108c] text-[#f3c72b] border border-[#f3c72b]/30 text-[11px] font-semibold tracking-wide shadow-md whitespace-nowrap">
              Founder
            </span>
          </motion.div>

          <img 
            src={img1} 
            alt="Organic Reach Impressions" 
            className="w-full h-auto rounded-2xl border border-black/5"
          />
        </motion.div>

        {/* Floating UI Card 2: Follower Growth (Top Right) */}
        <motion.div 
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="hidden lg:block absolute top-2 right-2 w-64 z-10 rotate-[2.5deg] hover:scale-105 transition-transform drop-shadow-xl"
        >
          {/* Animated Cursor Label: Founder */}
          <motion.div 
            animate={{ 
              x: [0, -10, 7, 0], 
              y: [0, 9, -6, 0] 
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute -top-3 -right-4 flex items-center gap-1.5 z-20 pointer-events-none"
          >
            <MousePointer2 className="w-5 h-5 text-[#40108c] fill-[#40108c] drop-shadow-md -scale-x-100" />
            <span className="px-2.5 py-0.5 rounded-full bg-[#40108c] text-[#f3c72b] border border-[#f3c72b]/30 text-[11px] font-semibold tracking-wide shadow-md whitespace-nowrap">
              Founder
            </span>
          </motion.div>

          <img 
            src={img2} 
            alt="Follower Growth Metric" 
            className="w-full h-auto rounded-2xl border border-black/5"
          />
        </motion.div>

        {/* Floating UI Card 3: Revenue Pipeline (Bottom Left) */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="hidden lg:block absolute bottom-8 left-4 w-60 z-10 rotate-[1.5deg] hover:scale-105 transition-transform drop-shadow-xl"
        >
          {/* Animated Cursor Label: Founder */}
          <motion.div 
            animate={{ 
              x: [0, 8, -5, 0], 
              y: [0, -7, 6, 0] 
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute -top-3 -left-4 flex items-center gap-1.5 z-20 pointer-events-none"
          >
            <MousePointer2 className="w-5 h-5 text-[#40108c] fill-[#40108c] drop-shadow-md" />
            <span className="px-2.5 py-0.5 rounded-full bg-[#40108c] text-[#f3c72b] border border-[#f3c72b]/30 text-[11px] font-semibold tracking-wide shadow-md whitespace-nowrap">
              Founder
            </span>
          </motion.div>

          <img 
            src={img3} 
            alt="Client Pipeline Revenue" 
            className="w-full h-auto rounded-2xl border border-black/5"
          />
        </motion.div>

        {/* Floating UI Card 4: Retention / Line Graph (Bottom Right) */}
        <motion.div 
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="hidden lg:block absolute bottom-6 right-6 w-64 z-10 rotate-[-2deg] hover:scale-105 transition-transform drop-shadow-xl"
        >
          {/* Animated Cursor Label: Founder */}
          <motion.div 
            animate={{ 
              x: [0, -9, 6, 0], 
              y: [0, 8, -5, 0] 
            }}
            transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute -top-3 -right-4 flex items-center gap-1.5 z-20 pointer-events-none"
          >
            <MousePointer2 className="w-5 h-5 text-[#40108c] fill-[#40108c] drop-shadow-md -scale-x-100" />
            <span className="px-2.5 py-0.5 rounded-full bg-[#40108c] text-[#f3c72b] border border-[#f3c72b]/30 text-[11px] font-semibold tracking-wide shadow-md whitespace-nowrap">
              Founder
            </span>
          </motion.div>

          <img 
            src={img4} 
            alt="Average Retention Metric" 
            className="w-full h-auto rounded-2xl border border-black/5"
          />
        </motion.div>

        {/* Main Center Content with ScriptX Logo */}
        <div className="text-center max-w-3xl mx-auto z-10 relative">
          
          {/* Official ScriptX Brand Badge with Logo */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-black/10 mb-6">
            <img 
              src={scriptxLogo} 
              alt="ScriptX Logo" 
              className="w-7 h-7 rounded-full object-cover ring-2 ring-[#f3c72b]/80 shadow-xs"
            />
            <div className="flex items-center gap-2 text-xs">
              <span className="font-headline font-black text-sm tracking-tight text-[#111418]">ScriptX</span>
              <span className="text-neutral-400">|</span>
              <span className="text-[#40108c] font-bold">Personal Branding & Digital Marketing</span>
            </div>
          </div>

          {/* Master Headline */}
          <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl lg:text-[76px] text-[#111418] leading-[1.04] tracking-tight mb-7">
            Make your personal brand your company's <br />
            <span className="font-serif-display italic font-normal tracking-normal text-[#111418] marker-highlight">
              greatest growth engine.
            </span>
          </h1>

          {/* Subtext explaining the 10, 15, 20 video packages */}
          <p className="text-base sm:text-lg md:text-xl text-[#6B7280] font-normal leading-relaxed max-w-2xl mx-auto mb-8">
            ScriptX scripts, films, and edits <strong>10 to 20 cinematic videos per month</strong> with 1 to 3 custom studio backgrounds. We turn CEOs, doctors, and tech founders into undisputed market authorities in just <strong>2 hours a month</strong>.
          </p>

          {/* Package Highlight Pill */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 text-xs">
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-[#111418] font-bold shadow-xs">
              📹 10 Videos — ₹40K (1 Background)
            </span>
            <span className="px-3.5 py-1.5 rounded-full btn-brand-gradient text-white font-bold shadow-md">
              ★ 15 Videos — ₹60K (2 Backgrounds)
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-black/10 text-[#111418] font-bold shadow-xs">
              🔥 20 Videos — ₹80K (3 Backgrounds)
            </span>
          </div>

          {/* Signature Action Buttons with #40108c & #f3c72b gradient */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            
            {/* Signature Pill with Knob */}
            <a
              href="#pricing"
              onClick={onEnrollClick}
              onMouseEnter={() => setIsHoveredKnob(true)}
              onMouseLeave={() => setIsHoveredKnob(false)}
              className="relative flex items-center p-1.5 pl-2 pr-7 rounded-full bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-black/5 text-[#111418] font-headline font-bold text-sm tracking-tight group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <div 
                className={`w-10 h-10 rounded-full btn-brand-gradient text-white flex items-center justify-center transition-all duration-300 shadow-md ${
                  isHoveredKnob ? 'translate-x-1 rotate-12 scale-105' : ''
                }`}
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="ml-3.5 text-sm sm:text-base">
                View Video Packages (40K - 80K) &rarr;
              </span>
            </a>

            {/* Watch Video Ghost White Pill */}
            <button
              onClick={onWatchVideo}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/70 hover:bg-white text-[#111418] font-semibold text-sm border border-black/5 shadow-sm hover:shadow transition-all duration-200"
            >
              <div className="w-6 h-6 rounded-full bg-[#40108c]/10 flex items-center justify-center text-[#40108c]">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>Watch Video Samples</span>
            </button>

          </div>

          {/* Micro Social Proof Row */}
          <div className="flex items-center justify-center gap-3 text-xs text-neutral-600 font-medium">
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80'
              ].map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt="Client" 
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-white" 
                />
              ))}
            </div>
            <span>Trusted by <strong>250+ founders & market leaders</strong> across India & globally</span>
          </div>

        </div>

      </div>
    </section>
  );
}
