import React from 'react';
import { Mail } from 'lucide-react';
import scriptxLogo from '../assets/scriptx-logo.jpeg';

export default function LaneFooter({ onContactClick }) {
  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Success Stories', href: '#testimonials' },
    { label: 'Blog', href: '#blog' }
  ];

  return (
    <footer className="bg-white pt-16 pb-12 border-t border-neutral-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        
        {/* Top Footer Row: Nav Links & Email Pill */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-8 gap-5 border-b border-neutral-100">
          
          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-neutral-600">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#703BF7] transition-colors tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Email Badge Pill */}
          <button
            onClick={onContactClick}
            className="rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium px-4 py-2 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-neutral-500" />
            <span>admin@script-x.in</span>
          </button>

        </div>

        {/* Huge Typographic Display Name: SCRIPTX PVT LTD */}
        <div className="my-10 sm:my-14 overflow-hidden text-center sm:text-left select-none">
          <h1 className="font-black text-4xl sm:text-6xl md:text-[80px] lg:text-[112px] xl:text-[136px] text-neutral-900 tracking-tighter leading-none font-sans uppercase">
            SCRIPTX PVT LTD
          </h1>
        </div>

        {/* Bottom Bar: Copyright, Social Icons, Legal */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-neutral-400">
          
          {/* Brand Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-neutral-200 shadow-2xs flex-shrink-0 bg-white">
              <img src={scriptxLogo} alt="ScriptX" className="w-full h-full object-cover" />
            </div>
            <span>@copyright 2026 ScriptX Pvt Ltd</span>
            <span className="text-neutral-300">•</span>
            <a href="#privacy" className="hover:text-neutral-700 transition-colors">
              Privacy Policy
            </a>
          </div>

          {/* Official Social Brand Icons in Circles */}
          <div className="flex items-center gap-2.5">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-[#0A66C2] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-xs"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.63 1.63 0 1 0 0-3.26 1.63 1.63 0 0 0 0 3.26m1.4 9.74V9.89H5.06v8.61h2.8z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-xs"
              title="Instagram"
              aria-label="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-xs"
              title="Facebook"
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* X (formerly Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-[#000000] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-xs border hover:border-neutral-700"
              title="X (Twitter)"
              aria-label="X (Twitter)"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}
