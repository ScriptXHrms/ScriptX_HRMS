import React, { useState, useRef, useEffect } from 'react';
import { 
  Hand, 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StickyBoard({ onEnrollClick }) {
  const [activeTool, setActiveTool] = useState('hand');
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startDraw = (e) => {
    if (activeTool === 'hand') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawing.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'pen') {
      ctx.strokeStyle = '#40108c';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (activeTool === 'eraser') {
      ctx.strokeStyle = '#F4F4F2';
      ctx.lineWidth = 20;
    }
  };

  const draw = (e) => {
    if (!isDrawing.current || activeTool === 'hand') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const stickyNotes = [
    {
      num: '01',
      bg: 'bg-[#FFE27A]',
      textColor: 'text-[#4A3B00]',
      rotate: '-2.5deg',
      title: 'Zero Time to Produce Videos',
      text: 'You have deep domain mastery, but between managing your business and clients, you do not have 15 hours a week to write scripts and edit.',
      annotation: '“I need a team to do 95% of the work”'
    },
    {
      num: '02',
      bg: 'bg-[#F6B8CC]',
      textColor: 'text-[#5E122A]',
      rotate: '2deg',
      title: 'Burned by Cheap Freelancers',
      text: 'You hired cheap video editors on Fiverr/Upwork and got generic, cringe subtitles, stock footage clips, and zero measurable business leads.',
      annotation: '“Freelancers didn’t understand my industry”'
    },
    {
      num: '03',
      bg: 'bg-[#BDE8C4]',
      textColor: 'text-[#0E4416]',
      rotate: '-1.8deg',
      title: 'Competitors Taking Your Deals',
      text: 'You watch competitors with 1/10th your competence land high-ticket clients, podcast invites, and speaking gigs because they post video consistently.',
      annotation: '“They are winning purely on visibility”'
    },
    {
      num: '04',
      bg: 'bg-[#CDBEF5]',
      textColor: 'text-[#2D1A5E]',
      rotate: '3deg',
      title: 'Need a Turnkey Video Agency',
      text: 'You want a Done-For-You agency to write 10-20 scripts, direct you on camera with 1-3 studio setups, and handle 100% of editing and distribution.',
      annotation: '“Hand me scripts, shoot, and scale my pipeline”'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-board-dots relative overflow-hidden border-t border-black/5 select-none">
      
      {/* Scoped Drawing Toolbar (relative to this board only) */}
      <div className="absolute left-4 top-28 z-30 hidden lg:flex flex-col gap-2 p-2 rounded-2xl bg-white shadow-paper border border-black/10">
        <button
          onClick={() => setActiveTool('hand')}
          className={`p-2.5 rounded-xl transition-all ${activeTool === 'hand' ? 'bg-[#111418] text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}
          title="Hand (Drag notes)"
        >
          <Hand className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTool('pen')}
          className={`p-2.5 rounded-xl transition-all ${activeTool === 'pen' ? 'bg-[#40108c] text-white shadow-md' : 'hover:bg-neutral-100 text-neutral-600'}`}
          title="Violet Pen (Draw on board)"
        >
          <PenTool className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTool('eraser')}
          className={`p-2.5 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-[#40108c] text-white shadow-md' : 'hover:bg-neutral-100 text-neutral-600'}`}
          title="Eraser"
        >
          <Eraser className="w-5 h-5" />
        </button>
        <button
          onClick={clearCanvas}
          className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-all border-t border-black/5"
          title="Clear Board"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 relative min-h-[750px]">
        
        {/* Drawing Canvas Overlay */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className={`absolute inset-0 z-20 w-full h-full ${activeTool === 'hand' ? 'pointer-events-none' : 'cursor-crosshair'}`}
        />

        {/* Section Headline with Yellow "you?" sticker */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="font-handwriting text-2xl text-[#40108c] -rotate-3">
              executive reality check
            </span>
          </div>

          <h2 className="font-headline text-4xl sm:text-6xl text-[#111418] tracking-tight relative inline-block">
            Is this{' '}
            <span className="relative inline-block ml-1">
              <span className="font-serif-display italic font-normal text-5xl sm:text-7xl">you?</span>
              <span className="absolute -top-3 -right-8 px-2.5 py-0.5 rounded-md bg-[#FFD93D] text-[#111418] font-handwriting text-lg font-bold rotate-12 shadow-sm border border-black/10">
                really?
              </span>
            </span>
          </h2>

          <p className="text-neutral-600 text-sm sm:text-base mt-4 max-w-lg mx-auto">
            You don't have a content problem. You have a <span className="line-through decoration-[#f3c72b] decoration-2">production bottleneck</span>. What you need is a{' '}
            <span className="relative font-bold text-[#111418]">
              Done-For-You Agency Engine
              <svg className="absolute -inset-1.5 -top-1 w-[115%] h-[140%] text-[#40108c] pointer-events-none" viewBox="0 0 120 40" fill="none">
                <path d="M 5 20 Q 20 2 60 5 Q 110 8 115 22 Q 110 38 60 36 Q 10 34 8 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>.
          </p>
        </div>

        {/* SVG Connecting Strings between Notes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block" style={{ height: '650px' }}>
          <path d="M 220 280 Q 380 230 520 290" stroke="#40108c" strokeWidth="2" strokeDasharray="6 6" fill="none" opacity="0.6" />
          <path d="M 520 290 Q 680 340 840 280" stroke="#40108c" strokeWidth="2" strokeDasharray="6 6" fill="none" opacity="0.6" />
          <path d="M 520 290 Q 560 450 560 540" stroke="#f3c72b" strokeWidth="2" strokeDasharray="6 6" fill="none" opacity="0.7" />
        </svg>

        {/* Draggable Sticky Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-16">
          {stickyNotes.map((note) => (
            <motion.div
              key={note.num}
              drag={activeTool === 'hand'}
              dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
              style={{ transform: `rotate(${note.rotate})` }}
              whileHover={{ scale: 1.03, zIndex: 30 }}
              className={`p-6 rounded-2xl ${note.bg} ${note.textColor} shadow-paper border border-black/10 relative transition-shadow cursor-grab active:cursor-grabbing`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 tape-strip"></div>
              
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[#40108c] shadow-sm flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white"></div>
              </div>

              <span className="font-mono text-xs font-bold opacity-60 block mb-2">
                BOTTLENECK {note.num}
              </span>

              <h4 className="font-headline font-bold text-base mb-2">
                {note.title}
              </h4>

              <p className="text-xs sm:text-sm leading-relaxed mb-4 opacity-90">
                {note.text}
              </p>

              <div className="pt-3 border-t border-black/10 font-handwriting text-base font-semibold">
                {note.annotation}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gold Ticket Agency Partnership CTA */}
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#E9C46A] via-[#F5E2A0] to-[#E9C46A] text-[#111418] shadow-paper-lg border border-[#D4AF37]/40 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#EDEEEC] border-r border-[#D4AF37]/50"></div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#EDEEEC] border-l border-[#D4AF37]/50"></div>

            <div className="pl-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-900 fill-amber-900" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  ScriptX Executive Retainer
                </span>
              </div>
              <h3 className="font-headline font-black text-xl sm:text-2xl text-[#111418]">
                Stop Being Invisible. Start Scaling.
              </h3>
              <p className="text-xs sm:text-sm text-amber-950/80 max-w-sm mt-0.5">
                Join 250+ CEOs turning 2 hours a month into 10 to 20 cinematic videos.
              </p>
            </div>

            <a
              href="#pricing"
              onClick={onEnrollClick}
              className="whitespace-nowrap px-6 py-3.5 rounded-full btn-brand-gradient text-white font-headline font-bold text-xs tracking-tight shadow-md flex items-center gap-2 hover:scale-105 transition-all mr-4"
            >
              <span>Explore Retainers</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFD93D]" />
            </a>

          </div>
        </div>

      </div>
    </section>
  );
}
