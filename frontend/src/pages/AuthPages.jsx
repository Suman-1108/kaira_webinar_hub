import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  Phone,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Clock,
  KeyRound,
  Check,
  X
} from 'lucide-react';

/**
 * Mask an email address for privacy (e.g. su*****29@gmail.com)
 */
function maskEmail(email = '') {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const visibleStart = local.slice(0, 2);
  const visibleEnd = local.slice(-1);
  const masked = '*'.repeat(Math.max(3, local.length - 3));
  return `${visibleStart}${masked}${visibleEnd}@${domain}`;
}

/**
 * Check password against security requirements
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

/**
 * 1. Login Page (/login)
 */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    setError('');
    setUnverifiedEmail('');

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      if (err.requiresVerification) {
        setUnverifiedEmail(err.email || email.trim());
        setError(err.message || 'Your email address is not verified. Please verify your email to log in.');
      } else {
        setError(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F7F9FA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-[#D1D1D7] rounded-2xl shadow-sm p-8 sm:p-10 space-y-6">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-11 h-11 bg-[#970747] rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-[#750435] transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#1C1D1F] font-heading">
              Kaira<span className="text-[#970747]">Hub</span>
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1D1F] font-heading pt-2">
            Welcome back!
          </h1>
          <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
            Sign in to continue exploring webinars and learning opportunities.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl space-y-2">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {unverifiedEmail && (
              <div className="pt-2 border-t border-red-200 flex justify-end">
                <Link
                  to={`/register?step=otp&email=${encodeURIComponent(unverifiedEmail)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#970747] text-white rounded-lg font-bold text-xs hover:bg-[#750435] transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Verify Email with OTP →</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 border border-[#D1D1D7] rounded-xl text-sm text-[#1C1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#970747] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-[#970747] hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-2.5 border border-[#D1D1D7] rounded-xl text-sm text-[#1C1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#970747] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#1C1D1F]"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#52525B]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#970747] focus:ring-[#970747] accent-[#970747]"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="text-center pt-3 border-t border-[#E5E7EB] text-xs text-[#52525B]">
          <span>Don't have an account? </span>
          <Link
            to={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[#970747] font-bold hover:underline"
          >
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );
}

/**
 * 2. Student Registration Page (/register) with Email OTP Verification Flow
 */
export function RegisterPage() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';
  const queryStep = searchParams.get('step');
  const queryEmail = searchParams.get('email');

  // Step state: 'form' | 'otp' | 'verified'
  const [step, setStep] = useState(queryStep === 'otp' ? 'otp' : 'form');

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(queryEmail || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP Verification State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const otpInputRefs = useRef([]);

  // General Status & Error Handling
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Form Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccessMsg('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate password rules
    const rules = checkPasswordRules(password);
    if (!rules.hasLength || !rules.hasUpper || !rules.hasLower || !rules.hasDigit || !rules.hasSpecial) {
      setError('Your password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.');
      return;
    }

    // Confirm password match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and re-enter.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(cleanName, cleanEmail, password, phone.trim());
      setSuccessMsg(res.message || "We've sent a verification code to your email.");
      setStep('otp');
      setResendCooldown(60); // 60s cooldown for resending
      // Clear OTP inputs and focus first digit
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    // Only accept numeric inputs
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setError('');

    // Auto-advance to next input if digit entered
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6-digit OTP code
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedData.length >= 6) {
      const pastedDigits = pastedData.slice(0, 6).split('');
      setOtpDigits(pastedDigits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Handle OTP verification submission
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccessMsg('');

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email.trim().toLowerCase(), fullCode);
      setSuccessMsg(res.message || 'Email verified successfully! Welcome to Kaira Webinar Hub.');
      setStep('verified');
      // Redirect after brief visual confirmation
      setTimeout(() => {
        navigate(redirectUrl, { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP Request
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setError('');
    setSuccessMsg('');
    setResendLoading(true);

    try {
      const res = await resendOtp(email.trim().toLowerCase());
      setSuccessMsg(res.message || 'A new verification code has been dispatched to your email.');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "We couldn't send your verification email. Please try again shortly.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F7F9FA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-[#D1D1D7] rounded-2xl shadow-sm p-8 sm:p-10 space-y-6">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-11 h-11 bg-[#970747] rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-[#750435] transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#1C1D1F] font-heading">
              Kaira<span className="text-[#970747]">Hub</span>
            </span>
          </Link>

          {step === 'form' && (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1D1F] font-heading pt-2">
                Create your KairaHub account
              </h1>
              <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                Join KairaHub to register for live masterclasses and unlock your learning journey.
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="w-12 h-12 bg-[#FDF6F8] border border-[#F1D3DE] rounded-full flex items-center justify-center text-[#970747] mx-auto mt-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1C1D1F] font-heading pt-1">
                Verify Your Email
              </h1>
              <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                We've sent a 6-digit verification code to <br />
                <strong className="text-[#1C1D1F] font-mono">{maskEmail(email)}</strong>
              </p>
            </>
          )}

          {step === 'verified' && (
            <>
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto mt-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1C1D1F] font-heading pt-1">
                Account Verified!
              </h1>
              <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                Your email is confirmed and your student account is active. Redirecting...
              </p>
            </>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && !error && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* STAGE 1: Registration Form */}
        {step === 'form' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
                Full Name <span className="text-[#970747]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sumanthika Sundar"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D1D1D7] rounded-xl text-sm text-[#1C1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#970747] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
                Email Address <span className="text-[#970747]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D1D1D7] rounded-xl text-sm text-[#1C1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#970747] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D1D1D7] rounded-xl text-sm text-[#1C1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#970747] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
                Password <span className="text-[#970747]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, A-Z, a-z, 0-9, symbol"
                  className="w-full pl-10 pr-11 py-2.5 border border-[#D1D1D7] rounded-xl text-sm text-[#1C1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#970747] focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#1C1D1F] cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Password Security Checklist */}
              <PasswordRulesChecklist password={password} />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
                Confirm Password <span className="text-[#970747]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 border rounded-xl text-sm text-[#1C1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition-all font-mono ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-300 focus:ring-red-400' 
                      : 'border-[#D1D1D7] focus:ring-[#970747]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#1C1D1F] cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && (
                <div className="mt-1.5 text-xs flex items-center gap-1.5">
                  {password === confirmPassword ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1 text-[11px]">
                      <X className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#52525B] leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#970747] focus:ring-[#970747] accent-[#970747] shrink-0"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#970747] font-semibold hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the{' '}
                  <Link to="/privacy" className="text-[#970747] font-semibold hover:underline">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
            </div>

            {/* Submit Registration Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending verification code...</span>
                </>
              ) : (
                <span>Register & Send Verification Code</span>
              )}
            </button>
          </form>
        )}

        {/* STAGE 2: OTP Email Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
            <div className="bg-[#FAF5F7] border border-[#F1D3DE] rounded-xl p-3.5 text-xs text-[#831843] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#970747] shrink-0" />
              <span>This verification code expires in <strong>10 minutes</strong>. Never share your code with anyone.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-2 text-center">
                Enter 6-Digit Verification Code
              </label>

              {/* 6 Digit Inputs with Paste Support */}
              <div className="flex justify-between gap-2 sm:gap-2.5 my-3" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-2xl font-black text-[#970747] border-2 border-[#D1D1D7] rounded-xl focus:border-[#970747] focus:ring-2 focus:ring-[#970747]/20 outline-none transition-all shadow-xs"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#71717A] text-center mt-1">
                Tip: You can paste the complete 6-digit code from your email.
              </p>
            </div>

            {/* Verify Email Button */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Email & Activate Account</span>
                </>
              )}
            </button>

            {/* Resend OTP & Change Email Controls */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                className="font-bold text-[#970747] hover:text-[#750435] disabled:text-[#9CA3AF] disabled:cursor-not-allowed inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Verification Code'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-[#52525B] hover:text-[#1C1D1F] underline cursor-pointer"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        {/* STAGE 3: Account Successfully Verified */}
        {step === 'verified' && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-2">
              <p className="font-bold text-sm text-emerald-900">Welcome to Kaira Webinar Hub!</p>
              <p>Your session is established. Taking you to your destination...</p>
            </div>
            <button
              onClick={() => navigate(redirectUrl, { replace: true })}
              className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold"
            >
              Continue Now →
            </button>
          </div>
        )}

        {/* Footer Link to Login */}
        {step === 'form' && (
          <div className="text-center pt-3 border-t border-[#E5E7EB] text-xs text-[#52525B]">
            <span>Already have an account? </span>
            <Link
              to={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="text-[#970747] font-bold hover:underline"
            >
              Log in
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

/**
 * 3. Forgot Password Page (/forgot-password)
 */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      setStatus('success');
      setMessage(data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setStatus('error');
      setMessage('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F7F9FA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-[#D1D1D7] rounded-2xl shadow-sm p-8 sm:p-10 space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-11 h-11 bg-[#970747] rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-[#750435] transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#1C1D1F] font-heading">
              Kaira<span className="text-[#970747]">Hub</span>
            </span>
          </Link>

          <h1 className="text-2xl font-extrabold text-[#1C1D1F] font-heading pt-2">
            Reset your password
          </h1>
          <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-3 text-xs leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Instructions Sent!</span>
            </div>
            <p>{message}</p>
            <p className="text-[#52525B]">
              Please check your inbox (and spam folder) for the password recovery link dispatched via our mail service.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                Return to Log in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D1D1D7] rounded-xl text-sm text-[#1C1D1F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#970747] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending instructions...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-3 border-t border-[#E5E7EB]">
          <Link
            to="/login"
            className="text-xs font-bold text-[#52525B] hover:text-[#970747] inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Log in</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

/**
 * 4. Reset Password Page (/reset-password/:token)
 */
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'loading') return;
    setError('');

    const rules = checkPasswordRules(newPassword);
    if (!rules.hasLength || !rules.hasUpper || !rules.hasLower || !rules.hasDigit || !rules.hasSpecial) {
      setError('Your password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setError(data.message || 'Failed to reset password.');
        setStatus('idle');
      }
    } catch (err) {
      setError('Server error during password reset.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F7F9FA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-[#D1D1D7] rounded-2xl shadow-sm p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-[#1C1D1F] font-heading">
            Set New Password
          </h1>
          <p className="text-xs text-[#52525B]">
            Please choose a strong, secure password for your KairaHub account.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-3 text-xs text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm text-emerald-900">Password Reset Complete!</p>
            <p>You can now sign in to KairaHub using your new password.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, A-Z, a-z, 0-9, symbol"
                  className="w-full pl-10 pr-11 py-2.5 border border-[#D1D1D7] rounded-xl text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#1C1D1F]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordRulesChecklist password={newPassword} />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1D1F] uppercase mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D1D1D7] rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full btn-primary py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
