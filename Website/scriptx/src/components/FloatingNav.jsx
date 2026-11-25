import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function FloatingNav({ onEnrollClick }) {
  // Live ticking countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 20,
    hours: 23,
    minutes: 43,
    seconds: 12
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[820px] transition-all duration-300">
      <div className="bg-[#1A1A1A]/95 text-white backdrop-blur-xl px-4 py-2.5 sm:px-6 sm:py-3 rounded-full flex items-center justify-between shadow-[0_16px_36px_rgba(0,0,0,0.22)] border border-white/10">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3461EF] via-[#FF2E93] to-[#FFD93D] p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#1A1A1A] rounded-full flex items-center justify-center text-[11px] font-black tracking-tight">
              C
            </div>
          </div>
          <span className="font-headline font-bold text-xs sm:text-sm tracking-tight text-white group-hover:text-[#FFD93D] transition-colors">
            Creator as a Career
          </span>
        </a>

        {/* Live Countdown in Middle */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-300 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FF2E93] animate-pulse"></span>
          <span>Pre-order closes in</span>
          <span className="font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-white font-semibold tracking-wider text-[11px]">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <a
            href="#pricing"
            onClick={onEnrollClick}
            className="flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white text-[#111418] hover:bg-[#F3F4F6] text-xs font-semibold tracking-tight shadow-sm hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            <span>Enroll now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </nav>
  );
}
