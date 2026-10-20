import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  MessageSquare
} from 'lucide-react';

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Webinar Enquiry',
    message: ''
  });
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) return;

    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  };

  const faqs = [
    {
      q: "Are the webinar completion certificates recognized?",
      a: "Yes. Every Kaira Webinar Hub completion certificate includes a verifiable credential ID and cryptographic hash that can be directly attached to your LinkedIn profile or resume."
    },
    {
      q: "What if I miss the live webinar broadcast?",
      a: "All registered attendees with VIP or Team passes receive lifetime on-demand access to the 4K recording, complete chapter timestamps, speaker slide decks, and code repositories within 4 hours of broadcast."
    },
    {
      q: "Can I obtain a tax invoice for my organization or company?",
      a: "Absolutely. Once your registration is confirmed, your automated GST-compliant digital tax invoice is generated with a dedicated invoice number and can be downloaded immediately."
    },
    {
      q: "What is your cancellation and refund policy?",
      a: "If you are unable to attend or unsatisfied with the masterclass, you can request a full 100% refund up to 2 hours prior to the session start time via our support desk."
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7DCE8] border border-[#F3A6C4]">
            <Sparkles className="w-4 h-4 text-[#970747]" />
            <span className="text-xs font-bold text-[#970747] tracking-wider uppercase font-mono">
              WE ARE HERE TO HELP
            </span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#25171E] tracking-tight">
            Have Questions? Let's Connect.
          </h2>

          <p className="text-base sm:text-lg text-[#66545D] leading-relaxed">
            Reach out for corporate enterprise workshops, group pass billing, or instructor collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form & Direct Contact info */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="card-kaira p-8 bg-[#FDF5F8] border border-[#EBDDE4]">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-[#25171E]">
                    Message Received!
                  </h3>
                  <p className="text-sm text-[#66545D] max-w-md mx-auto">
                    Thank you for reaching out. A Kaira academic coordinator will review your request and get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ fullName: '', email: '', phone: '', subject: 'General Webinar Enquiry', message: '' });
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#970747] text-white text-xs font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-heading font-black text-2xl text-[#25171E] mb-2">
                    Send Us an Enquiry
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#25171E] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EBDDE4] text-sm focus:outline-none focus:border-[#970747]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#25171E] mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EBDDE4] text-sm focus:outline-none focus:border-[#970747]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#25171E] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EBDDE4] text-sm focus:outline-none focus:border-[#970747]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#25171E] mb-1">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EBDDE4] text-sm focus:outline-none focus:border-[#970747]"
                      >
                        <option>General Webinar Enquiry</option>
                        <option>Corporate Team Pass Bulk Booking</option>
                        <option>Speaker / Instructor Proposal</option>
                        <option>Technical Streaming Support</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#25171E] mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we assist you?"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EBDDE4] text-sm focus:outline-none focus:border-[#970747]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Enquiry</span>
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#EBDDE4] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7DCE8] text-[#970747] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#66545D]">Email Support</p>
                  <p className="text-xs font-bold text-[#25171E]">support@kairahub.live</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EBDDE4] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7DCE8] text-[#970747] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#66545D]">WhatsApp Desk</p>
                  <p className="text-xs font-bold text-[#25171E]">+91 91500 89210</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EBDDE4] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7DCE8] text-[#970747] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#66545D]">Headquarters</p>
                  <p className="text-xs font-bold text-[#25171E]">Chennai, India</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="space-y-1 mb-4">
              <h3 className="font-heading font-black text-2xl text-[#25171E]">
                Frequently Asked Questions
              </h3>
              <p className="text-xs text-[#66545D]">
                Quick answers to common questions about passes and attendance.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="card-kaira bg-white border border-[#EBDDE4] overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 font-heading font-bold text-sm text-[#25171E] hover:text-[#970747] transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#970747] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#66545D] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-[#66545D] leading-relaxed border-t border-[#FDF5F8]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
