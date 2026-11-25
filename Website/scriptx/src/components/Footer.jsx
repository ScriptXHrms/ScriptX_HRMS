import React, { useState } from 'react';
import { 
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { LinkedInIcon, TwitterXIcon, InstagramIcon, YouTubeIcon } from './Icons';

export default function Footer({ onOpenAuditModal }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="relative bg-[#04060A] text-slate-400 border-t border-white/5 pt-16 pb-12 overflow-hidden">
      {/* Top subtle glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-white/5">
          
          {/* Brand Info (Col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#080b13] rounded-[10px] flex items-center justify-center">
                  <span className="font-display font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                    SX
                  </span>
                </div>
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                Script<span className="text-indigo-400">X</span>
              </span>
            </a>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              We turn Founders, CEOs, and ambitious operators into category-defining personal brands. High-converting digital marketing, organic authority, performance ads, and predictable inbound revenue.
            </p>

            <div className="space-y-1.5 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Indiranagar 100ft Rd, Bangalore & Chennai, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>hello@scriptxdigital.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>+91 70103 64226</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#0077b5]/20 text-slate-400 hover:text-[#0077b5] flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Twitter / X"
              >
                <TwitterXIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-pink-500/20 text-slate-400 hover:text-pink-400 flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (Col 5-6) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#results" className="hover:text-white transition-colors">Results & Metrics</a></li>
              <li><a href="#case-studies" className="hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Client Testimonials</a></li>
              <li><a href="#process" className="hover:text-white transition-colors">Our Process</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#industries" className="hover:text-white transition-colors">Industries</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Core Services (Col 7-8) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">
              Core Capabilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#services" className="hover:text-white transition-colors text-indigo-300 font-semibold">Executive Personal Branding</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">SEO & Search Dominance</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Social Media Marketing</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Google Ads & Meta Ads</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Content & Viral Video</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Website Development</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Branding & Graphic Design</a></li>
            </ul>
          </div>

          {/* Newsletter Subscribe (Col 9-12) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-1">
              The Authority Brief
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Join 12,000+ founders receiving our weekly breakdown on personal branding algorithms, viral hooks, and high-converting marketing funnels.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d18] border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Join
                </button>
              </div>

              {subscribed && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  You're in! Check your inbox for the first dispatch.
                </p>
              )}
            </form>

            <div className="pt-2">
              <button
                onClick={onOpenAuditModal}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Book Free 1-on-1 Consultation</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 ScriptX Digital Agency. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">NDA Guarantee</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
