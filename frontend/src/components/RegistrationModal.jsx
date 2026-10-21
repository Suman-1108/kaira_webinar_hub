import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MailCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function RegistrationModal({ 
  webinar, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !webinar) return null;

  const [ticketType, setTicketType] = useState(
    webinar.price === 0 ? 'Free Pass' : 'VIP Masterclass Pass'
  );

  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    email: user ? user.email : '',
    phone: (user && user.phone) ? user.phone : '',
    countryCode: '+91',
    whatsappOptIn: true
  });

  const [paymentProvider, setPaymentProvider] = useState('phonepe'); // 'phonepe' | 'razorpay'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | pending | failed | verified
  const [verifiedPassCode, setVerifiedPassCode] = useState('');

  // Keep form data synchronized if user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Pricing calculations
  const getTicketPrice = (type) => {
    if (type === 'Free Pass') return 0;
    if (type === 'VIP Masterclass Pass') return webinar.price || 499;
    if (type === 'Corporate Team Pass') return (webinar.price ? webinar.price * 3 : 1499);
    return 0;
  };

  const amount = getTicketPrice(ticketType);

  const triggerSuccessCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#970747', '#D63384', '#F3A6C4', '#5f259f', '#58CC02']
      });
    } catch (e) {}
  };

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

    const safeJson = async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status} (${response.statusText || 'Error'})`);
        }
        throw new Error('Unexpected server response format');
      }
    };

    try {
      // Step 1: Initiate registration with backend
      const res = await fetch('/api/registration/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          webinarId: webinar.id,
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          countryCode: formData.countryCode,
          ticketType,
          paymentProvider,
          whatsappOptIn: formData.whatsappOptIn
        })
      });

      const json = await safeJson(res);

      if (!json.success) {
        throw new Error(json.message || 'Registration initiation failed.');
      }

      const { 
        registrationId, 
        isFree, 
        razorpayOrderId, 
        razorpayKeyId, 
        verificationCode,
        phonepePaymentUrl,
        phonepeMerchantTransactionId 
      } = json.data;
      setVerifiedPassCode(verificationCode || 'VERIFIED');

      // If free ticket, backend already completed it
      if (isFree || amount === 0) {
        triggerSuccessCelebration();
        setPaymentStatus('verified');
        setIsSubmitting(false);
        onSuccess && onSuccess(registrationId);
        return;
      }

      // Step 2A: Handle PhonePe Checkout
      if (paymentProvider === 'phonepe') {
        if (phonepePaymentUrl) {
          window.location.assign(phonepePaymentUrl);
          return;
        }

        // Call PhonePe PG v2 create-order endpoint
        const orderRes = await fetch('/api/payments/phonepe/create-order', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ registrationId })
        });
        const orderData = await safeJson(orderRes);
        if (orderData.success && orderData.redirectUrl) {
          window.location.assign(orderData.redirectUrl);
          return;
        }

        throw new Error(orderData.message || 'PhonePe payment checkout could not be opened. Please try again.');
      }

      // Step 2B: Handle Paid Razorpay Checkout
      if (window.Razorpay) {
        const options = {
          key: razorpayKeyId || '',
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
        throw new Error('Razorpay SDK could not be loaded. Please disable ad-blockers or try PhonePe.');
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
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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

      // Success confirmed by backend
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
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 ml-4 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Schedule summary */}
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
              <span>Instructor: {webinar.speaker?.name || 'Expert Speaker'}</span>
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
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBDDE4] focus:outline-none focus:border-[#970747] text-sm text-[#25171E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#25171E] mb-1.5 flex items-center justify-between">
                  <span>Email Address *</span>
                  <span className="text-[10px] text-[#15803D] font-bold flex items-center gap-1">
                    <MailCheck className="w-3 h-3" /> Pass Delivery
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EBDDE4] focus:outline-none focus:border-[#970747] text-sm text-[#25171E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25171E] mb-1.5">
                  Phone (Pass & Reminders) *
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

            {/* Email verification & pass delivery opt-in */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDF5F8] border border-[#EBDDE4]">
              <input
                type="checkbox"
                id="whatsappOptIn"
                checked={formData.whatsappOptIn}
                onChange={(e) => setFormData({ ...formData, whatsappOptIn: e.target.checked })}
                className="mt-1 h-4 w-4 rounded accent-[#970747] cursor-pointer"
              />
              <label htmlFor="whatsappOptIn" className="text-xs text-[#66545D] cursor-pointer">
                <span className="font-semibold text-[#25171E] block">Receive Email Verification & Instant Pass Alerts</span>
                We will dispatch your verified pass code, calendar invite, and access credentials directly to <strong>{formData.email || 'your email'}</strong>.
              </label>
            </div>

            {/* Payment Method Selector (for paid passes) */}
            {amount > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#970747]">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentProvider('phonepe')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentProvider === 'phonepe'
                        ? 'border-[#5f259f] bg-[#FAF5FF] shadow-xs ring-2 ring-[#5f259f]/30'
                        : 'border-[#EBDDE4] bg-white hover:border-[#5f259f]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#5f259f] text-white flex items-center justify-center font-black text-sm shadow-xs">
                        पे
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#1C1D1F]">PhonePe</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#5f259f]/10 text-[#5f259f]">Primary</span>
                        </div>
                        <p className="text-[11px] text-[#66545D]">UPI, QR, Cards, NetBanking</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentProvider === 'phonepe' ? 'border-[#5f259f] bg-[#5f259f]' : 'border-[#CBD5E1]'
                    }`}>
                      {paymentProvider === 'phonepe' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentProvider('razorpay')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentProvider === 'razorpay'
                        ? 'border-[#0C2340] bg-[#F8FAFC] shadow-xs ring-2 ring-[#0C2340]/30'
                        : 'border-[#EBDDE4] bg-white hover:border-[#0C2340]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#0C2340] text-[#3395FF] flex items-center justify-center font-black text-xs shadow-xs">
                        RZP
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1C1D1F]">Razorpay</p>
                        <p className="text-[11px] text-[#66545D]">Credit / Debit / NetBanking</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentProvider === 'razorpay' ? 'border-[#0C2340] bg-[#0C2340]' : 'border-[#CBD5E1]'
                    }`}>
                      {paymentProvider === 'razorpay' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                <span>Securing your pass & generating verified email ticket...</span>
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
                  className="px-5 py-3 rounded-full border border-[#EBDDE4] text-xs font-semibold text-[#66545D] hover:bg-[#FDF5F8] transition-colors cursor-pointer"
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
              <span>Verified student checkout with automated Gmail delivery & JWT security.</span>
            </p>

          </form>

        </div>

      </div>
    </div>
  );
}
