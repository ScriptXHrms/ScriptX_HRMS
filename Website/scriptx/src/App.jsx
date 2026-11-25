import React, { useState } from 'react';
import './App.css';

// Core Sections (ContactSection removed from page flow, moved into BookingModal popup)
import CreatorHero from './components/CreatorHero';
import AppMockup from './components/AppMockup';
import VideoBlock from './components/VideoBlock';
import StickyBoard from './components/StickyBoard';
import PathSection from './components/PathSection';
import TestimonialsSection from './components/TestimonialsSection';
import AuroraPricing from './components/AuroraPricing';
import NotionSyllabus from './components/NotionSyllabus';
import FounderLetter from './components/FounderLetter';
import CreatorFaq from './components/CreatorFaq';
import FinalCtaFooter from './components/FinalCtaFooter';

// Modals
import VideoModal from './components/VideoModal';
import BookingModal from './components/BookingModal';

export default function App() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('15');

  const handleOpenVideo = (videoIndex = 0) => {
    if (typeof videoIndex === 'number') {
      setSelectedVideoIndex(videoIndex);
    } else {
      setSelectedVideoIndex(0);
    }
    setIsVideoModalOpen(true);
  };

  const handleOpenBooking = (planKey = '15', e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof planKey === 'string') {
      setSelectedPlan(planKey);
    }
    setIsBookingModalOpen(true);
  };

  const handleScrollToPricing = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const pricingEl = document.getElementById('pricing');
    if (pricingEl) {
      pricingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEEEC] text-[#111418] flex flex-col font-sans selection:bg-[#f3c72b] selection:text-[#40108c] relative">
      
      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 1. Hero Section with Floating UI Cards, Cursors & Marker Highlight */}
        <CreatorHero 
          onWatchVideo={() => handleOpenVideo(0)} 
          onEnrollClick={handleScrollToPricing} 
        />

        {/* 2. macOS App Window Mockup: Five Stages. One Done-For-You Production Machine. */}
        <AppMockup onEnrollClick={() => handleOpenBooking('15')} />

        {/* 3. Video Block with Rotating Niche Icon Circles & Industry Focus */}
        <VideoBlock 
          onOpenVideoModal={handleOpenVideo}
          onEnrollClick={() => handleOpenBooking('15')} 
        />

        {/* 4. "Is this you?" Board with Draggable Sticky Notes & Scoped Drawing Canvas */}
        <StickyBoard onEnrollClick={() => handleOpenBooking('15')} />

        {/* 5. The Executive Trajectory: A -> B Interactive Visualizer */}
        <PathSection onEnrollClick={() => handleOpenBooking('15')} />

        {/* 6. Testimonials Section: TakeUforward Style - Trusted by Hundreds of Founders & Leaders */}
        <TestimonialsSection 
          onOpenVideoModal={handleOpenVideo} 
          onOpenAuditModal={() => handleOpenBooking('15')} 
        />

        {/* 7. Pricing: 3 Dedicated Cards (10 Videos / 40K, 15 Videos / 60K, 20 Videos / 80K) */}
        <AuroraPricing 
          selectedPlan={selectedPlan}
          onOpenBooking={handleOpenBooking}
        />

        {/* 8. Notion-Style Monthly Production Hub with Tamil / English Language Toggle */}
        <NotionSyllabus />

        {/* 9. Founder Letter on Stacked Paper Pages with Drop Cap & Polaroids */}
        <FounderLetter />

        {/* 10. Frequently Asked Questions: Sticky Left Pinned Column + Scrollable Right List */}
        <CreatorFaq />

        {/* 11. Final CTA on Dark Background with huge "2027" & Footer */}
        <FinalCtaFooter onEnrollClick={() => handleOpenBooking('15')} />
      </main>

      {/* Floating Brand Gradient Button (#40108c + #f3c72b) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => handleOpenBooking('15')}
          className="btn-brand-gradient text-white px-5 py-3 rounded-full font-headline font-bold text-xs tracking-tight shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 -rotate-2 cursor-pointer border border-[#f3c72b]/60"
        >
          <span className="text-[#f3c72b]">★</span>
          <span>Claim Retainer Slot &rarr;</span>
        </button>
      </div>

      {/* Video Modal with 4 Real Personal Branding Videos */}
      <VideoModal
        key={`${selectedVideoIndex}-${isVideoModalOpen}`}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        initialVideoIndex={selectedVideoIndex}
        onOpenAuditModal={() => handleOpenBooking('15')}
      />

      {/* Neat Popup Onboarding Modal */}
      <BookingModal
        key={`${selectedPlan}-${isBookingModalOpen}`}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialPlan={selectedPlan}
      />
    </div>
  );
}
