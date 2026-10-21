import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#140108] text-white pt-14 pb-10 border-t border-[#480521]/60">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Top Newsletter Bar */}
        <div className="pb-10 border-b border-[#480521]/40 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#970747]" />
              <span>Get weekly masterclass schedules and free seat alerts</span>
            </h3>
            <p className="text-sm text-rose-200/80 mt-1">
              No spam. Direct calendar invitations and early-bird discounts from accredited instructors.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex max-w-md w-full gap-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-[#280212] border border-[#580628] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-rose-300/60 focus:outline-none focus:border-[#970747]"
            />
            <button
              type="submit"
              className="btn-primary text-sm py-2 px-5 whitespace-nowrap shadow-md shadow-rose-950/20"
            >
              Subscribe
            </button>
          </form>
        </div>

        {subscribed && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded flex items-center gap-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thank you for subscribing! You will receive our weekly curated webinar briefing.</span>
          </div>
        )}

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-4">
              Explore Topics
            </h4>
            <ul className="space-y-2.5 text-sm text-rose-200/70">
              <li><Link to="/webinars?category=Artificial+Intelligence" className="hover:text-white transition-colors">Artificial Intelligence</Link></li>
              <li><Link to="/webinars?category=Web+Development" className="hover:text-white transition-colors">Web Development</Link></li>
              <li><Link to="/webinars?category=Cloud+%26+DevOps" className="hover:text-white transition-colors">Cloud & DevOps</Link></li>
              <li><Link to="/webinars?category=Business+%26+Marketing" className="hover:text-white transition-colors">Business & Marketing</Link></li>
              <li><Link to="/webinars" className="hover:text-white transition-colors">All Live Workshops</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-4">
              Community & Instructors
            </h4>
            <ul className="space-y-2.5 text-sm text-rose-200/70">
              <li><Link to="/speakers" className="hover:text-white transition-colors">Expert Instructors</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Kaira Hub</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Host a Webinar</Link></li>
              <li><Link to="/my-events" className="hover:text-white transition-colors">Access My Ticket</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Management</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-4">
              Support & Help
            </h4>
            <ul className="space-y-2.5 text-sm text-rose-200/70">
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><a href="mailto:support@kairawebinarhub.com" className="hover:text-white transition-colors">Email Helpdesk</a></li>
              <li><span className="text-rose-400/80 text-xs">Mon-Sat: 9:00 AM - 7:00 PM IST</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-4">
              Policies & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-rose-200/70">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund & Cancellation</Link></li>
              <li><span className="text-xs text-rose-300 flex items-center gap-1.5 mt-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Razorpay Secured 256-Bit</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#480521]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rose-300/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#970747] flex items-center justify-center text-white">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="text-white font-bold">Kaira Webinar Hub</span>
            <span>&copy; {new Date().getFullYear()} Kaira Hub, Inc. All rights reserved.</span>
          </div>
          <div>
            <span>Official digital learning marketplace & expert workshop platform.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
