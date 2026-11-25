import React, { useState } from 'react';
import { 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function AppMockup({ onEnrollClick }) {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      num: '01',
      title: 'Topic & Narrative Extraction (45 Mins)',
      tag: 'Brand Discovery',
      badgeColor: 'bg-blue-100 text-[#40108c]',
      description: 'You never stare at a blank screen. Our editorial director conducts a 45-minute sprint with you once a month, extracting your real-world case studies, contrarian opinions, and business stories.',
      deliverables: 'Custom 30-day content calendar, narrative positioning manifesto, and angle approval.'
    },
    {
      num: '02',
      title: '10, 15, or 20 Done-For-You Scripts',
      tag: 'Scriptwriting',
      badgeColor: 'bg-purple-100 text-purple-700',
      description: 'Our senior ghostwriters craft word-by-word video scripts tailored to your natural speaking rhythm. Every script is packed with 3-second psychological scroll-stoppers and high-retention storytelling.',
      deliverables: 'Teleprompter-ready scripts, visual B-roll cues, and custom call-to-actions.'
    },
    {
      num: '03',
      title: 'Filming with 1 to 3 Studio Backgrounds',
      tag: 'Studio Production',
      badgeColor: 'bg-[#40108c]/15 text-[#40108c]',
      description: 'Record all 10, 15, or 20 videos in a single 2-hour session. Based on your plan, we switch between 1, 2, or 3 high-end studio backgrounds (Executive Office, Moody Podcast Studio, Tech Set) so your content looks cinematic and varied.',
      deliverables: '1 to 3 unique environment setups, studio lighting, dual-angle 4K recording.'
    },
    {
      num: '04',
      title: 'Studio-Grade Editing & Motion Graphics',
      tag: 'Post-Production',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      description: 'Our editing team handles everything: precision jump cuts, sound effects, custom 2D/3D motion graphics, brand fonts, and animated subtitles optimized for 70%+ watch time on social feeds.',
      deliverables: 'Broadcast-ready 4K reels, custom thumbnails, and vertical/horizontal exports.'
    },
    {
      num: '05',
      title: 'Multi-Channel Publishing & Lead Conversion',
      tag: 'Growth & Inbound',
      badgeColor: 'bg-amber-100 text-amber-800',
      description: 'We publish your content at peak algorithmic hours across LinkedIn, Instagram Reels, and YouTube Shorts. We monitor comment velocity and route high-intent DMs straight into sales discovery calls.',
      deliverables: 'Full distribution management, comment nurture protocol, and monthly ROI reports.'
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-[#EDEEEC] overflow-hidden">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-handwriting text-2xl text-[#40108c] block mb-2 -rotate-2">
            the agency execution protocol
          </span>
          <h2 className="font-headline text-3xl sm:text-5xl text-[#111418] tracking-tight">
            Five stages. <br />
            <span className="font-serif-display italic font-normal text-4xl sm:text-6xl text-[#40108c]">
              One Done-For-You Production Machine.
            </span>
          </h2>
          <p className="text-neutral-600 text-sm mt-3">
            You spend 2 hours recording once a month. ScriptX does 100% of the heavy lifting.
          </p>
        </div>

        {/* macOS Window Frame Mockup */}
        <div className="rounded-3xl bg-white shadow-paper-lg border border-black/10 overflow-hidden">
          
          {/* macOS Top Bar */}
          <div className="bg-[#F6F6F4] px-5 py-3.5 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
              <span className="ml-3 font-mono text-[11px] text-neutral-400">
                scriptx-agency-portal.app / executive-production-pipeline
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 text-[#40108c] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f3c72b] animate-pulse"></span>
                ACTIVE CLIENT SPRINT
              </span>
            </div>
          </div>

          {/* Window Body: Sidebar + Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
            
            {/* Left Mock Sidebar */}
            <div className="md:col-span-4 bg-[#FBFBFA] p-5 border-r border-black/5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-2">
                  Agency Production Stages
                </div>

                <div className="space-y-1">
                  {stages.map((item, idx) => (
                    <button
                      key={item.num}
                      onClick={() => setActiveStage(idx)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                        activeStage === idx
                          ? 'bg-white shadow-sm border border-black/10 text-[#111418] font-bold'
                          : 'hover:bg-neutral-200/50 text-neutral-600 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-[#40108c] font-bold">{item.num}</span>
                        <span className="text-xs line-clamp-1">{item.tag}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 ${activeStage === idx ? 'text-[#40108c] rotate-90' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Package quick reminder */}
              <div className="mt-6 p-3 rounded-xl bg-white border border-black/5">
                <div className="flex justify-between text-[11px] text-neutral-500 mb-1 font-medium">
                  <span>Packages Available</span>
                  <span className="text-[#40108c] font-bold">10, 15, 20 Videos</span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  1, 2, or 3 studio background changes included per package.
                </p>
              </div>
            </div>

            {/* Right Main Pane: Active Stage Detail */}
            <div className="md:col-span-8 p-6 sm:p-10 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${stages[activeStage].badgeColor}`}>
                    Stage {stages[activeStage].num}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    Done-For-You Delivery
                  </span>
                </div>

                <h3 className="font-headline font-bold text-2xl sm:text-3xl text-[#111418] mb-4 leading-snug">
                  {stages[activeStage].title}
                </h3>

                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-8">
                  {stages[activeStage].description}
                </p>

                {/* Practical deliverables checklist */}
                <div className="p-4 rounded-2xl bg-[#FAF8FC] border border-[#40108c]/15 mb-6 text-xs text-neutral-700">
                  <span className="font-bold text-[#40108c] block mb-1 uppercase tracking-wider text-[10px] font-mono">
                    Client Deliverable:
                  </span>
                  <p className="font-medium text-[#111418]">
                    {stages[activeStage].deliverables}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="font-handwriting text-lg text-[#40108c]">
                  You invest 2 hours/mo. We do the rest.
                </span>
                <a
                  href="#pricing"
                  onClick={onEnrollClick}
                  className="px-5 py-2.5 rounded-full btn-brand-gradient text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <span>Select Video Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
