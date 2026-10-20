import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Lock,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegistrationModal({ 
  webinar, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  if (!isOpen || !webinar) return null;

  const [ticketType, setTicketType] = useState(
    webinar.price === 0 ? 'Free Pass' : 'VIP Masterclass Pass'
  );
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    whatsappOptIn: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | pending | failed | verified

  // Pricing calculations
  const getTicketPrice = (type) => {
    if (type === 'Free Pass') return 0;
    if (type === 'VIP Masterclass Pass') return webinar.price || 499;
    if (type === 'Corporate Team Pass') return (webinar.price ? webinar.price * 3 : 1499);
    return 0;
  };

  const amount = getTicketPrice(ticketType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (formData.phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus('pending');

    try {
      // Step 1: Initiate registration with backend
      const res = await fetch('/api/registration/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webinarId: webinar.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          countryCode: formData.countryCode,
          ticketType,
          whatsappOptIn: formData.whatsappOptIn
        })
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Registration initiation failed.');
      }

      const { registrationId, isFree, razorpayOrderId, razorpayKeyId } = json.data;

      // If free ticket, backend already completed it!
      if (isFree || amount === 0) {
        triggerSuccessCelebration();
        setPaymentStatus('verified');
        onSuccess && onSuccess(registrationId);
        return;
      }

      // Step 2: Handle Paid Razorpay Checkout
      if (window.Razorpay) {
        const options = {
          key: razorpayKeyId || 'rzp_test_kairaWebinarDemo',
          amount: amount * 100,
          currency: 'INR',
          name: 'Kaira Webinar Hub',
          description: `${ticketType} - ${webinar.title}`,
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
          order_id: razorpayOrderId,
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#970747'
          },
          handler: async function (response) {
            // Step 3: CRITICAL - Verify signature on BACKEND before confirming
            await verifyWithBackend(
              registrationId, 
              response.razorpay_payment_id, 
              response.razorpay_order_id, 
              response.razorpay_signature
            );
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setPaymentStatus('failed');
              setErrorMessage('Payment was dismissed. You can retry anytime.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setIsSubmitting(false);
          setPaymentStatus('failed');
          setErrorMessage(`Payment failed: ${response.error?.description || 'Declined by bank'}`);
        });
        rzp.open();
      } else {
        // Fallback simulated payment in test environment
        const mockPaymentId = `pay_sim_${Date.now()}`;
        await verifyWithBackend(registrationId, mockPaymentId, razorpayOrderId, 'simulated_valid_signature');
      }

    } catch (err) {
      console.error('Registration submit error:', err);
      setIsSubmitting(false);
      setPaymentStatus('failed');
      setErrorMessage(err.message || 'An error occurred during registration.');
    }
  };

  // Cryptographic & database backend verification
  const verifyWithBackend = async (regId, payId, orderId, signature) => {
    try {
      const verifyRes = await fetch('/api/registration/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: regId,
          razorpayPaymentId: payId,
          razorpayOrderId: orderId,
          razorpaySignature: signature
        })
      });

      const verifyJson = await verifyRes.json();

      if (!verifyJson.success) {
        throw new Error(verifyJson.message || 'Backend payment verification rejected.');
      }

      // Success confirmed by backend!
      setIsSubmitting(false);
      setPaymentStatus('verified');
      triggerSuccessCelebration();
      onSuccess && onSuccess(regId);
    } catch (err) {
      setIsSubmitting(false);
      setPaymentStatus('failed');
      setErrorMessage(err.message || 'Payment verification could not be validated by server.');
    }
  };

  const triggerSuccessCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#970747', '#D63384', '#F3A6C4', '#F7DCE8']
      });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EBDDE4] overflow-hidden my-8">
        
        {/* Top Burgundy Banner */}
        <div className="bg-[#970747] p-6 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#D63384] text-white">
                RESERVE PASS
              </span>
              <span className="text-xs text-[#F3A6C4]">{webinar.category}</span>
            </div>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white line-clamp-1">
              {webinar.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Schedule summary */}
          <div className="p-4 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] flex flex-wrap items-center justify-between gap-3 text-xs text-[#25171E]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#970747]" />
              <span className="font-semibold">{webinar.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#970747]" />
              <span className="font-semibold">{webinar.time}</span>
            </div>
            <div className="flex items-center gap-2 text-[#970747] font-bold">
              <span>Instructor: {webinar.speaker.name}</span>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#970747]">
              Select Ticket Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'Free Pass', name: 'Free Pass', price: '₹0', perks: 'Live streaming access & Q&A' },
                { type: 'VIP Masterclass Pass', name: 'VIP Pass', price: `₹${webinar.price || 499}`, perks: 'Full repo + 4K recordings + Certificate' },
                { type: 'Corporate Team Pass', name: 'Team Pass', price: `₹${webinar.price ? webinar.price * 3 : 1499}`, perks: '5 team passes + invoices + 1:1 doubt session' }
              ].map((t) => {
                const isSelected = ticketType === t.type;
                return (
                  <div
                    key={t.type}
                    onClick={() => setTicketType(t.type)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#970747] bg-[#FDF5F8] shadow-xs ring-1 ring-[#970747]'
                        : 'border-[#EBDDE4] hover:border-[#F3A6C4] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#25171E]">{t.name}</span>
                      <span className="text-sm font-extrabold text-[#970747]">{t.price}</span>
                    </div>
                    <p className="text-[11px] text-[#66545D] leading-tight">{t.perks}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#25171E] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Sumanthika Sundar"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBDDE4] focus:outline-none focus:border-[#970747] text-sm text-[#25171E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#25171E] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EBDDE4] focus:outline-none focus:border-[#970747] text-sm text-[#25171E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25171E] mb-1.5">
                  Phone (WhatsApp) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#EBDDE4] bg-[#FDF5F8] text-xs font-semibold text-[#66545D]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-r-xl border border-[#EBDDE4] focus:outline-none focus:border-[#970747] text-sm text-[#25171E]"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp reminders opt-in */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDF5F8] border border-[#EBDDE4]">
              <input
                type="checkbox"
                id="whatsappOptIn"
                checked={formData.whatsappOptIn}
                onChange={(e) => setFormData({ ...formData, whatsappOptIn: e.target.checked })}
                className="mt-1 h-4 w-4 rounded accent-[#970747] cursor-pointer"
              />
              <label htmlFor="whatsappOptIn" className="text-xs text-[#66545D] cursor-pointer">
                <span className="font-semibold text-[#25171E] block">Receive Instant WhatsApp Reminders & Joining Pass</span>
                Approved templates only. We will deliver your direct join link and calendar invite 30 minutes before the session starts.
              </label>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Payment Pending notice */}
            {paymentStatus === 'pending' && (
              <div className="p-3.5 rounded-xl bg-[#F7DCE8] border border-[#F3A6C4] text-[#970747] text-xs flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-[#970747] border-t-transparent animate-spin shrink-0" />
                <span>Connecting to payment gateway & securing your registration seat...</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EBDDE4]">
              <div className="text-left">
                <p className="text-[11px] text-[#66545D]">Total Payable Amount:</p>
                <p className="font-heading font-black text-2xl text-[#970747]">
                  {amount === 0 ? 'FREE' : `₹${amount}`}
                  {amount > 0 && <span className="text-xs font-normal text-[#66545D] ml-1">incl. taxes</span>}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-full border border-[#EBDDE4] text-xs font-semibold text-[#66545D] hover:bg-[#FDF5F8] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 sm:flex-initial px-8 py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Lock className="w-4 h-4 text-white/90" />
                  <span>
                    {isSubmitting 
                      ? 'Processing...' 
                      : amount === 0 
                        ? 'Confirm Free Pass' 
                        : `Pay ₹${amount} & Confirm`}
                  </span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-center text-[#66545D] flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit encrypted checkout with backend cryptographic verification.</span>
            </p>

          </form>

        </div>

      </div>
    </div>
  );
}
