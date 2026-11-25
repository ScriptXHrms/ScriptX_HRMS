import React, { useState } from 'react';
import { 
  Crown, 
  Search, 
  Share2, 
  Target, 
  Video, 
  Layout, 
  Palette, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function ServicesSection({ onOpenAuditModal }) {
  const [activeTab, setActiveTab] = useState('all');

  const services = [
    {
      id: 'personal-branding',
      category: 'flagship',
      title: 'Executive Personal Branding',
      subtitle: 'Our Flagship Authority Program',
      description: 'Turn your deep industry experience into an iconic personal brand. We ghostwrite high-resonance content, manage your executive profile on LinkedIn & X, book podcast appearances, and convert personal authority into high-value inbound business.',
      icon: Crown,
      highlight: true,
      deliverables: [
        'Ghostwritten LinkedIn & X Thought Leadership (3-5x/wk)',
        'Founder Narrative & Category Positioning Manifesto',
        'Podcast Pitching & Keynote Stage Opportunities',
        'Inbound Lead Capture & Executive DM Funnel',
        'Dedicated Brand Director & Editorial Team'
      ],
      badge: 'Most Popular for Founders & CEOs',
      stat: '+380% Avg Inbound Leads in 90 Days',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'seo',
      category: 'marketing',
      title: 'SEO & Organic Search Dominance',
      subtitle: 'Rank #1 for Buying Intent',
      description: 'Stop burning money on temporary ads alone. We build topical authority clusters, execute technical search optimization, and generate high-tier editorial backlinks that drive high-intent, compounding search traffic.',
      icon: Search,
      highlight: false,
      deliverables: [
        'High-Intent Commercial Keyword Architecture',
        'Programmatic & Deep Technical SEO Audits',
        'Authoritative Tier-1 Backlink Acquisition',
        'Continuous Conversion Rate Optimization (CRO)'
      ],
      badge: 'Compounding ROI',
      stat: '5.2x Organic Revenue Growth',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'social-media',
      category: 'marketing',
      title: 'Social Media Marketing & Management',
      subtitle: 'Omnichannel Brand Virality',
      description: 'End-to-end multi-platform social media orchestration across LinkedIn, Instagram, X, and YouTube. We engineer scroll-stopping assets, nurture engaged communities, and drive genuine industry conversation.',
      icon: Share2,
      highlight: false,
      deliverables: [
        'Platform-Native Content Creation & Scheduling',
        'Active Community Engagement & DM Management',
        'Viral Hooks & Data-Driven Repurposing Engine',
        'Monthly Analytics & Audience Sentiment Reports'
      ],
      badge: 'Omnichannel Reach',
      stat: '10M+ Monthly Impressions',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'performance-ads',
      category: 'growth',
      title: 'Google & Meta Performance Ads',
      subtitle: 'Predictable, Profitable Scale',
      description: 'Full-funnel paid media campaigns designed for maximum Return on Ad Spend (ROAS). We handle precision targeting, creative asset production, copy variations, and algorithmic bidding strategies.',
      icon: Target,
      highlight: false,
      deliverables: [
        'Meta (FB/IG) High-Converting Direct Response Ads',
        'Google Search, Display & YouTube Intent Ads',
        'Dynamic Retargeting & Omnipresent Funnels',
        'Continuous Creative Testing & Copy Iteration'
      ],
      badge: 'High ROAS',
      stat: '4.8x Average Return on Ad Spend',
      color: 'from-rose-500 to-orange-500'
    },
    {
      id: 'content-video',
      category: 'growth',
      title: 'Content Marketing & Short-Form Video',
      subtitle: 'Studio-Grade Storytelling',
      description: 'High-production short-form video clips (Reels, TikToks, YouTube Shorts), newsletters, and thought leadership essays tailored for today\'s fast-paced algorithmic feeds.',
      icon: Video,
      highlight: false,
      deliverables: [
        'Studio-Grade Short-Form Video Editing & Hooks',
        'High-Retention Long-Form Video & Podcasts',
        'Weekly Authority Newsletters & Lead Magnets',
        'Full Thumbnail Design & Caption Crafting'
      ],
      badge: 'Viral Engagement',
      stat: '72% Higher Watch Time',
      color: 'from-amber-500 to-rose-500'
    },
    {
      id: 'web-dev',
      category: 'tech',
      title: 'High-Converting Web Development',
      subtitle: 'Lightning-Fast Digital Presence',
      description: 'Custom React & Tailwind digital experiences built for unmatched speed, premium authority aesthetic, and relentless lead conversion. Every pixel is engineered to turn casual visitors into closed deals.',
      icon: Layout,
      highlight: false,
      deliverables: [
        'Modern React / Next.js / Vite Responsive Architecture',
        'Ultra-Fast Loading Speeds & Core Web Vitals (98+)',
        'Frictionless CRM & Lead Form Tracking Integration',
        'Interactive GSAP Micro-Interactions & Animations'
      ],
      badge: 'Conversion Focused',
      stat: '3.4x Higher Visitor-to-Lead Rate',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'branding-design',
      category: 'tech',
      title: 'Branding & Graphic Design',
      subtitle: 'Luxury Visual Identity',
      description: 'Establish unmatched visual credibility with world-class logos, bespoke color palettes, typographic hierarchies, social media design systems, and sales pitch presentations.',
      icon: Palette,
      highlight: false,
      deliverables: [
        'Complete Brand Identity & Typography Guidelines',
        'Executive Social Media Kit & Carousel Templates',
        'Investor Pitch Decks & Sales Presentation Decks',
        '3D Elements, Vector Illustrations & Custom Badges'
      ],
      badge: 'World-Class Aesthetic',
      stat: '100% Bespoke Identity',
      color: 'from-fuchsia-500 to-pink-500'
    }
  ];

  const filteredServices = activeTab === 'all' 
    ? services 
    : services.filter(s => s.category === activeTab || (activeTab === 'flagship' && s.highlight));

  return (
    <section id="services" className="relative py-24 md:py-32 bg-[#080B13] border-t border-white/5 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Our Comprehensive Capabilities
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Full-Funnel Services To Turn You Into An{' '}
            <span className="text-gradient-purple">Uncontested Authority</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            From executive personal branding that commands boardrooms, to high-converting performance funnels that fill your sales pipeline.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'flagship', label: '👑 Personal Branding' },
              { id: 'marketing', label: 'Social & SEO' },
              { id: 'growth', label: 'Performance Ads & Video' },
              { id: 'tech', label: 'Web Dev & Design' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-[#101524] text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Flagship Hero Card if 'all' or 'flagship' */}
        {(activeTab === 'all' || activeTab === 'flagship') && (
          <div className="mb-10 rounded-2xl p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-2xl shadow-indigo-500/20">
            <div className="rounded-[14px] bg-[#0c101d] p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-4">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                    FLAGSHIP SIGNATURE PROGRAM
                  </div>

                  <h3 className="font-display font-black text-2xl sm:text-4xl text-white mb-4 leading-tight">
                    Executive Personal Branding & Influence Engine
                  </h3>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                    In modern business, people don't buy from logos—they buy from authentic, credible leaders. We extract your genius in just <strong>45 minutes per week</strong>, engineer viral thought leadership on LinkedIn & X, land podcast spots, and turn your reputation into high-ticket inbound deals.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {[
                      '100% Ghostwritten Content (Your Voice, Zero Effort)',
                      'Category Positioning & Narrative Playbook',
                      'High-Ticket Inbound DM Funnel Setup',
                      'Video Scripting & Podcast Booking',
                      'LinkedIn Top Voice & Algorithmic Scaling',
                      'Guaranteed Reach & Executive Visibility'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={onOpenAuditModal}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/40 flex items-center gap-2"
                    >
                      <span>Claim Your Brand Strategy Audit</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      ⚡ Only 3 Founder Slots Available this Quarter
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-xl bg-[#111728] p-6 border border-white/10 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                      <span className="text-xs font-mono text-indigo-400">FOUNDER ROI BLUEPRINT</span>
                      <span className="text-xs text-emerald-400 font-bold">+380% Qualified Leads</span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3.5 rounded-lg bg-black/30 border border-white/5">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Time Required from You</span>
                          <span className="text-white font-bold font-mono">45 Mins / Week</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full w-[15%]"></div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-black/30 border border-white/5">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Execution Done By ScriptX</span>
                          <span className="text-indigo-400 font-bold font-mono">95% Full Management</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full w-[95%]"></div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                        <span className="font-bold text-white block mb-0.5">Average Result in 180 Days:</span>
                        74,000+ new targeted followers, 40+ booked CEO-to-CEO discovery calls, and $350k+ in traceable attributed revenue.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.filter(s => s.id !== 'personal-branding').map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative rounded-2xl glass-card p-6 sm:p-7 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${service.color} p-0.5 shadow-md shadow-indigo-900/30 group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full bg-[#0a0e18] rounded-[10px] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                      {service.badge}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-indigo-400 font-medium block mb-1">
                    {service.subtitle}
                  </span>
                  <h4 className="font-display font-bold text-lg text-white mb-3 group-hover:text-indigo-200 transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* Deliverables List */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-white/5">
                    {service.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {service.stat}
                  </span>
                  <button
                    onClick={onOpenAuditModal}
                    className="text-xs font-semibold text-white group-hover:text-indigo-400 flex items-center gap-1 transition-colors"
                  >
                    <span>Get Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#10162a] to-purple-950/60 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-display font-bold text-xl text-white mb-1">
              Need a Custom Growth Strategy Combining Multiple Services?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              We design unified growth roadmaps combining Personal Branding, SEO, and Paid Media for exponential leverage.
            </p>
          </div>
          <button
            onClick={onOpenAuditModal}
            className="whitespace-nowrap px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
          >
            Request Custom Proposal
          </button>
        </div>

      </div>
    </section>
  );
}
