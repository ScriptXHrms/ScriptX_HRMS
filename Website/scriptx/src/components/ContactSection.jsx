import React, { useState } from 'react';
import { 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Clock,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContactSection({ selectedPlan = '15', onSelectPlan }) {
  const [activePlan, setActivePlan] = useState(selectedPlan || '15');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const planDetails = {
    '10': {
      videos: '10 Videos / month',
      price: '₹40,000',
      priceNum: '40K',
      bgChanges: '1 Studio Background Setup',
      badge: 'Starter Brand Engine'
    },
    '15': {
      videos: '15 Videos / month',
      price: '₹60,000',
      priceNum: '60K',
      bgChanges: '2 Distinct Background Changes',
      badge: '★ Most Popular for CEOs & Leaders'
    },
    '20': {
      videos: '20 Videos / month',
      price: '₹80,000',
      priceNum: '80K',
      bgChanges: '3 Distinct Background Changes',
      badge: 'Enterprise Market Dominance'
    }
  };

  const currentPlan = planDetails[activePlan] || planDetails['15'];

  const handlePlanChange = (key) => {
    setActivePlan(key);
    if (onSelectPlan) onSelectPlan(key);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Format clean professional WhatsApp text
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
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      if (err) {}
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      // Automatically open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
    }, 600);
  };

  return (
    <section id="contact" className="py-24 md:py-36 bg-[#07070C] text-white relative overflow-hidden border-t border-white/10">
      
      {/* Background Soft Atmospheric Ambient Lights */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[650px] h-[450px] bg-[#6C1E99]/15 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[400px] bg-[#EC1163]/12 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FFD93D] text-xs font-semibold mb-4 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#EC1163]" />
            <span>DIRECT EXECUTIVE ONBOARDING • SCRIPTX VIP LANE</span>
          </div>

          <h2 className="font-headline text-4xl sm:text-6xl text-white tracking-tight leading-[1.08] mb-4">
            Start Your Personal Brand Sprint. <br />
            <span className="font-serif-display italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FCE7F3] to-[#E879F9]">
              Fast-tracked directly on WhatsApp.
            </span>
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Fill in your company details below. Your request will automatically route straight into a direct WhatsApp conversation with our Creative Director.
          </p>
        </div>

        {/* Master 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Plan Summary & Guarantees (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Selected Package Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0D0E16] border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#EC1163]/15 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[11px] font-mono uppercase text-[#EC1163] tracking-wider font-bold block mb-2">
                YOUR SELECTED PACKAGE
              </span>

              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-headline font-black text-2xl sm:text-3xl text-white">
                  {currentPlan.videos}
                </h3>
                <span className="font-serif-display text-3xl text-[#FFD93D] italic font-bold">
                  {currentPlan.price}
                  <span className="text-xs text-neutral-400 font-mono not-italic ml-1 font-normal">/mo</span>
                </span>
              </div>

              {/* Background badge */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl btn-brand-gradient flex items-center justify-center flex-shrink-0">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">Studio Setup</span>
                  <span className="text-xs font-bold text-white">{currentPlan.bgChanges}</span>
                </div>
              </div>

              {/* Quick Plan Switcher */}
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block mb-2">
                  Switch Volume:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '10', label: '10 Videos', price: '40K' },
                    { id: '15', label: '15 Videos ★', price: '60K' },
                    { id: '20', label: '20 Videos', price: '80K' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePlanChange(p.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        activePlan === p.id
                          ? 'btn-brand-gradient text-white border-transparent shadow-md'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div>{p.label}</div>
                      <div className="text-[10px] opacity-80 font-mono">₹{p.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deliverable Highlights */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>100% Done-For-You Narrative & Scriptwriting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Live Directed Filming in 1 to 3 Studio Sets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>4K Cinematic Editing, Sound FX & Motion Captions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>LinkedIn + Instagram + YouTube Multi-Channel Posting</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Assurance Badge */}
            <div className="rounded-2xl p-5 bg-[#0D0E16] border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Direct Creative Director Lane</h4>
                  <p className="text-[11px] text-neutral-400">Average response within 15 minutes on WhatsApp</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                ● Live Now
              </span>
            </div>

            {/* Agency Trust Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs text-neutral-400">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#EC1163] flex-shrink-0" />
                <span>Mutual NDA Guaranteed</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFD93D] flex-shrink-0" />
                <span>Only 2h / Month Time</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Conversion Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl p-6 sm:p-10 bg-[#0E0F18] border border-white/10 shadow-2xl relative backdrop-blur-xl">
              
              {submitted ? (
                <div className="py-12 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-headline font-black text-2xl sm:text-3xl text-white mb-2">
                    Inquiry Ready & Redirecting!
                  </h3>
                  <p className="text-neutral-300 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Your onboarding details for <strong>{currentPlan.videos}</strong> have been assembled and WhatsApp has opened.
                  </p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto mb-8 text-left text-xs font-mono text-neutral-300 space-y-1">
                    <div><span className="text-neutral-500">Name:</span> {formData.name}</div>
                    <div><span className="text-neutral-500">Company:</span> {formData.company}</div>
                    <div><span className="text-neutral-500">Package:</span> {currentPlan.videos} ({currentPlan.price}/mo)</div>
                    <div><span className="text-neutral-500">Backgrounds:</span> {currentPlan.bgChanges}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/917604829279?text=${encodeURIComponent(
                        `🚀 *New ScriptX Inquiry*\n👤 Name: ${formData.name}\n🏢 Company: ${formData.company}\n🎬 Package: ${currentPlan.videos} (${currentPlan.price}/mo with ${currentPlan.bgChanges})\n📱 Phone: ${formData.phone}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Re-Open WhatsApp Chat &rarr;</span>
                    </a>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors"
                    >
                      Edit Submission
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-white/10 pb-4 mb-2">
                    <h3 className="font-headline font-bold text-xl sm:text-2xl text-white">
                      Fill Details & Send Directly to WhatsApp
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Our team will instantly receive your submission and reply with your custom content blueprint.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Logeshwaran / Alex Rivera"
                        className="w-full px-4 py-3 rounded-xl bg-[#07080E] border border-white/10 focus:border-[#EC1163] focus:outline-none text-white text-xs placeholder:text-neutral-600 transition-colors"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Company or Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Acme Tech / Dr. Clinic"
                        className="w-full px-4 py-3 rounded-xl bg-[#07080E] border border-white/10 focus:border-[#EC1163] focus:outline-none text-white text-xs placeholder:text-neutral-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone / WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 70103 64226"
                        className="w-full px-4 py-3 rounded-xl bg-[#07080E] border border-white/10 focus:border-[#EC1163] focus:outline-none text-white text-xs placeholder:text-neutral-600 transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Work Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#07080E] border border-white/10 focus:border-[#EC1163] focus:outline-none text-white text-xs placeholder:text-neutral-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Selected Package Selector in Form */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Selected Video Package
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: '10', title: '10 Videos', price: '₹40K/mo', bg: '1 BG' },
                        { id: '15', title: '15 Videos ★', price: '₹60K/mo', bg: '2 BGs' },
                        { id: '20', title: '20 Videos', price: '₹80K/mo', bg: '3 BGs' }
                      ].map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => handlePlanChange(pkg.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            activePlan === pkg.id
                              ? 'bg-gradient-to-r from-[#EC1163]/25 to-[#6C1E99]/25 border-[#EC1163] text-white shadow-md'
                              : 'bg-[#07080E] border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span className="font-bold text-xs block text-white">{pkg.title}</span>
                          <span className="text-[10px] text-[#FFD93D] font-mono block">{pkg.price}</span>
                          <span className="text-[9px] text-neutral-400 block">{pkg.bg}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Goal / Message */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      What is your #1 Goal or Industry Focus? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="e.g. Generate high-ticket inbound clients, build CEO authority on LinkedIn, scale YouTube presence..."
                      className="w-full px-4 py-3 rounded-xl bg-[#07080E] border border-white/10 focus:border-[#EC1163] focus:outline-none text-white text-xs placeholder:text-neutral-600 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full btn-brand-gradient text-white font-headline font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>Submit & Send To WhatsApp &rarr;</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-500 text-center pt-1 font-mono">
                    🔒 100% Confidential • Instant Direct Redirect to Official ScriptX WhatsApp
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
