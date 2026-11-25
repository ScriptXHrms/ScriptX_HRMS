import React, { useState } from 'react';
import { Plus, ChevronRight, MessageCircle, HelpCircle } from 'lucide-react';

export default function CreatorFaq() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState(0);

  const categories = [
    { id: 'all', label: 'All 16 Agency FAQs' },
    { id: 'pricing', label: 'Pricing & Backgrounds' },
    { id: 'production', label: 'Shooting & Editing' },
    { id: 'timeline', label: 'Time Commitment' },
    { id: 'business', label: 'ROI & Contracts' }
  ];

  const faqs = [
    {
      category: 'pricing',
      q: 'What are the three monthly video packages and pricing?',
      a: 'We offer three transparent monthly retainers: (1) 10 Videos / month — ₹40,000 with 1 Studio Background Setup; (2) 15 Videos / month — ₹60,000 with 2 Distinct Background Changes (Our most popular package for founders); (3) 20 Videos / month — ₹80,000 with 3 Distinct Background Changes for complete market dominance.'
    },
    {
      category: 'pricing',
      q: 'How do the 1, 2, and 3 background changes work?',
      a: 'Background changes prevent visual fatigue across your social profiles. In the 10-video package, all videos are filmed in 1 curated studio set. In the 15-video package, you switch between 2 distinct environments (e.g., Executive Office + Moody Podcast Set). In the 20-video package, we utilize 3 cinematic background setups (e.g. Boardroom + Casual Fireside + Deep Studio).'
    },
    {
      category: 'timeline',
      q: 'How much time is realistically required from the founder or executive each month?',
      a: 'Only 2 hours per month! You spend 45 minutes on our monthly narrative sprint call to review topics, and approximately 75 to 90 minutes recording all 10, 15, or 20 videos. ScriptX handles 95% of the heavy lifting—from scriptwriting to post-production, thumbnails, and multi-channel posting.'
    },
    {
      category: 'production',
      q: 'Who writes the video scripts? Do I have to come up with ideas?',
      a: 'Our senior ghostwriters and video strategists write 100% of your scripts. We extract your real-world case studies, contrarian business opinions, and client war stories. Every script comes teleprompter-ready with proven 3-second psychological scroll-stoppers.'
    },
    {
      category: 'production',
      q: 'Can we shoot in our office, at your studio, or remotely?',
      a: 'We support all three! If you are based in or near Bangalore/Chennai, our crew shoots at our dedicated studios or at your executive office. For remote clients across India and globally, we send you our calibrated 4K studio kit and direct you remotely over high-definition recording feeds.'
    },
    {
      category: 'production',
      q: 'What editing elements are included in the videos?',
      a: 'Every video receives studio-grade post-production: precision jump cuts, professional audio mastering, custom sound effects, 2D/3D brand motion graphics, custom color grading, animated subtitles, and custom high-CTR thumbnails.'
    },
    {
      category: 'business',
      q: 'Which platforms do you publish to?',
      a: 'We distribute your content across LinkedIn (native video + carousels), Instagram Reels, YouTube Shorts, and X (Twitter). Every video is formatted natively for each platform\'s algorithm.'
    },
    {
      category: 'business',
      q: 'How do personal brand videos translate into direct business revenue?',
      a: 'People buy from trusted founders, not faceless logos. Our clients experience up to 4x higher closing rates on sales calls, direct high-ticket inbound DMs from enterprise buyers, invitations to keynote conferences, and significantly reduced customer acquisition costs.'
    },
    {
      category: 'timeline',
      q: 'What is the turnaround time from shoot day to published videos?',
      a: 'Your first batch of edited videos is delivered within 4 to 5 business days post-shoot. Once approved, we schedule them according to your custom monthly release calendar.'
    },
    {
      category: 'production',
      q: 'Do I get to review and approve the edits before they are posted?',
      a: 'Yes, 100%. Nothing ever goes live without your explicit sign-off. We provide an interactive Frame.io / Notion review dashboard where you can request timestamped tweaks with one click.'
    },
    {
      category: 'business',
      q: 'What if my industry is highly technical, clinical, or consider "boring"?',
      a: 'Boring and technical niches generate the highest revenue. Whether you build developer tools, manage FinTech compliance, or run a cardiology clinic, we specialize in translating technical depth into captivating 60-second authority videos.'
    },
    {
      category: 'business',
      q: 'Do you sign Non-Disclosure Agreements (NDAs) to protect our company IP?',
      a: 'Yes, absolutely. Over 70% of our clients are venture-backed or corporate executives. We sign mutual NDAs before our first onboarding call, ensuring your proprietary methodologies and business metrics remain completely confidential.'
    },
    {
      category: 'timeline',
      q: 'How quickly can we launch our first month of 10, 15, or 20 videos?',
      a: 'From contract signing to shoot day typically takes 5 to 7 days. Your first batch of videos will be live across your profiles within 10 to 12 days of starting with ScriptX.'
    },
    {
      category: 'production',
      q: 'What if I feel stiff or awkward in front of the camera?',
      a: 'Our shoot director coaches you live on every single take. We use conversational anchoring, natural pause pacing, and multi-take editing magic so you look relaxed, commanding, and authoritative on video.'
    },
    {
      category: 'business',
      q: 'Can my company expense this under our marketing and advertising budget?',
      a: 'Yes! We provide full GST-compliant corporate invoices with your company name, GSTIN, and business address. Many clients expense this under "Digital Marketing & Content Production Services".'
    },
    {
      category: 'pricing',
      q: 'How do I get started with ScriptX today?',
      a: 'Click any "Get Started" button or message us directly on WhatsApp. We will schedule a 20-minute brand strategy call to audit your current presence, select your package (10, 15, or 20 videos), and lock in your shoot date.'
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  return (
    <section id="faq" className="py-24 md:py-36 bg-[#F4F4F2] border-t border-black/5 overflow-hidden">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Fixed / Sticky Pinning as requested */}
          <div className="lg:col-span-5 lg:sticky lg:top-16 self-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-black/5 text-[#40108c] text-xs font-semibold uppercase tracking-wider mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-[#f3c72b]" />
              <span>Agency Client FAQ</span>
            </div>

            <h2 className="font-headline text-3xl sm:text-5xl text-[#111418] tracking-tight leading-tight mb-4">
              Frequently asked <br />
              <span className="font-serif-display italic font-normal text-4xl sm:text-6xl text-[#40108c]">
                agency questions.
              </span>
            </h2>
            <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
              Everything you need to know about our 10, 15, and 20 video packages, background setups, and executive workflows.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-col gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all flex items-center justify-between ${
                    activeCategory === cat.id
                      ? 'btn-brand-gradient text-white shadow-md font-bold'
                      : 'bg-white text-neutral-600 hover:bg-neutral-200/60 border border-black/5'
                  }`}
                >
                  <span>{cat.label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${activeCategory === cat.id ? 'text-[#f3c72b]' : 'text-neutral-400'}`} />
                </button>
              ))}
            </div>

            {/* Direct WhatsApp Help Card */}
            <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm text-xs text-neutral-600">
              <span className="font-bold text-[#111418] block mb-1">Have a specific question about your brand?</span>
              <p className="text-[11px] text-neutral-500 mb-3">Chat directly with our Creative Director on WhatsApp.</p>
              <a
                href="https://wa.me/917604829279?text=Hi%20ScriptX%2C%20I%20have%20questions%20about%20your%20Personal%20Branding%20video%20packages%20(40k%20-%2080k)"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors text-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp &rarr;</span>
              </a>
            </div>
          </div>

          {/* Right Scrollable List: Paged scrollable container beside sticky left */}
          <div className="lg:col-span-7 max-h-[700px] overflow-y-auto pr-2 sm:pr-3 space-y-3.5 scrollbar-thin">
            <div className="text-[11px] font-mono text-neutral-400 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Showing {filteredFaqs.length} Questions</span>
              <span>Scroll to view all &darr;</span>
            </div>

            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl transition-all duration-200 border ${
                    isOpen 
                      ? 'bg-white border-[#40108c]/40 shadow-paper' 
                      : 'bg-white/80 border-black/5 hover:bg-white hover:border-black/10'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4"
                  >
                    <span className="font-headline font-bold text-sm sm:text-base text-[#111418]">
                      {faq.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 transition-transform ${isOpen ? 'rotate-45 btn-brand-gradient text-white' : 'text-neutral-500'}`}>
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-black/5 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
