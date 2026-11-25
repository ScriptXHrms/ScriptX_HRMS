import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

export default function FaqSection({ onOpenAuditModal: _onOpenAuditModal }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How much time is realistically required from the founder each week?',
      a: 'Only 45 minutes once per week. During our structured Monday Zoom sprint, our executive editorial director interviews you to extract your real stories, contrarian perspectives, and strategic insights. Our team handles 95% of the heavy lifting—ghostwriting, video editing, graphic design, and platform scheduling.'
    },
    {
      q: 'Why should I invest in Personal Branding over running paid ads alone?',
      a: 'Paid ads stop the exact moment you turn off your daily ad spend. An executive personal brand is a permanent compounding enterprise asset that lives with you forever. Customers, venture capitalists, and top hires trust authentic human beings far more than faceless logos. Founder-led brands achieve up to 4x higher deal closing rates and 60% lower customer acquisition costs.'
    },
    {
      q: 'Do you work under strict confidentiality and Non-Disclosure Agreements (NDAs)?',
      a: 'Yes, absolutely. Over 60% of our executive clients are venture-backed or public company leaders with strict compliance obligations. We execute bilateral NDAs prior to your first discovery call, and all ghostwritten material requires your final sign-off before publishing.'
    },
    {
      q: 'How quickly will we start seeing measurable reach, followers, and inbound pipeline?',
      a: 'In the first 30 days, we optimize your executive profile, establish your narrative manifesto, and calibrate your algorithmic resonance. By days 45 to 60, organic impressions typically surge by 300%+. High-ticket inbound DMs and inbound booked discovery calls consistently materialize between months 2 and 3 as your authority compounds.'
    },
    {
      q: 'Which platforms do you actively cover and optimize?',
      a: 'We specialize primarily in LinkedIn and X (Twitter) for B2B founders, CEOs, and professional authority. For high-growth founders and consumer leaders, we also orchestrate YouTube Shorts, Instagram Reels, Google Search SEO, Meta Ads funnels, and executive email newsletters.'
    },
    {
      q: 'What does your contract structure look like? Are we locked into a long-term commitment?',
      a: 'We operate on a 90-day initial Sprint Retainer to allow the organic algorithms and inbound funnels time to build proper compounding momentum. After the initial sprint, clients continue on flexible month-to-month retainers. We earn your partnership through tangible results, not restrictive contracts.'
    }
  ];

  return (
    <section id="faq" className="relative py-24 md:py-32 bg-[#080B13] border-t border-white/5 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Clear Answers
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Frequently Asked <span className="text-gradient-purple">Questions</span>
          </h2>
          <p className="text-slate-400 text-base">
            Everything you need to know about our executive personal branding and digital marketing engine.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all duration-200 border overflow-hidden ${
                  isOpen 
                    ? 'bg-[#111728] border-indigo-500/40 shadow-xl shadow-indigo-950/30' 
                    : 'bg-[#0c101c] border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-bold text-sm sm:text-base text-white">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-indigo-500/20 text-indigo-300' : 'text-slate-400'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-bold text-sm text-white">Have a specific question not listed here?</h4>
            <p className="text-xs text-slate-400">Speak directly with our Chief Growth Strategist on WhatsApp.</p>
          </div>
          <a
            href="https://wa.me/917604829279?text=Hi%20ScriptX%2C%20I%20have%20a%20question%20about%20your%20services"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs inline-flex items-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ask Us On WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
