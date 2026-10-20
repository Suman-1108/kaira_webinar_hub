import React, { useState } from 'react';
import { 
  Send, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Globe
} from 'lucide-react';

export default function Footer({ onNavClick, onOpenAdmin }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
  };

  return (
    <footer className="bg-[#970747] text-white pt-16 pb-12 border-t border-[#80053b] relative overflow-hidden">
      {/* Subtle decorative circles */}
      <div 
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: '#FFFFFF' }}
      />
      <div 
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: '#D63384' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-white/15">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#970747] font-heading font-black text-2xl shadow-md">
                K
              </div>
              <span className="font-heading font-black text-2xl text-white tracking-tight">
                KAIRA WEBINAR HUB
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F7DCE8] leading-relaxed max-w-sm">
              Connecting ambitious software engineers, tech leads, and founders with world-class practitioners through live, interactive masterclasses.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24M5.07 18.5h2.78v-8.37H5.07v8.37Z"/></svg>
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="m10 15 5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73Z"/></svg>
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-[#F3A6C4]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#F7DCE8]">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('webinars')} className="hover:text-white transition-colors">
                  Upcoming Webinars
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('how-it-works')} className="hover:text-white transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('about')} className="hover:text-white transition-colors">
                  About Kaira
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-[#F3A6C4]">
              Policies & Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#F7DCE8]">
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Kaira Privacy Policy: Your data and WhatsApp credentials are encrypted and never sold.'); }} className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Kaira Terms & Conditions: Passes grant personal access to live broadcast & verified materials.'); }} className="hover:text-white transition-colors">
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a href="#refund" onClick={(e) => { e.preventDefault(); alert('Kaira Refund Policy: 100% full money-back guarantee up to 2 hours before broadcast.'); }} className="hover:text-white transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#gst" onClick={(e) => { e.preventDefault(); alert('Tax Invoices: Automated digital GST tax receipts are generated for every ticket.'); }} className="hover:text-white transition-colors">
                  Tax Invoicing
                </a>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="text-[#F3A6C4] hover:text-white transition-colors">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-[#F3A6C4]">
              Stay Ahead of Tech Trends
            </h4>
            <p className="text-xs text-[#F7DCE8] leading-relaxed">
              Get notified first when new frontier masterclasses are announced. No spam, only high-signal tech updates.
            </p>

            {subscribed ? (
              <div className="p-3.5 rounded-2xl bg-white/10 text-white text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You're subscribed! Welcome to the Kaira community.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex rounded-full bg-white/10 p-1 border border-white/20 focus-within:border-white">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-transparent text-xs text-white placeholder-white/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-white text-[#970747] font-bold text-xs hover:bg-[#FDF5F8] transition-colors shrink-0 flex items-center gap-1"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7DCE8]">
          <p>© {new Date().getFullYear()} Kaira Webinar Hub. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Burgundy & Rose Pink Theme • Secure Razorpay Verification</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
