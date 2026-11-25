import React, { useState, useEffect } from 'react';
import { MessageCircle, Sparkles, ArrowUp } from 'lucide-react';

export default function FloatingAction({ onOpenAuditModal }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-[#111728] border border-white/10 hover:border-indigo-500/50 text-slate-300 hover:text-white flex items-center justify-center shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Floating CTA Group */}
      <div className="flex items-center gap-2 bg-[#0a0e18]/90 border border-white/10 p-1.5 rounded-full shadow-2xl backdrop-blur-xl">
        <button
          onClick={onOpenAuditModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold tracking-wide shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Book Audit</span>
        </button>

        <a
          href="https://wa.me/917604829279?text=Hi%20ScriptX%2C%20I%20am%20interested%20in%20Personal%20Branding%20and%20Digital%20Marketing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tracking-wide shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
