import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  RefreshCcw,
  GraduationCap
} from 'lucide-react';

export function AboutPage() {
  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#970747]">About Kaira</span>
          <h1 className="text-3xl font-extrabold font-heading text-[#1C1D1F] tracking-tight mt-1">
            Empowering technical careers through expert-led webinars
          </h1>
          <p className="text-sm text-[#52525B] mt-3 leading-relaxed">
            Kaira Webinar Hub was built to bridge the gap between academic theory and the fast-moving frontier of software engineering, artificial intelligence, and cloud architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 border border-[#D1D1D7] rounded-lg bg-[#F7F9FA]">
            <h3 className="font-bold text-[#1C1D1F] mb-1">Practical Depth</h3>
            <p className="text-xs text-[#52525B]">Live code demonstrations, teardowns of production bugs, and open-source starter repositories.</p>
          </div>
          <div className="p-6 border border-[#D1D1D7] rounded-lg bg-[#F7F9FA]">
            <h3 className="font-bold text-[#1C1D1F] mb-1">Verified Speakers</h3>
            <p className="text-xs text-[#52525B]">Every speaker is vetted for real engineering leadership and architectural credentials.</p>
          </div>
          <div className="p-6 border border-[#D1D1D7] rounded-lg bg-[#F7F9FA]">
            <h3 className="font-bold text-[#1C1D1F] mb-1">Accredited Certificates</h3>
            <p className="text-xs text-[#52525B]">Cryptographically verifiable certificates of completion for LinkedIn and corporate portfolios.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#D1D1D7] text-sm text-[#52525B] space-y-4 leading-relaxed">
          <h2 className="text-xl font-bold font-heading text-[#1C1D1F]">Our Educational Mission</h2>
          <p>
            Traditional courses often fall months behind technological advancements. Our interactive webinars give engineers direct access to innovators at the moment tools and paradigms change—from Agentic AI swarms to React 19 server actions.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQPage() {
  const faqs = [
    {
      q: "How do I access the live stream once I register?",
      a: "Upon successful registration (free or paid), you will immediately receive an email confirmation containing your personalized 1-click meeting access link, unique pass ID, and PDF tax invoice. You can also view it anytime inside 'My Learning'."
    },
    {
      q: "Are session recordings and code repositories provided?",
      a: "Yes! All registered participants receive full lifetime access to the recorded stream, instructor slides, and the official GitHub repository within 24 hours of session completion."
    },
    {
      q: "What payment methods are supported?",
      a: "We integrate PhonePe PG v2 Standard Checkout supporting UPI (Google Pay, PhonePe, Paytm, BHIM), QR code scan, credit/debit cards, and net banking."
    },
    {
      q: "What is your refund policy?",
      a: "If you are unsatisfied with a paid masterclass or encounter technical delivery issues, we offer a hassle-free 30-day refund policy."
    },
    {
      q: "Can my employer sponsor my attendance?",
      a: "Yes. Our checkout generates tax-compliant PDF receipts and invoice numbers suitable for corporate learning expense reimbursement."
    }
  ];

  return (
    <div className="bg-[#F7F9FA] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#970747]">Frequently Asked Questions</span>
          <h1 className="text-3xl font-extrabold font-heading text-[#1C1D1F] mt-1">
            Questions & Answers
          </h1>
          <p className="text-xs text-[#52525B] mt-2">Everything you need to know about registrations, access passes, and certificates.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white border border-[#D1D1D7] rounded-lg p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#1C1D1F] flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-[#970747] shrink-0" />
                <span>{f.q}</span>
              </h3>
              <p className="text-xs text-[#52525B] leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', subject: 'Webinar Query', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-[#F7F9FA] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#970747]">Support & Partnerships</span>
          <h1 className="text-3xl font-extrabold font-heading text-[#1C1D1F] mt-1">Get in Touch</h1>
          <p className="text-xs text-[#52525B] mt-2">Speak with our academic team, host a webinar, or request enterprise group passes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-[#D1D1D7] rounded-xl p-6 sm:p-10 shadow-xs">
          <div className="md:col-span-5 space-y-6">
            <h3 className="text-base font-bold text-[#1C1D1F]">Contact Details</h3>
            <div className="space-y-4 text-xs text-[#52525B]">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#970747]" />
                <span>support@kairawebinarhub.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#970747]" />
                <span>+91 98412 34567 (Mon-Sat 9AM-7PM)</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#970747]" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>

            <div className="p-4 bg-[#F7F9FA] border border-[#D1D1D7] rounded-lg text-xs text-[#52525B]">
              <span className="font-bold text-[#1C1D1F] block mb-1">Corporate & Bulk Inquiries:</span>
              Looking to register your entire engineering team? Reach out for team discounts and invoice PO processing.
            </div>
          </div>

          <div className="md:col-span-7">
            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm">Message Sent Successfully</h4>
                <p className="text-xs mt-1 text-emerald-700">Our academic team will respond within 4 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                  ></textarea>
                </div>
                <button type="submit" className="w-full btn-primary py-2.5 text-xs font-bold shadow-sm">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-sm text-[#52525B] leading-relaxed">
        <h1 className="text-3xl font-extrabold font-heading text-[#1C1D1F]">Terms of Service</h1>
        <p>Last updated: October 2026</p>
        <p>
          By accessing or registering for webinars through Kaira Webinar Hub, you agree to abide by these terms. All session recordings, curriculum documents, and code repositories are proprietary educational assets.
        </p>
        <h3 className="text-lg font-bold text-[#1C1D1F] pt-4">1. Virtual Entry Passes & Attendance</h3>
        <p>Entry passes are uniquely generated per participant. Pass sharing or unauthorized re-broadcasting of live webinar streams without explicit consent is strictly prohibited.</p>
        <h3 className="text-lg font-bold text-[#1C1D1F] pt-4">2. Payments & Intellectual Property</h3>
        <p>All payments are securely processed through authorized payment gateways. You are granted a personal, non-transferable license to access session recordings and completion certificates.</p>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-sm text-[#52525B] leading-relaxed">
        <h1 className="text-3xl font-extrabold font-heading text-[#1C1D1F]">Privacy Policy</h1>
        <p>Last updated: October 2026</p>
        <p>
          At Kaira Webinar Hub, we prioritize participant data security. We do not sell or rent personal information to third parties.
        </p>
        <h3 className="text-lg font-bold text-[#1C1D1F] pt-4">1. Data We Collect</h3>
        <p>We collect your name, email address, phone number (for session alerts and ticket verification), and payment transaction metadata necessary for invoice generation.</p>
        <h3 className="text-lg font-bold text-[#1C1D1F] pt-4">2. Communication Preferences</h3>
        <p>Participants retain full control over notification preferences and may opt out of promotional messages at any time while retaining transactional event reminders.</p>
      </div>
    </div>
  );
}

export function RefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-sm text-[#52525B] leading-relaxed">
        <h1 className="text-3xl font-extrabold font-heading text-[#1C1D1F]">Refund & Cancellation Policy</h1>
        <p>Last updated: October 2026</p>
        <p>
          We stand firmly behind the quality of our masterclasses. If a scheduled event is rescheduled or cancelled by the organizer, or if you encounter technical disruptions, you are entitled to a full 100% refund.
        </p>
        <h3 className="text-lg font-bold text-[#1C1D1F] pt-4">1. 30-Day Money-Back Guarantee</h3>
        <p>If you attend a paid masterclass and find it does not meet the published curriculum outcomes, contact billing@kairawebinarhub.com within 30 days for a swift refund.</p>
      </div>
    </div>
  );
}
