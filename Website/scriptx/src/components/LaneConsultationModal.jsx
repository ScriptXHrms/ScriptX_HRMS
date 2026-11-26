import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2, Sparkles, ShieldCheck, Clock, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LaneConsultationModal({ isOpen, onClose, defaultService = '15 Videos (₹60,000/mo)' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    service: defaultService,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const packages = [
    { id: '10 Videos (₹40,000/mo)', label: '10 Videos (₹40K/mo)', note: '1 Studio BG' },
    { id: '15 Videos (₹60,000/mo)', label: '15 Videos (₹60K/mo) ★', note: '2 Studio BGs' },
    { id: '20 Videos (₹80,000/mo)', label: '20 Videos (₹80K/mo)', note: '3 Studio BGs' },
    // { id: 'Brand Discovery Session', label: 'Discovery Session', note: '1:1 Strategy' },
    // { id: 'Brand Coaching Program', label: 'Coaching Program', note: 'Comprehensive' },
    // { id: 'LinkedIn & Social Makeover', label: 'Profile Makeover', note: 'Executive Bio' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const messageLines = [
      '🚀 *New ScriptX Consultation & Video Retainer Inquiry*',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `👤 *Full Name:* ${formData.name}`,
      `🏢 *Company / Brand:* ${formData.company || 'Individual / Personal Brand'}`,
      `📱 *WhatsApp Number:* ${formData.phone}`,
      `✉️ *Email Address:* ${formData.email}`,
      `🎯 *Selected Package / Service:* ${formData.service}`,
      formData.message ? `💬 *Goal / Notes:* ${formData.message}` : null,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Sent via ScriptX Official Website (+91 7604829279)'
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/917604829279?text=${encodeURIComponent(messageLines)}`;

    try {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {
      // Ignore confetti error
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      window.open(whatsappUrl, '_blank');
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white border border-neutral-100 p-6 sm:p-8 shadow-2xl text-neutral-900 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Gradient Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#703BF7] via-[#9B70FF] to-[#f3c72b]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#703BF7]/10 text-[#703BF7] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-bold text-2xl text-neutral-950 mb-2 font-sans">
              Inquiry Sent to WhatsApp!
            </h3>

            <p className="text-neutral-600 text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Thank you, <strong>{formData.name}</strong>. Your inquiry for <strong>{formData.service}</strong> has been routed to our Creative Director at <strong>+91 7604829279</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/917604829279?text=${encodeURIComponent(
                  `🚀 *ScriptX Inquiry*\n👤 Name: ${formData.name}\n📱 WhatsApp: ${formData.phone}\n🎯 Selected: ${formData.service}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#703BF7] hover:bg-[#5E2EE0] text-white font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Re-Open WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#703BF7]/10 text-[#703BF7] text-[11px] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Selected: {formData.service}</span>
              </div>

              <h3 className="font-bold text-2xl sm:text-3xl text-neutral-950 font-sans tracking-tight">
                Connect Directly on WhatsApp
              </h3>

              <p className="text-neutral-500 text-xs sm:text-sm mt-1 leading-relaxed">
                Fill in your details below. Your request routes straight into a direct WhatsApp conversation with our Creative Director.
              </p>
            </div>

            {/* Quick Package Selector Pills */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Choose or Switch Package:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {packages.map((pkg) => {
                  const isSelected = formData.service === pkg.id;
                  return (
                    <button
                      type="button"
                      key={pkg.id}
                      onClick={() => setFormData({ ...formData, service: pkg.id })}
                      className={`text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                        isSelected
                          ? 'border-[#703BF7] bg-[#703BF7]/10 text-[#703BF7] font-bold shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{pkg.label}</span>
                        {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-normal mt-0.5">
                        {pkg.note}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#703BF7] focus:bg-white focus:outline-none text-xs sm:text-sm text-neutral-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Tech"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#703BF7] focus:bg-white focus:outline-none text-xs sm:text-sm text-neutral-900 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#703BF7] focus:bg-white focus:outline-none text-xs sm:text-sm text-neutral-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#703BF7] focus:bg-white focus:outline-none text-xs sm:text-sm text-neutral-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  What is your primary goal or industry focus? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Scale CEO presence on LinkedIn, produce 15 high-retention reels per month..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#703BF7] focus:bg-white focus:outline-none text-xs sm:text-sm text-neutral-900 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full btn-lane-primary font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-[#703BF7]/30 transition-all hover:brightness-105 active:scale-[0.99] mt-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{isSubmitting ? 'Preparing WhatsApp...' : 'Submit & Open WhatsApp →'}</span>
              </button>

              {/* Trust Badges */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-neutral-400 font-medium text-center">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                  100% Confidential
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  Direct to +91 7604829279
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
