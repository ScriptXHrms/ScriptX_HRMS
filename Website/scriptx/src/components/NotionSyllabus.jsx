import React, { useState } from 'react';
import { 
  ChevronDown, 
  CheckCircle2, 
  Globe, 
  Paperclip,
  Clock,
  Video,
  FileCode,
  Share2,
  Star
} from 'lucide-react';

export default function NotionSyllabus() {
  const [language, setLanguage] = useState('en'); // 'en' or 'ta'
  const [expandedWeek, setExpandedWeek] = useState(0);

  const syllabus = [
    {
      week: 'Week 01',
      titleEn: 'Narrative Strategy & 10-20 Custom Script Handover',
      titleTa: 'Brand உத்தி & 10-20 ஸ்கிரிப்ட் உருவாக்கம்',
      duration: '45-Min Discovery Sprint • 100% Done-For-You',
      descEn: 'We extract your core expertise, client wins, and contrarian perspectives. Our senior ghostwriters craft 10, 15, or 20 teleprompter-ready scripts with 3-second scroll-stopping hooks.',
      descTa: 'உங்கள் அனுபவத்தை வைத்து 10, 15 அல்லது 20 முழுமையான ஸ்கிரிப்டுகளை நாங்கள் எழுதித் தருவோம்.',
      lessons: [
        { titleEn: '1.1 Executive Narrative Interview (45 Mins Zoom Sprint)', titleTa: '1.1 45 நிமிட பிராண்ட் நேர்காணல் மற்றும் தலைப்புகள் தேர்வு', time: '45m' },
        { titleEn: '1.2 10, 15, or 20 Tailored Scripts Handover for Your Review', titleTa: '1.2 உங்கள் மதிப்பாய்வுக்காக முழு ஸ்கிரிப்ட்கள் ஒப்படைப்பு', time: 'Done' },
        { titleEn: '1.3 Visual Angle & 1 to 3 Background Environment Selection', titleTa: '1.3 1 முதல் 3 ஸ்டுடியோ Background செட்டப்கள் தேர்வு', time: 'Done' }
      ],
      resourcesEn: '10-20 Written Scripts • Notion Content Hub • Visual Cue Sheets',
      resourcesTa: '10-20 முழு ஸ்கிரிப்ட்கள் • Notion Content Hub • Visual Cue Sheets'
    },
    {
      week: 'Week 02',
      titleEn: 'Shoot Day: 1, 2, or 3 Studio Background Environments',
      titleTa: 'ஷூட்டிங் நாள்: 1 முதல் 3 ஸ்டுடியோ Background அமைப்புகள்',
      duration: '2 Hours Total Filming • Live Directing',
      descEn: 'Record all your monthly videos in one seamless 2-hour shoot session. Based on your plan, we transition between 1, 2, or 3 cinematic background setups with professional 3-point lighting.',
      descTa: 'மாதத்திற்கு ஒரே ஒரு 2 மணிநேர ஷூட்டிங். 1, 2 அல்லது 3 ஸ்டுடியோ செட்டப்களில் சினிமா தர பதிவு.',
      lessons: [
        { titleEn: '2.1 Live On-Camera Coaching & Teleprompter Guidance', titleTa: '2.1 கேமராவில் இயல்பாகப் பேச நேரடி வழிகாட்டுதல்', time: '30m' },
        { titleEn: '2.2 Background Set 1 & Set 2/3 Lighting Calibration', titleTa: '2.2 ஸ்டுடியோ Background லைட்டிங் மற்றும் ஆடியோ அமைப்பு', time: '45m' },
        { titleEn: '2.3 Multi-Take 4K Audio & Video Capture (10, 15, or 20 Videos)', titleTa: '2.3 4K வீடியோ மற்றும் ஸ்டுடியோ மைக் பதிவு', time: '60m' }
      ],
      resourcesEn: '4K ProRes RAW Footage • Studio Audio Calibration • Teleprompter App',
      resourcesTa: '4K வீடியோ கோப்புகள் • ஸ்டுடியோ ஆடியோ கேலிப்ரேஷன்'
    },
    {
      week: 'Week 03',
      titleEn: 'Studio-Grade Editing, Motion Graphics & Sound Design',
      titleTa: 'சினிமா தர எடிட்டிங் & Motion Graphics',
      duration: '4-5 Days Turnaround • Unlimited Tweaks',
      descEn: 'Our post-production team edits your videos with dynamic pacing, sound design, 2D/3D brand motion graphics, custom color grading, animated subtitles, and high-CTR thumbnails.',
      descTa: 'டைனமிக் எடிட்டிங், சவுண்ட் எஃபெக்ட்ஸ், மோஷன் கிராபிக்ஸ் மற்றும் அனிமேஷன் சப்டைட்டில்கள்.',
      lessons: [
        { titleEn: '3.1 Precision Jump Cuts & Hook Retention Acceleration', titleTa: '3.1 முதல் 3 வினாடிகளில் பார்வையாளர்களை ஈர்க்கும் எடிட்டிங்', time: 'Done' },
        { titleEn: '3.2 Custom 2D/3D Motion Graphic Overlays & Brand Typography', titleTa: '3.2 பிராண்ட் வண்ணங்கள் மற்றும் 2D/3D கிராபிக்ஸ்', time: 'Done' },
        { titleEn: '3.3 Click-Optimized Thumbnail Covers for LinkedIn, IG & YouTube', titleTa: '3.3 கிளிக் செய்ய வைக்கும் உயர் தர Thumbnails', time: 'Done' }
      ],
      resourcesEn: 'Frame.io Video Review Dashboard • Thumbnail Assets • Master 4K Files',
      resourcesTa: 'Frame.io Review போர்டல் • Thumbnail வடிவமைப்பு'
    },
    {
      week: 'Week 04',
      titleEn: 'Multi-Channel Publishing & Inbound Pipeline Conversion',
      titleTa: 'சோஷியல் மீடியா வெளியீடு & வாடிக்கையாளர் Inbound Deals',
      duration: 'Ongoing Daily Distribution • Analytics Tracking',
      descEn: 'We distribute your videos at peak algorithmic windows across LinkedIn, Instagram Reels, and YouTube Shorts. We monitor comment velocity and qualify inbound DMs into booked sales calls.',
      descTa: 'LinkedIn, Instagram & YouTube-ல் சரியான நேரத்தில் வீடியோ பதிவேற்றம் மற்றும் புதிய வாடிக்கையாளர்கள் இணைப்பு.',
      lessons: [
        { titleEn: '4.1 Algorithmic Scheduling (LinkedIn, IG Reels, YouTube Shorts)', titleTa: '4.1 அல்காரிதம் டைமிங்கில் சரியான நேரத்தில் பதிவேற்றம்', time: 'Daily' },
        { titleEn: '4.2 Executive Inbound DM Routing & Lead Qualifier Protocol', titleTa: '4.2 DMs மூலம் வரும் வாடிக்கையாளர்களை கன்சல்டிங் கால்களுக்கு மாற்றுவது', time: 'Daily' },
        { titleEn: '4.3 Monthly Reach, Engagement & Closed Revenue Reporting', titleTa: '4.3 மாத இறுதி பார்வையாளர்கள் & வருமான அறிக்கை', time: 'Monthly' }
      ],
      resourcesEn: 'Monthly Analytics ROI Dashboard • DM Funnel Swipe File',
      resourcesTa: 'மாதாந்திர ROI டேஷ்போர்டு • DM Funnel வழிகாட்டி'
    }
  ];

  return (
    <section className="py-24 md:py-36 bg-[#EDEEEC] border-t border-black/5 overflow-hidden">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-black/5 text-[#40108c] text-xs font-semibold uppercase tracking-wider mb-3">
            <Paperclip className="w-3.5 h-3.5 text-[#f3c72b]" />
            <span>ScriptX Client Production Portal</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl text-[#111418] tracking-tight">
            Inside the ScriptX <br />
            <span className="font-serif-display italic font-normal text-4xl sm:text-6xl text-[#40108c]">
              Monthly Production Hub.
            </span>
          </h2>
          <p className="text-neutral-600 text-sm mt-3">
            Explore how we manage your 10, 15, or 20 videos every month. Switch between English and Tamil (தமிழ்).
          </p>
        </div>

        {/* Notion Luxury Workspace Container */}
        <div className="rounded-3xl bg-white shadow-paper-lg border border-black/10 overflow-hidden">
          
          {/* Notion Header Banner with sophisticated #40108c & #f3c72b titanium cover */}
          <div className="h-32 sm:h-40 bg-gradient-to-br from-[#12072B] via-[#1C0B40] to-[#0A0318] border-b border-[#f3c72b]/30 relative p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-40 bg-[#40108c]/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-32 bg-[#f3c72b]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between text-white/80 text-xs relative z-10">
              <span className="font-mono bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-[#f3c72b]/30 text-[11px] text-[#f3c72b] font-bold">
                ⚡ SCRIPTX AGENCY WORKSPACE
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] border border-white/10 text-neutral-200">
                  <Star className="w-3.5 h-3.5 text-[#f3c72b] fill-[#f3c72b]" /> Active Retainer
                </span>
                <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] border border-white/10 text-neutral-200">
                  <Share2 className="w-3.5 h-3.5" /> Client Portal
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-white/90 text-xs font-mono">
                <span>ScriptX</span>
                <span>/</span>
                <span>Executive Clients</span>
                <span>/</span>
                <span className="text-white font-bold">Monthly-Video-Production-Hub.md</span>
              </div>

              {/* Language Switcher Button on Cover */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/20">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-white text-[#111418] shadow-sm font-bold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ta')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    language === 'ta'
                      ? 'btn-brand-gradient text-white shadow-sm font-bold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  தமிழ் (Tamil)
                </button>
              </div>
            </div>
          </div>

          {/* Notion Page Content */}
          <div className="p-6 sm:p-10">
            
            {/* Page Title & Metadata Strip */}
            <div className="pb-6 mb-8 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8FC] border border-neutral-200 shadow-sm flex items-center justify-center text-2xl mb-4 -mt-12 relative z-10">
                🎬
              </div>
              <h3 className="font-headline font-bold text-2xl sm:text-3xl text-[#111418]">
                {language === 'en' ? 'The Monthly Executive Video Sprint' : 'மாதாந்திர பிராண்டிங் & வீடியோ உற்பத்தி அட்டவணை'}
              </h3>
              
              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-600 font-mono">
                <span className="flex items-center gap-1 bg-[#F4F4F2] px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-[#40108c]" /> 2 Hours/Month Founder Time
                </span>
                <span className="flex items-center gap-1 bg-[#F4F4F2] px-2.5 py-1 rounded-md">
                  <Video className="w-3.5 h-3.5 text-[#40108c]" /> 10, 15, or 20 Videos Delivered
                </span>
                <span className="flex items-center gap-1 bg-[#F4F4F2] px-2.5 py-1 rounded-md">
                  <FileCode className="w-3.5 h-3.5 text-emerald-600" /> 1 to 3 Studio Backgrounds
                </span>
              </div>
            </div>

            {/* Weekly Accordion Modules */}
            <div className="space-y-4">
              {syllabus.map((item, idx) => {
                const isExpanded = expandedWeek === idx;
                return (
                  <div
                    key={item.week}
                    className={`rounded-2xl transition-all duration-300 border ${
                      isExpanded 
                        ? 'bg-[#FAF8FC] border-[#f3c72b]/50 shadow-md' 
                        : 'bg-white border-black/5 hover:border-black/10'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedWeek(isExpanded ? -1 : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <span className="font-mono text-xs font-bold text-[#40108c] bg-[#40108c]/10 px-2.5 py-1 rounded-md mt-0.5 border border-[#40108c]/20">
                          {item.week}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline font-bold text-base sm:text-lg text-[#111418]">
                              {language === 'en' ? item.titleEn : item.titleTa}
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-500 mt-1 line-clamp-1">
                            {language === 'en' ? item.descEn : item.descTa}
                          </p>
                          <span className="text-[11px] text-neutral-400 font-mono mt-1 block">
                            {item.duration}
                          </span>
                        </div>
                      </div>

                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isExpanded ? 'rotate-180 bg-[#111418] text-white shadow-sm' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {/* Expanded Lessons */}
                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-black/5 space-y-3">
                        <div className="space-y-2">
                          {item.lessons.map((lesson, lIdx) => (
                            <div key={lIdx} className="flex items-center justify-between text-xs sm:text-sm text-neutral-700 p-3 rounded-xl bg-white border border-black/5 shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#40108c] flex-shrink-0" />
                                <span>{language === 'en' ? lesson.titleEn : lesson.titleTa}</span>
                              </div>
                              <span className="text-[11px] font-mono text-neutral-400 font-bold ml-2">
                                {lesson.time}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Resource attachment pill */}
                        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-[#40108c]/5 to-[#f3c72b]/15 border border-[#f3c72b]/40 text-xs text-neutral-800 font-medium">
                          <Paperclip className="w-4 h-4 text-[#40108c] flex-shrink-0" />
                          <span>
                            <strong>{language === 'en' ? 'Client Assets Included:' : 'இணைக்கப்பட்டுள்ள கருவிகள்:'}</strong>{' '}
                            {language === 'en' ? item.resourcesEn : item.resourcesTa}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
