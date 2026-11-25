import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowRight, 
  Sparkles, 
  Palette, 
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';

import video1 from '../assets/videos/video_1.mp4';
import video2 from '../assets/videos/video_2.mp4';
import video3 from '../assets/videos/video_3.mp4';
import video4 from '../assets/videos/video_4.mp4';

export default function VideoModal({ 
  isOpen, 
  onClose, 
  onOpenAuditModal,
  initialVideoIndex = 0 
}) {
  const [activeVideo, setActiveVideo] = useState(initialVideoIndex || 0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  const playlist = [
    {
      id: 0,
      title: 'Ayush Singh — AI Founder Persona',
      role: 'Founder & CEO, OmniFlow AI',
      category: '15 Videos Plan • 2 Studio Sets',
      duration: '0:45',
      badge: 'B2B SaaS Authority',
      src: video1,
      bgSetup: 'Executive Boardroom + Tech Set',
      results: '+1.8M Monthly Impressions • 14 Enterprise DMs'
    },
    {
      id: 1,
      title: 'Chandranshu Bhardwaj — VC Managing Director',
      role: 'Managing Director, Apex Venture Capital',
      category: '20 Videos Plan • 3 Studio Sets',
      duration: '0:38',
      badge: 'Venture Capital Brand',
      src: video2,
      bgSetup: 'High-Rise Office + Fireside Lounge + Studio',
      results: '4x Inbound Tier-1 Founder Deal Flow'
    },
    {
      id: 2,
      title: 'Saksham Bhasin — Technical CTO Breakdown',
      role: 'Co-Founder & CTO, CloudScale Systems',
      category: '10 Videos Plan • 1 Studio Set',
      duration: '0:42',
      badge: 'Tech Authority Moat',
      src: video3,
      bgSetup: 'Modern Minimalist Key & Rim Lighting',
      results: '3 Senior Tech Hires Closed via LinkedIn Authority'
    },
    {
      id: 3,
      title: 'Elena Rostova — Executive Strategy Narrative',
      role: 'Principal Partner, Rostova Global Strategy',
      category: '15 Videos Plan • 2 Studio Sets',
      duration: '0:35',
      badge: 'Consulting Authority',
      src: video4,
      bgSetup: 'Cinematic Studio with 3-Point Lighting',
      results: 'Average Consulting Deal Size Grew to $95k+'
    }
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented by browser policy
        });
      }
    }
  }, [activeVideo]);

  if (!isOpen) return null;

  const current = playlist[activeVideo] || playlist[0];

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl rounded-3xl bg-white border border-black/10 p-5 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.2)] text-[#111418] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#40108c]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f3c72b]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-[#111418] flex items-center justify-center transition-colors border border-black/5 z-30 cursor-pointer"
          title="Close Video Showcase"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8FC] border border-[#40108c]/25 text-[#40108c] text-xs font-mono font-bold mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f3c72b]" />
            <span>SCRIPTX PERSONAL BRANDING SHOWCASE • 4 VIDEOS</span>
          </div>

          <h3 className="font-headline font-black text-xl sm:text-3xl text-[#111418] tracking-tight">
            Client Personal Branding Videos
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Real short-form videos scripted, directed, and produced by ScriptX for founders and executives.
          </p>
        </div>

        {/* 4 Video Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {playlist.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveVideo(idx)}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                activeVideo === idx
                  ? 'btn-brand-gradient text-white border-[#f3c72b] shadow-md scale-[1.02]'
                  : 'bg-[#F9F9F7] border border-black/10 text-neutral-600 hover:text-[#111418] hover:border-black/20 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  activeVideo === idx ? 'bg-[#f3c72b] text-slate-950 font-bold' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  0{idx + 1}
                </span>
                <span className={`text-[10px] font-mono font-semibold ${activeVideo === idx ? 'text-[#f3c72b]' : 'text-[#40108c]'}`}>
                  {item.duration}
                </span>
              </div>
              <div className={`font-headline font-bold text-xs truncate ${activeVideo === idx ? 'text-white' : 'text-[#111418]'}`}>
                {item.title.split('—')[0]}
              </div>
              <div className={`text-[10px] truncate mt-0.5 ${activeVideo === idx ? 'text-white/80' : 'text-neutral-500'}`}>
                {item.badge}
              </div>
            </button>
          ))}
        </div>

        {/* Actual Video Player Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-[16/9] border border-black/10 shadow-2xl group mb-5">
          <video
            ref={videoRef}
            src={current.src}
            controls
            playsInline
            muted={isMuted}
            className="w-full h-full object-contain bg-black"
          />

          {/* Quick Audio Mute/Unmute Overlay Button */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#f3c72b]" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Video Metadata & Retainer Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-xs">
          <div className="p-3 rounded-xl bg-[#F9F9F7] border border-black/10">
            <span className="text-[10px] font-mono uppercase text-[#40108c] font-bold block mb-1">
              Active Client:
            </span>
            <div className="font-bold text-[#111418] text-sm">{current.title}</div>
            <div className="text-neutral-500 text-[11px] mt-0.5">{current.role}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F9F7] border border-black/10">
            <span className="text-[10px] font-mono uppercase text-[#40108c] font-bold block mb-1">
              Production Setup:
            </span>
            <div className="font-bold text-[#111418] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#f3c72b]" />
              <span>{current.bgSetup}</span>
            </div>
            <div className="text-neutral-500 text-[11px] mt-0.5">{current.category}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F9F7] border border-black/10">
            <span className="text-[10px] font-mono uppercase text-[#40108c] font-bold block mb-1">
              Verified Growth Metric:
            </span>
            <div className="font-bold text-emerald-600">{current.results}</div>
            <div className="text-neutral-500 text-[11px] mt-0.5">100% Inbound Lead Attraction</div>
          </div>
        </div>

        {/* Bottom CTA Row with WhatsApp Booking trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-black/10">
          <div className="text-xs text-neutral-600 text-center sm:text-left">
            <span>Want high-retention personal branding videos like this for your brand?</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenAuditModal();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full btn-brand-gradient text-white font-headline font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all border border-[#f3c72b]/50 cursor-pointer"
            >
              <span>Get Started with This Video Style &rarr;</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
