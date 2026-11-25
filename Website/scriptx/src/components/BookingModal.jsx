import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  Palette, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingModal({ isOpen, onClose, initialPlan = '15' }) {
  const [activePlan, setActivePlan] = useState(initialPlan || '15');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const planDetails = {
    '10': {
      videos: '10 Videos / month',
      price: '₹40,000',
      priceNum: '40K',
      bgChanges: '1 Studio Background Setup',
      badge: 'Starter Engine'
    },
    '15': {
      videos: '15 Videos / month',
      price: '₹60,000',
      priceNum: '60K',
      bgChanges: '2 Distinct Background Changes',
      badge: '★ Most Popular for Founders'
    },
    '20': {
      videos: '20 Videos / month',
      price: '₹80,000',
      priceNum: '80K',
      bgChanges: '3 Distinct Background Changes',
      badge: 'Market Dominance'
    }
  };

  const currentPlan = planDetails[activePlan] || planDetails['15'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const messageLines = [
      '🚀 *New ScriptX Personal Branding Inquiry*',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `👤 *Name:* ${formData.name}`,
      `🏢 *Company / Brand:* ${formData.company}`,
      `📱 *WhatsApp:* ${formData.phone}`,
      `✉️ *Email:* ${formData.email}`,
      `🎬 *Selected Package:* ${currentPlan.videos} — ${currentPlan.price}/month`,
      `🎨 *Studio Backgrounds:* ${currentPlan.bgChanges}`,
      formData.message ? `💬 *Brand Goal / Notes:* ${formData.message}` : null,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Sent via ScriptX Digital Marketing Website'
    ].filter(Boolean).join('\n');

    const whatsappUrl = `https://wa.me/917604829279?text=${encodeURIComponent(messageLines)}`;

    try {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err) {
      if (err) {}
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      window.open(whatsappUrl, '_blank');
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.18)] text-[#111418] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Radial Glow (#40108c & #f3c72b) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#40108c]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-[#f3c72b]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-[#111418] flex items-center justify-center transition-colors border border-black/5 cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-headline font-black text-2xl sm:text-3xl text-[#111418] mb-2">
              Inquiry Sent to WhatsApp!
            </h3>
            
            <p className="text-neutral-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Thank you, <strong>{formData.name}</strong>. Your onboarding inquiry for <strong>{currentPlan.videos}</strong> is ready and WhatsApp has opened.
            </p>

            <div className="p-4 rounded-2xl bg-[#F9F9F7] border border-black/10 max-w-md mx-auto mb-6 text-left text-xs font-mono text-[#111418] space-y-1">
              <div><span className="text-neutral-500">Name:</span> {formData.name}</div>
              <div><span className="text-neutral-500">Company:</span> {formData.company}</div>
              <div><span className="text-neutral-500">Package:</span> {currentPlan.videos} ({currentPlan.price}/mo)</div>
              <div><span className="text-neutral-500">Backgrounds:</span> {currentPlan.bgChanges}</div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/917604829279?text=${encodeURIComponent(
                  `🚀 *ScriptX Inquiry*\n👤 Name: ${formData.name}\n🏢 Company: ${formData.company}\n🎬 Package: ${currentPlan.videos} (${currentPlan.price}/mo with ${currentPlan.bgChanges})\n📱 Phone: ${formData.phone}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Re-Open WhatsApp</span>
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs transition-colors border border-black/5"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            
            {/* Top Pill & Title */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8FC] border border-[#40108c]/25 text-[#40108c] text-[11px] font-mono font-bold mb-2.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#f3c72b]" />
                <span>SCRIPTX VIP ONBOARDING POPUP</span>
              </div>

              <h3 className="font-headline font-black text-2xl sm:text-3xl text-[#111418] tracking-tight">
                Lock In Your Video Retainer
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Fill in your details below to fast-track directly into our VIP WhatsApp onboarding lane.
              </p>
            </div>

            {/* Selected Package Spotlight Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF8FC] via-white to-[#FDFBF7] border border-[#40108c]/25 mb-4 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#40108c] font-bold block tracking-wider">
                  SELECTED RETAINER
                </span>
                <span className="font-headline font-bold text-base sm:text-lg text-[#111418] block">
                  {currentPlan.videos}
                </span>
                <span className="text-[11px] text-neutral-600 flex items-center gap-1.5 mt-0.5">
                  <Palette className="w-3.5 h-3.5 text-[#40108c]" />
                  {currentPlan.bgChanges}
                </span>
              </div>
              <div className="text-right">
                <span className="font-serif-display text-3xl sm:text-4xl text-[#40108c] italic font-bold">
                  {currentPlan.price}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono block">/ month</span>
              </div>
            </div>

            {/* Volume Switcher Pills */}
            <div className="mb-4">
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block mb-1.5">
                Switch Package:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '10', title: '10 Videos', price: '₹40K', bg: '1 BG' },
                  { id: '15', title: '15 Videos ★', price: '₹60K', bg: '2 BGs' },
                  { id: '20', title: '20 Videos', price: '₹80K', bg: '3 BGs' }
                ].map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setActivePlan(pkg.id)}
                    className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                      activePlan === pkg.id
                        ? 'btn-brand-gradient text-white border-[#f3c72b] shadow-md font-bold'
                        : 'bg-[#F9F9F7] border-black/10 text-neutral-600 hover:text-[#111418] hover:border-black/20 hover:bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs">{pkg.title}</div>
                    <div className={`text-[10px] font-mono ${activePlan === pkg.id ? 'text-[#f3c72b] font-bold' : 'text-[#40108c] font-semibold'}`}>{pkg.price}</div>
                    <div className={`text-[9px] ${activePlan === pkg.id ? 'text-white/80' : 'text-neutral-500'}`}>{pkg.bg}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#111418] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F9F7] border border-black/10 focus:border-[#40108c] focus:bg-white focus:outline-none text-[#111418] text-xs placeholder:text-neutral-400 transition-colors shadow-2xs"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#111418] mb-1">
                    Company / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Tech"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F9F7] border border-black/10 focus:border-[#40108c] focus:bg-white focus:outline-none text-[#111418] text-xs placeholder:text-neutral-400 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#111418] mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F9F7] border border-black/10 focus:border-[#40108c] focus:bg-white focus:outline-none text-[#111418] text-xs placeholder:text-neutral-400 transition-colors shadow-2xs"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#111418] mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F9F7] border border-black/10 focus:border-[#40108c] focus:bg-white focus:outline-none text-[#111418] text-xs placeholder:text-neutral-400 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-semibold text-[#111418] mb-1">
                  Brand Goal or Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Scaling personal brand to generate high-ticket leads..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F9F9F7] border border-black/10 focus:border-[#40108c] focus:bg-white focus:outline-none text-[#111418] text-xs placeholder:text-neutral-400 transition-colors resize-none shadow-2xs"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full btn-brand-gradient text-white font-headline font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer mt-2 border border-[#f3c72b]/60"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-current text-[#f3c72b]" />
                    <span>Submit & Launch WhatsApp Chat &rarr;</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#40108c]" /> Mutual NDA
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#40108c]" /> 2h/Mo Client Time
                </span>
                <span>⚡ Instant Redirect</span>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
