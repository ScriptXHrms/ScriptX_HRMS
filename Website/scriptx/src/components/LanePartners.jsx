import React from 'react';

export default function LanePartners() {
  const partnersRow1 = [
    { name: 'BCG', sub: 'BOSTON CONSULTING GROUP' },
    { name: 'dailypay.', dotColor: '#00D09C' },
    { name: 'Tweewieler', icon: '🚲' },
    { name: 'PFALZWERKE', isPfalz: true },
    { name: 'airbnb', icon: '🏠', color: '#FF5A5F' },
    { name: 'actionCOACH', isAction: true },
    { name: 'Allstate', icon: '🤝' },
    { name: 'brave', icon: '🦁', color: '#FB542B' }
  ];

  const partnersRow2 = [
    { name: 'zepto', color: '#EE4E34' },
    { name: 'binocs', icon: '👓' },
    { name: 'credova', color: '#2563EB' },
    { name: 'FlySafair', icon: '✈️', color: '#E11D48' },
    { name: 'Jeven', isJeven: true },
    { name: 'Allbridge', icon: '🌉' },
    { name: 'Calm', icon: '🧘', color: '#0284C7' }
  ];

  return (
    <section className="py-14 sm:py-16 bg-gradient-to-b from-[#F5F2FE] via-[#FAF8FF] to-white border-b border-neutral-100/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
        
        {/* Section Heading */}
        <h3 className="text-xl sm:text-2xl font-bold text-[#703BF7] tracking-tight mb-8 font-sans">
          Partners and Clients
        </h3>

        {/* Logos Container */}
        <div className="space-y-3.5">
          
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            {partnersRow1.map((p, i) => (
              <div
                key={i}
                className="bg-white/90 hover:bg-white rounded-full px-4 sm:px-5 py-2 border border-neutral-200/60 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800"
              >
                {p.icon && <span className="text-sm">{p.icon}</span>}
                {p.dotColor && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.dotColor }} />}
                <span className="tracking-tight">{p.name}</span>
                {p.sub && <span className="text-[9px] text-neutral-400 font-normal hidden lg:inline">{p.sub}</span>}
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            {partnersRow2.map((p, i) => (
              <div
                key={i}
                className="bg-white/90 hover:bg-white rounded-full px-4 sm:px-5 py-2 border border-neutral-200/60 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800"
              >
                {p.icon && <span className="text-sm">{p.icon}</span>}
                <span className="tracking-tight" style={{ color: p.color || undefined }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
