import React, { useState, useRef } from 'react';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  Maximize2
} from 'lucide-react';

import video5 from '../assets/videos/video_5.mp4';

export default function VideoBlock({ onEnrollClick }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(true);
      });
    }
  };

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
    <section className="py-20 md:py-28 bg-[#F4F4F2] border-t border-black/5 overflow-hidden">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
        
        {/* Headline with Gold Underline */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-xs border border-black/5 text-[#40108c] text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#f3c72b] animate-pulse"></span>
            <span>Master Video Production</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl text-[#111418] tracking-tight leading-tight">
            Built for executive authority.{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Tailored to your industry.</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#f3c72b]" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M 0 6 Q 100 12 200 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-4 max-w-xl mx-auto">
            We turn complex engineering breakthroughs and software metrics into viral reels and high-converting B2B LinkedIn videos.
          </p>
        </div>

        {/* Rounded Video Container — Exclusively Plays video_5.mp4 scaled to fill the player */}
        <div className="relative rounded-3xl overflow-hidden shadow-paper-lg bg-[#080312] border border-black/10 aspect-video max-w-4xl mx-auto group">
          
          <video
            ref={videoRef}
            src={video5}
            playsInline
            controls={isPlaying}
            muted={isMuted}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover object-center scale-[1.02] transition-transform duration-300"
          />

          {/* Paused state overlay */}
          {!isPlaying && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 flex flex-col items-center justify-center text-center p-6 cursor-pointer"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full btn-brand-gradient text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-[#f3c72b]/50 cursor-pointer"
              >
                <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1 text-white" />
              </button>
              <p className="text-white font-headline font-bold text-base sm:text-xl mt-4">
                Watch: ScriptX Executive Production Showcase
              </p>
              <span className="text-xs text-[#f3c72b] font-mono mt-1">
                Official Production Showcase Video • Produced by ScriptX
              </span>
            </div>
          )}

          {/* Top Right Controls (Mute/Unmute & Fullscreen) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#f3c72b]" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'Muted' : 'Sound On'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs border border-white/10 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Bottom Floating Creator Chip */}
          <div className="absolute bottom-4 left-4 right-4 hidden sm:flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#40108c] to-[#f3c72b] p-0.5">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                  alt="Agency Lead" 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm">ScriptX Production Team</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#40108c]/40 text-[#f3c72b] text-[10px] font-mono border border-[#f3c72b]/30">Verified Showcase</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Setup: <strong>Cinematic Studio Lighting & 4K Multi-Angle Recording</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#pricing"
                onClick={onEnrollClick}
                className="px-4 py-2 rounded-xl btn-brand-gradient text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md cursor-pointer border border-[#f3c72b]/40"
              >
                <span>Explore Retainers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Price Strip Ribbon below Video */}
        <div className="mt-8 max-w-4xl mx-auto rounded-2xl bg-white p-4 shadow-paper border border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f3c72b] animate-ping"></span>
            <span className="font-headline font-bold text-sm text-[#111418]">ScriptX Retainers:</span>
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-[#111418] font-bold">10 Videos (40K)</span>
            <span className="px-2.5 py-1 rounded-md bg-[#40108c]/10 text-[#40108c] font-bold">15 Videos (60K)</span>
            <span className="px-2.5 py-1 rounded-md bg-[#40108c]/20 text-[#40108c] font-bold">20 Videos (80K)</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-500">
            <span>Includes 1-3 Studio Background Changes</span>
            <span>•</span>
            <span className="text-[#40108c] font-semibold">100% Done-For-You</span>
          </div>
        </div>

      </div>
    </section>
  );
}
