import React, { useState } from 'react';
import './App.css';

// Lane / BrandElevate Components matching the Reference Design
import LaneHero from './components/LaneHero';
import LanePartners from './components/LanePartners';
import LaneAbout from './components/LaneAbout';
import LaneServices from './components/LaneServices';
import LanePricing from './components/LanePricing';
import LaneProcess from './components/LaneProcess';
import LaneVideoShowcase from './components/LaneVideoShowcase';
import LaneBlog from './components/LaneBlog';
import LaneTestimonials from './components/LaneTestimonials';
import LaneFooter from './components/LaneFooter';
import LaneConsultationModal from './components/LaneConsultationModal';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('15 Videos (₹60,000/mo)');

  const handleOpenConsultation = (serviceName = '15 Videos (₹60,000/mo)') => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white w-full flex flex-col font-sans relative selection:bg-[#703BF7] selection:text-white overflow-x-hidden">
      <main className="flex-grow w-full">
        {/* 1. Hero with studio visual, floating glass navbar, request a call button & metrics bar */}
        <LaneHero 
          onRequestCall={() => handleOpenConsultation('Brand Discovery Session')}
          onBookConsultation={() => handleOpenConsultation('VIP Consultation')}
        />

        {/* 2. Partners and Clients Logo Strip */}
        <LanePartners />

        {/* 3. Meet ScriptX Your Personal Branding Partner + Floating Bestselling Author Card */}
        <LaneAbout 
          onRequestCall={() => handleOpenConsultation('Executive Coaching')}
        />

        {/* 4. Personal Branding Services Tailored for You (4 Cards with Active Purple Card) */}
        <LaneServices 
          onBookCall={() => handleOpenConsultation('Brand Coaching Program')}
        />

        {/* 5. 3-Tier Scalable Video Retainer Pricing (10, 15, 20 Videos with WhatsApp Direct) */}
        <LanePricing 
          onSelectPlan={(plan) => handleOpenConsultation(plan)}
        />

        {/* 6. My Coaching Process, Simplified (Interactive Accordion & Studio Scene) */}
        <LaneProcess 
          onLearnMore={() => handleScrollTo('pricing')}
        />

        {/* 7. Large Video Showcase ("Watch my all activities") */}
        <LaneVideoShowcase />

        {/* 8. Insights & Strategies for Building Your Personal Brand (3 Articles) */}
        <LaneBlog 
          onSeeAll={() => handleOpenConsultation('Content Strategy')}
        />

        {/* 9. What My Clients Are Saying (3 Testimonial Cards & Carousel Controls) */}
        <LaneTestimonials />
      </main>

      {/* 10. Signature Footer with Nav, Email Pill, Huge SCRIPTX Display Typography & Socials */}
      <LaneFooter 
        onContactClick={() => handleOpenConsultation('General Inquiry')}
      />

      {/* 11. WhatsApp-Connected Consultation Modal (+91 7604829279) */}
      <LaneConsultationModal 
        key={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultService={selectedService}
      />
    </div>
  );
}
