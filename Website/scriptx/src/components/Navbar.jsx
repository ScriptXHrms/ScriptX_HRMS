import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Menu, 
  X, 
  MessageCircle
} from 'lucide-react';

export default function Navbar({ onOpenAuditModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Results', href: '#results' },
    { name: 'Case Studies', href: '#case-studies' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'How We Work', href: '#process' },
    { name: 'About', href: '#about' },
    { name: 'Industries', href: '#industries' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#080B13]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40 py-3.5' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/50 transition-all duration-300">
              <div className="w-full h-full bg-[#080b13] rounded-[10px] flex items-center justify-center">
                <span className="font-display font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                  SX
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Script<span className="text-indigo-400">X</span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  Agency
                </span>
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 font-medium">
                Personal Branding & Growth
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#0e1320]/80 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right CTA Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://wa.me/917604829279?text=Hello%20ScriptX%20Team%2C%20I%20would%20like%20to%20grow%20my%20Personal%20Brand%20and%20Digital%20Marketing"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-200"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>

            <button
              onClick={onOpenAuditModal}
              className="relative group overflow-hidden rounded-full p-px font-semibold text-xs tracking-wide"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full animate-gradient-x"></span>
              <span className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a0e17] transition-all duration-300 group-hover:bg-opacity-80 text-white">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                <span>Book Free Audit</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0e17]/95 border-b border-white/10 px-4 pt-3 pb-6 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuditModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" />
                Book Free Consultation
              </button>
              <a
                href="https://wa.me/917604829279?text=Hello%20ScriptX%20Team%2C%20I%20would%20like%20to%20discuss%20Personal%20Branding"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
