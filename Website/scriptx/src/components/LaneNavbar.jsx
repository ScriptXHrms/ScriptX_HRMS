import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import scriptxLogo from '../assets/scriptx-logo.jpeg';

export default function LaneNavbar({ onBookConsultation }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Success Stories', href: '#testimonials' },
    { label: 'Blog', href: '#blog' }
  ];

  return (
    <header className="absolute top-6 inset-x-0 z-30 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto glass-nav rounded-full px-5 sm:px-7 py-3 flex items-center justify-between shadow-lg">
        
        {/* Brand Logo with Official ScriptX Hexagon Image */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/50 shadow-md flex-shrink-0 bg-white transition-transform group-hover:scale-105">
            <img 
              src={scriptxLogo} 
              alt="ScriptX Logo" 
              className="w-full h-full object-cover object-center" 
            />
          </div>
          <span className="text-white font-bold text-base sm:text-lg tracking-tight font-sans">
            ScriptX
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-white/85">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Button */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onBookConsultation}
            className="btn-lane-glass text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-white/25 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <span>Book a Consultation</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-1.5 rounded-full bg-white/10 border border-white/20 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-6xl mx-auto glass-nav rounded-3xl p-5 text-white animate-in fade-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-white/15">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookConsultation();
                }}
                className="w-full py-2.5 rounded-full bg-[#703BF7] text-white font-semibold text-xs text-center flex items-center justify-center gap-2 shadow-md"
              >
                <span>Book a Consultation</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
