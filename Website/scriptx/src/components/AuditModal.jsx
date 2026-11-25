import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuditModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    stage: 'Founders / Executive',
    goal: 'Scale Personal Brand Authority'
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      try {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.5 }
        });
      } catch (err) {
        if (err) { /* silent fallback */ }
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#0c101d] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-white mb-2">
              Audit Scheduled!
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Thanks <strong>{formData.name}</strong>. Our senior brand strategist will inspect your digital footprint and email your personalized audit link within 4 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Back to Site
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider font-semibold">
                Complimentary 30-Min Strategy
              </span>
            </div>

            <h3 className="font-display font-extrabold text-2xl text-white mb-2">
              Claim Your Authority & Growth Audit
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              We will analyze your current personal brand, search presence, and conversion funnels to identify where you are leaking revenue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080b14] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@brand.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080b14] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 70103 64226"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080b14] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Stealth AI / FinTech Co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080b14] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Primary Focus Area
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080b14] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Scale Personal Brand Authority">Scale Personal Brand Authority (LinkedIn/X)</option>
                  <option value="Google & Meta Performance Ads">Google & Meta Performance Ads</option>
                  <option value="SEO & Search Dominance">SEO & Search Dominance</option>
                  <option value="Full Omnichannel Growth Engine">Full Omnichannel Growth Engine</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Confirm My Audit Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                <span>✓ 100% Confidential</span>
                <span>✓ No Sales Pressure</span>
                <span>✓ 30-Min Action Plan</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
