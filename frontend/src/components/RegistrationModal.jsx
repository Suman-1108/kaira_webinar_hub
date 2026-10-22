import React, { useState, useEffect, useRef } from 'react';
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
  MailCheck,
  Eye,
  EyeOff,
  KeyRound,
  User,
  Phone,
  RefreshCw,
  CheckCircle2,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

/**
 * Check password against strict security requirements
 */
function checkPasswordRules(pwd = '') {
  return {
    hasLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasDigit: /\d/.test(pwd),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  };
}

/**
 * Visual Password Security Indicator
 */
function PasswordRulesChecklist({ password }) {
  const rules = checkPasswordRules(password);
  const ruleItems = [
    { label: 'At least 8 characters', met: rules.hasLength },
    { label: 'One uppercase letter (A-Z)', met: rules.hasUpper },
    { label: 'One lowercase letter (a-z)', met: rules.hasLower },
    { label: 'One number (0-9)', met: rules.hasDigit },
    { label: 'One special character (!@#$%&*)', met: rules.hasSpecial }
  ];

  if (!password) return null;

  return (
    <div className="bg-[#FAF5F7] border border-[#F1D3DE] rounded-xl p-3 text-xs space-y-1.5 mt-2 transition-all">
      <div className="font-bold text-[#831843] text-[11px] uppercase tracking-wide flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Password Requirements:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {ruleItems.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-1.5 ${item.met ? 'text-emerald-700 font-semibold' : 'text-[#71717A]'}`}
          >
            {item.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1 mr-1 shrink-0" />
            )}
            <span className="text-[11px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegistrationModal({ 
  webinar, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const { user, token, register, verifyOtp, login, resendOtp } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !webinar) return null;

  const [ticketType, setTicketType] = useState(
    webinar.price === 0 ? 'Free Pass' : 'VIP Masterclass Pass'
  );

  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    email: user ? user.email : '',
    phone: (user && user.phone) ? user.phone : '',
    countryCode: '+91'
  });

  // Auth flow states for guest users
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalStep, setModalStep] = useState('details'); // 'details' | 'otp'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const otpInputRefs = useRef([]);

  const [paymentProvider, setPaymentProvider] = useState('phonepe'); // PhonePe PG v2 Standard Checkout
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

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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

  /**
   * Finalize webinar pass reservation and initiate gateway checkout
   */
  const executeWebinarRegistration = async (activeAuthToken) => {
    setIsSubmitting(true);
    setPaymentStatus('pending');

    try {
      const res = await fetch('/api/registration/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(activeAuthToken ? { 'Authorization': `Bearer ${activeAuthToken}` } : {})
        },
        body: JSON.stringify({
          webinarId: webinar.id,
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          countryCode: formData.countryCode,
          ticketType,
          paymentProvider: 'phonepe'
        })
      });

      const json = await safeJson(res);

      if (!json.success) {
        throw new Error(json.message || 'Registration reservation failed.');
      }

      const { 
        registrationId, 
        isFree, 
        verificationCode,
        phonepePaymentUrl 
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

      // Handle PhonePe PG v2 Standard Checkout via official create-order endpoint
      const orderRes = await fetch('/api/payments/phonepe/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(activeAuthToken ? { 'Authorization': `Bearer ${activeAuthToken}` } : {})
        },
        body: JSON.stringify({ registrationId })
      });
      const orderData = await safeJson(orderRes);
      if (orderData.success && orderData.redirectUrl) {
        window.location.assign(orderData.redirectUrl);
        return;
      }

      throw new Error(orderData.message || 'PhonePe payment checkout could not be initiated. Please verify your details or try again.');

    } catch (err) {
      console.error('Registration execution error:', err);
      setIsSubmitting(false);
      setPaymentStatus('failed');
      setErrorMessage(err.message || 'An error occurred during registration.');
    }
  };

  /**
   * Handle Primary Form Submit
   */
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

    // Case 1: User is already authenticated
    if (user && token) {
      await executeWebinarRegistration(token);
      return;
    }

    // Case 2: Guest user is signing in to existing account
    if (authMode === 'login') {
      if (!password) {
        setErrorMessage('Please enter your account password.');
        return;
      }
      setIsSubmitting(true);
      try {
        const loggedInUser = await login(formData.email.trim(), password);
        const activeToken = localStorage.getItem('kaira_token');
        await executeWebinarRegistration(activeToken);
      } catch (err) {
        setIsSubmitting(false);
        setErrorMessage(err.message || 'Invalid email or password.');
      }
      return;
    }

    // Case 3: Guest user is creating a new account (Enforce strict password rules)
    if (!password) {
      setErrorMessage('Please create a secure password for your student account.');
      return;
    }

    const rules = checkPasswordRules(password);
    if (!rules.hasLength || !rules.hasUpper || !rules.hasLower || !rules.hasDigit || !rules.hasSpecial) {
      setErrorMessage('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Step A: Initiate account creation with SMTP OTP
      const regRes = await register(
        formData.fullName.trim(),
        formData.email.trim().toLowerCase(),
        password,
        formData.phone.trim()
      );

      // Transition to OTP verification step
      setIsSubmitting(false);
      setModalStep('otp');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setIsSubmitting(false);
      if (err.message && err.message.includes('already exists')) {
        setErrorMessage('An account with this email already exists. Switch to "Sign In" below.');
      } else {
        setErrorMessage(err.message || 'Registration failed. Please try again.');
      }
    }
  };

  /**
   * Handle OTP digit inputs
   */
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMessage('');

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pasted.length >= 6) {
      setOtpDigits(pasted.slice(0, 6).split(''));
      otpInputRefs.current[5]?.focus();
    }
  };

  /**
   * Handle OTP verification & immediate registration
   */
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Activate account
      await verifyOtp(formData.email.trim().toLowerCase(), fullCode);
      const activeToken = localStorage.getItem('kaira_token');

      // Now authenticated: proceed to execute registration
      setModalStep('details');
      await executeWebinarRegistration(activeToken);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    }
  };

  /**
   * Handle Resending OTP
   */
  const handleResendOtpCode = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setErrorMessage('');
    setResendLoading(true);

    try {
      await resendOtp(formData.email.trim().toLowerCase());
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMessage(err.message || 'Could not resend code. Please try again shortly.');
    } finally {
      setResendLoading(false);
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

        {/* Content Container */}
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

          {/* STAGE A: OTP Verification Modal Step */}
          {modalStep === 'otp' ? (
            <div className="bg-[#FAF5F7] border border-[#F1D3DE] rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-full border border-[#EBDDE4] flex items-center justify-center text-[#970747] mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#1C1D1F]">Verify Your Email Address</h4>
                <p className="text-xs text-[#52525B] mt-1">
                  We've dispatched a 6-digit activation code to <strong>{formData.email}</strong>.
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3 py-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-bold border-2 border-[#D1D1D7] rounded-xl bg-white text-[#1C1D1F] focus:border-[#970747] focus:outline-none transition-all"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResendOtpCode}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-xs text-[#970747] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                </button>

                <button
                  type="button"
                  onClick={handleVerifyOtpAndRegister}
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Confirm Pass</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STAGE B: Standard Form Fields */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Authenticated User Status or Guest Mode Tabs */}
              {user ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Logged in as <strong>{user.name}</strong> ({user.email})</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Verified Student
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-[#EBDDE4] pb-2 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                      className={`font-bold transition-colors cursor-pointer ${
                        authMode === 'register' ? 'text-[#970747] border-b-2 border-[#970747] pb-1' : 'text-[#71717A]'
                      }`}
                    >
                      New Student (Create Account)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                      className={`font-bold transition-colors cursor-pointer ${
                        authMode === 'login' ? 'text-[#970747] border-b-2 border-[#970747] pb-1' : 'text-[#71717A]'
                      }`}
                    >
                      Existing Student (Sign In)
                    </button>
                  </div>
                  <span className="text-[10px] text-[#71717A] hidden sm:inline">
                    {authMode === 'register' ? 'Automated SMTP OTP verification' : 'Sign in to access student pass'}
                  </span>
                </div>
              )}

              {/* Full Name */}
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

              {/* Email & Phone */}
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

              {/* Password field for unauthenticated users */}
              {!user && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#25171E]">
                      {authMode === 'register' ? 'Create Password *' : 'Account Password *'}
                    </label>
                    <span className="text-[10px] text-[#71717A]">
                      {authMode === 'register' ? 'Enforced policy' : 'Enter existing password'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'register' ? 'Create strong password' : 'Enter your password'}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#EBDDE4] focus:outline-none focus:border-[#970747] text-sm text-[#25171E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#1C1D1F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password rules indicator for registration */}
                  {authMode === 'register' && <PasswordRulesChecklist password={password} />}
                </div>
              )}

              {/* Email verification & pass delivery notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FDF5F8] border border-[#EBDDE4]">
                <Mail className="w-4 h-4 text-[#970747] mt-0.5 shrink-0" />
                <div className="text-xs text-[#66545D]">
                  <span className="font-semibold text-[#25171E] block">Email Verification & Instant Pass Delivery</span>
                  We will dispatch your verified pass code, calendar invite, and PDF tax invoice directly to <strong>{formData.email || 'your email'}</strong> via SMTP.
                </div>
              </div>

              {/* Payment Method Selector (for paid passes) */}
              {amount > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#970747]">
                    Secured Payment Gateway
                  </label>
                  <div className="p-3.5 rounded-2xl border border-[#5f259f] bg-[#FAF5FF] shadow-xs ring-1 ring-[#5f259f]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#5f259f] text-white flex items-center justify-center font-black text-sm shadow-xs">
                        पे
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#1C1D1F]">PhonePe PG v2</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5f259f]/10 text-[#5f259f]">Official Gateway</span>
                        </div>
                        <p className="text-[11px] text-[#66545D]">UPI, QR Code, Credit/Debit Cards, NetBanking</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-[#5f259f] bg-[#5f259f] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
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
                        : !user && authMode === 'register'
                          ? 'Register & Continue →'
                          : !user && authMode === 'login'
                            ? 'Sign In & Confirm'
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
          )}

        </div>

      </div>
    </div>
  );
}
