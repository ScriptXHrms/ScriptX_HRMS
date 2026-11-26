import React, { useState, useRef } from 'react';
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import video5 from '../assets/videos/video_5.mp4';
import person1 from '../assets/Person_1.jpeg';

export default function LaneVideoShowcase() {
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
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#F3EFFE] via-[#FAF8FF] to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        
        {/* Large Rounded Video Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] bg-neutral-900 border border-neutral-200/60 group">
          
          <video
            ref={videoRef}
            src={video5}
            playsInline
            controls={isPlaying}
            muted={isMuted}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            poster={person1}
            className="w-full h-full object-cover object-center"
          />

          {/* Paused state overlay with Person_1.jpeg thumbnail matching user request */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-10 cursor-pointer overflow-hidden"
            >
              {/* Person_1.jpeg Background Cover Image */}
              <img
                src={person1}
                alt="ScriptX Video Production"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
              />

              {/* Dark subtle overlay for contrast */}
              <div className="absolute inset-0 bg-neutral-950/40 hover:bg-neutral-950/30 transition-colors flex flex-col items-center justify-center text-center p-6">
                
                {/* Central Glass Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/35 backdrop-blur-md border border-white/50 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group-hover:bg-white/45"
                  aria-label="Play Video"
                >
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1 text-white" />
                </button>

                {/* Caption from Reference Images */}
                <p className="text-white font-medium text-sm sm:text-base mt-6 tracking-wide drop-shadow-md">
                  Watch my all activities
                </p>
              </div>
            </div>
          )}

          {/* Top Video Controls (Sound & Fullscreen) */}
          {isPlaying && (
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs border border-white/20 transition-all cursor-pointer"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-[#703BF7]" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFullscreen();
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs border border-white/20 transition-all cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
