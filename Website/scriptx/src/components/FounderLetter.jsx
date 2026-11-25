import React from 'react';

export default function FounderLetter() {
  return (
    <section className="py-24 md:py-36 bg-[#F4F4F2] border-t border-black/5 relative overflow-hidden">
      
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 relative">
        
        {/* Section Tag */}
        <div className="text-center mb-12">
          <span className="font-handwriting text-2xl text-[#40108c] block mb-1">
            from the agency leadership
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl text-[#111418] tracking-tight">
            A personal note to founders & domain experts.
          </h2>
        </div>

        {/* Stacked Paper Pages Container */}
        <div className="relative">
          
          <div className="absolute inset-0 bg-neutral-200 rounded-3xl transform rotate-2 translate-y-3 shadow-sm pointer-events-none"></div>
          <div className="absolute inset-0 bg-[#FBFBFA] rounded-3xl transform -rotate-1 translate-y-1.5 shadow-sm pointer-events-none"></div>

          {/* Main Paper Sheet */}
          <div className="relative bg-[#FFFFFF] rounded-3xl p-8 sm:p-14 shadow-paper-lg border border-black/5 z-10">
            
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 tape-strip z-20"></div>

            {/* Letter Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-neutral-100 gap-2">
              <div>
                <span className="font-headline font-bold text-sm text-[#111418] block">
                  Karan Joahiel
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Founder & ScriptX Private Limited
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400 bg-neutral-50 px-3 py-1 rounded-full border border-black/5">
                READ TIME: 2 MINUTES
              </span>
            </div>

            {/* Letter Body with Editorial Drop Cap */}
            <div className="font-editorial text-base sm:text-lg text-neutral-800 leading-relaxed space-y-6">
              
              <p className="first-letter:text-6xl first-letter:font-serif-display first-letter:text-[#111418] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                In modern business, people don't buy from logos or generic corporate websites anymore. People buy from authentic, credible human beings they recognize and trust.
              </p>

              <p>
                Yet almost every high-performing founder, doctor, and tech leader I meet faces the exact same painful trade-off: <span className="marker-highlight">You have 0 hours a week to write scripts, record videos, and edit content.</span>
              </p>

              <p>
                You shouldn't have to become a full-time video influencer. You have an engineering team to manage, patients to treat, and enterprise clients to close. Your time is too valuable to spend 15 hours inside video editing timelines.
              </p>

              <p>
                That is why we built <strong>ScriptX</strong>. We are not a generic course. We are an end-to-end Done-For-You Personal Branding Agency. We do 95% of the heavy lifting: we extract your ideas in 45 minutes, write every single script, film with 1 to 3 cinematic studio backgrounds, and deliver 10, 15, or 20 polished 4K videos straight to your feeds every month.
              </p>

              <p>
                Our clients don't just get vanity likes. They close $50,000+ consulting contracts, attract tier-1 recruits, and get invited to keynote conferences because they become the undeniable voice of their market.
              </p>

              <p className="italic">
                Staying invisible in your industry is a massive business liability. Let ScriptX engineer your authority while you focus on what you do best.
              </p>

            </div>

            {/* Handwritten Signature and Polaroids */}
            <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="font-handwriting text-2xl text-[#40108c] block">
                  To your market dominance,
                </span>
                <span className="font-serif-display italic text-3xl text-[#111418] font-bold block mt-1">
                  Karan Joahiel
                </span>
                <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                  Founder, ScriptX Private Limited
                </span>
              </div>

              {/* Taped Polaroid on bottom right */}
              <div className="relative p-2.5 pb-4 bg-white rounded-lg shadow-paper border border-black/10 rotate-3 max-w-[190px]">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 tape-strip"></div>
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80" 
                  alt="ScriptX Studio Production"
                  className="w-full h-24 object-cover rounded" 
                />
                <span className="font-handwriting text-xs text-neutral-700 block text-center mt-2">
                  ScriptX studio shoot day
                </span>
              </div>
            </div>

          </div>

          <div className="hidden lg:block absolute -right-10 top-24 w-44 p-4 rounded-xl bg-[#FFE27A] text-[#4A3B00] shadow-paper rotate-6 border border-black/5 z-20">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 tape-strip"></div>
            <p className="font-handwriting text-sm leading-snug">
              "Authority isn't what you know. It's who trusts you when you speak on video."
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
