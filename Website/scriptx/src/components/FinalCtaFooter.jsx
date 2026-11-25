import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LinkedInIcon, TwitterXIcon, InstagramIcon, YouTubeIcon } from './Icons';
import scriptxLogo from '../assets/scriptx-logo.jpeg';

export default function FinalCtaFooter({ onEnrollClick }) {
  return (
    <footer className="bg-[#EDEEEC] text-[#111418] relative overflow-hidden pt-24 pb-12 border-t border-black/10">
      
      {/* Huge Typographic "2027" in Background (Subtle Paper Watermark) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 font-headline font-black text-[180px] sm:text-[280px] md:text-[360px] text-black/[0.04] select-none pointer-events-none leading-none -z-0">
        2027
      </div>

      {/* Atmospheric Ambient Light in soft violet & gold */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#40108c]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[300px] bg-[#f3c72b]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Main Final CTA Card */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/10 text-[#40108c] text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f3c72b]" />
            <span>Limited Client Onboarding Slots Active</span>
          </div>

          <h2 className="font-headline text-4xl sm:text-6xl md:text-7xl text-[#111418] tracking-tight leading-[1.08] mb-6">
            Stop being the <br />
            <span className="relative inline-block text-neutral-500">
              <span className="line-through decoration-[#40108c] decoration-4">best-kept secret</span>
              {/* Violet/Gold Handwritten Annotation with Arrow */}
              <span className="absolute -top-6 -right-14 sm:-right-24 font-handwriting text-2xl sm:text-3xl text-[#40108c] rotate-12 whitespace-nowrap font-bold">
                market leader! ↗
              </span>
            </span>
          </h2>

          <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
            In 2027, the founders with iconic personal brands will command 80% of industry trust. Partner with ScriptX to produce 10, 15, or 20 high-production videos every month.
          </p>

          {/* Luxury Brand Gradient Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              onClick={onEnrollClick}
              className="px-8 py-4 rounded-full btn-brand-gradient text-white font-headline font-bold text-base tracking-tight shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 border border-[#f3c72b]/70 cursor-pointer"
            >
              <span>Explore Retainers (40K - 80K/mo)</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </a>
          </div>

          <p className="text-xs text-neutral-500 font-mono mt-4">
            ⚡ 10 Videos (40K) • 15 Videos (60K) • 20 Videos (80K) • 1 to 3 Studio Backgrounds
          </p>
        </div>

        {/* Footer Navigation & Social Links with ScriptX Logo */}
        <div className="pt-12 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-600">
          
          {/* Logo & Tag */}
          <div className="flex items-center gap-3">
            <img 
              src={scriptxLogo} 
              alt="ScriptX Logo" 
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#40108c]/40 shadow-xs"
            />
            <div>
              <span className="font-headline font-bold text-[#111418] text-base block tracking-tight">
                ScriptX
              </span>
              <span className="text-[11px] text-neutral-500">
                Done-For-You Personal Branding & Digital Marketing Agency
              </span>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 hover:text-[#0077b5] border border-black/10 shadow-xs flex items-center justify-center transition-colors"
              title="LinkedIn"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 hover:text-black border border-black/10 shadow-xs flex items-center justify-center transition-colors"
              title="Twitter / X"
            >
              <TwitterXIcon className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 hover:text-[#40108c] border border-black/10 shadow-xs flex items-center justify-center transition-colors"
              title="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 hover:text-rose-600 border border-black/10 shadow-xs flex items-center justify-center transition-colors"
              title="YouTube"
            >
              <YouTubeIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-black transition-colors">Terms of Retainer</a>
            <span>•</span>
            <a href="#" className="hover:text-black transition-colors">Client NDA Guarantee</a>
          </div>

        </div>

        <div className="text-center text-[10px] text-neutral-500 mt-6 font-mono">
          © 2026 ScriptX Private Limited. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
