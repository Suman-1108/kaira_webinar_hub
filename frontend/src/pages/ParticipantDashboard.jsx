import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  User, 
  ExternalLink, 
  Download, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Bell, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Play,
  MoreVertical,
  Star,
  Award,
  Heart,
  Share2,
  Bookmark,
  Archive,
  RefreshCw,
  Flame,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SuccessReceiptModal from '../components/SuccessReceiptModal';

export default function ParticipantDashboard({ defaultTab = 'all' }) {
  const { user, token, loading: authLoading, updateUser } = useAuth();
  const { wishlist, removeFromWishlist } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation Tabs: all, my-lists, wishlist, certificates, archived, tools, invoices, profile
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenuCourseId, setActiveMenuCourseId] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Invoices & Pass modal state
  const [registrations, setRegistrations] = useState([]);
  const [activePassId, setActivePassId] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [emailAlerts, setEmailAlerts] = useState(user?.notificationPreferences?.email ?? true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Scheduler banner state
  const [showScheduleCard, setShowScheduleCard] = useState(true);
  // Payment feedback banner state (success / retry / pending)
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [retryingPayment, setRetryingPayment] = useState(false);

  // Retry checkout via official PhonePe create-order endpoint
  const handleRetryPayment = async (targetRegId) => {
    if (!targetRegId || retryingPayment) return;
    setRetryingPayment(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/payments/phonepe/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify({ registrationId: targetRegId })
      });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
        window.location.assign(data.redirectUrl);
      } else {
        alert(data.message || 'Could not initiate PhonePe payment retry. Please try again shortly.');
      }
    } catch (err) {
      console.error('Payment retry error:', err);
      alert('Network error while connecting to PhonePe payment gateway.');
    } finally {
      setRetryingPayment(false);
    }
  };

  // Parse path or search tab
  useEffect(() => {
    if (location.pathname.includes('/my-invoices')) {
      setActiveTab('invoices');
    } else if (location.pathname.includes('/my-account')) {
      setActiveTab('profile');
    } else {
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['all', 'my-lists', 'wishlist', 'certificates', 'archived', 'tools', 'invoices', 'profile'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('all');
      }
    }
  }, [location.pathname, location.search]);

  // Fetch student's enrolled courses with MongoDB progress records
  const fetchMyCourses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/learning/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCourses(data.data.courses || []);
        setStats(data.data.stats || null);
      }
    } catch (err) {
      console.warn('Failed to load learning courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch registrations for receipts/invoices
  const fetchRegistrations = async () => {
    if (!token || !user) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/registration/my-events', { headers });
      if (res.status === 401) {
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setRegistrations(data.data);
      }
    } catch (err) {
      console.warn('Failed to load user registrations:', err);
    }
  };

  useEffect(() => {
    if (!authLoading && user && token) {
      fetchMyCourses();
      fetchRegistrations();
    }
  }, [user, token, authLoading]);

  // Handle return redirect from PhonePe payment gateway
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    const regId = params.get('regId');
    const orderId = params.get('orderId') || params.get('txn');

    // Trigger verification only if order ID or payment parameter is present
    if ((payment === 'callback' || payment === 'status' || payment === 'success' || orderId) && (regId || orderId)) {
      const verifyPayment = async () => {
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch('/api/payments/phonepe/verify', {
            method: 'POST',
            headers,
            body: JSON.stringify({ registrationId: regId, orderId })
          });
          const json = await res.json();
          // Strictly grant access ONLY when backend verification actually returns status: completed
          if (json.success && json.data?.status === 'completed') {
            setActivePassId(regId || json.data?.registrationId);
            setPaymentNotice({
              type: 'success',
              message: 'PhonePe payment verified successfully! Your masterclass pass and tax invoice have been generated.'
            });
            fetchMyCourses();
            fetchRegistrations();
          } else {
            console.warn('[PhonePe Verification]: Payment not verified as completed:', json.message || json.state);
            setPaymentNotice({
              type: 'error',
              message: json.message || 'PhonePe payment was not completed or was cancelled. Your reservation is safely retained.',
              regId: regId || orderId
            });
          }
        } catch (err) {
          console.warn('Payment auto-verify notice:', err);
          setPaymentNotice({
            type: 'error',
            message: 'Unable to verify payment status with PhonePe at this time. Please check your transaction or retry.',
            regId: regId || orderId
          });
        }
      };
      verifyPayment();
    }
  }, [location.search, token]);

  // Toggle Archive
  const handleToggleArchive = async (courseId, currentStatus) => {
    try {
      const res = await fetch('/api/learning/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, isArchived: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCourses(courses.map(c => 
          c.courseId === courseId 
            ? { ...c, progress: { ...c.progress, isArchived: !currentStatus } }
            : c
        ));
      }
    } catch (e) {
      console.warn('Archive toggle error:', e);
    } finally {
      setActiveMenuCourseId(null);
    }
  };

  // Toggle My List
  const handleToggleMyList = async (courseId, currentStatus) => {
    try {
      const res = await fetch('/api/learning/my-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, isInMyList: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCourses(courses.map(c => 
          c.courseId === courseId 
            ? { ...c, progress: { ...c.progress, isInMyList: !currentStatus } }
            : c
        ));
      }
    } catch (e) {
      console.warn('My list toggle error:', e);
    } finally {
      setActiveMenuCourseId(null);
    }
  };

  // View Certificate
  const handleViewCertificate = async (courseId) => {
    try {
      const res = await fetch(`/api/learning/certificate/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedCertificate(data.data);
      } else {
        alert(data.message || 'Complete 100% of the course lectures to unlock your verified credential.');
      }
    } catch (e) {
      console.warn('Certificate error:', e);
    }
  };

  // Save student profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          phone,
          headline,
          notificationPreferences: { email: emailAlerts }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        updateUser && updateUser(data.data);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.warn('Profile update error:', err);
    }
  };

  // Filter courses by tab
  const activeCourses = courses.filter(c => !c.progress.isArchived);
  const archivedCourses = courses.filter(c => c.progress.isArchived);
  const myListCourses = courses.filter(c => c.progress.isInMyList);
  const completedCourses = courses.filter(c => c.progress.completionPercentage === 100);

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#1C1D1F]">
      
      {/* 1. Udemy-Style Dark Header with Navigation Tabs (Matching Screenshot 1 & 5) */}
      <div className="bg-[#1C1D1F] text-white pt-8 pb-0 px-4 sm:px-6 lg:px-8 border-b border-[#3E4143]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                My learning
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Welcome back, <strong className="text-white">{user?.name || 'Student'}</strong>. Pick up right where you left off.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchMyCourses}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D2F31] hover:bg-[#3E4143] text-xs font-bold text-zinc-300 transition-colors cursor-pointer border border-[#3E4143]"
                title="Refresh Progress"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>

              <Link
                to="/webinars"
                className="btn-primary py-1.5 px-3.5 text-xs font-bold rounded-lg shadow-xs"
              >
                Browse Masterclasses
              </Link>
            </div>
          </div>

          {/* Navigation Tabs (Screenshot 1) */}
          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar border-t border-[#2D2F31] pt-1">
            {[
              { id: 'all', label: 'All courses', count: activeCourses.length },
              { id: 'my-lists', label: 'My Lists', count: myListCourses.length },
              { id: 'wishlist', label: 'Wishlist', count: wishlist?.length || 0 },
              { id: 'certificates', label: 'Certifications', count: completedCourses.length },
              { id: 'archived', label: 'Archived', count: archivedCourses.length },
              { id: 'tools', label: 'Learning tools' },
              { id: 'invoices', label: 'Receipts & Passes', count: registrations.length },
              { id: 'profile', label: 'Profile' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-1 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#970747] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === tab.id ? 'bg-[#970747] text-white' : 'bg-[#2D2F31] text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. Main Tabbed Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Payment Verification Feedback Alert */}
        {paymentNotice && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
            paymentNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-start sm:items-center gap-3">
              {paymentNotice.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <div>
                <p className="text-xs sm:text-sm font-bold font-heading">
                  {paymentNotice.type === 'success' ? 'Payment Verified Successfully' : 'Payment Status: Incomplete / Cancelled'}
                </p>
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{paymentNotice.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {paymentNotice.regId && paymentNotice.type === 'error' && (
                <button
                  onClick={() => handleRetryPayment(paymentNotice.regId)}
                  disabled={retryingPayment}
                  className="px-3.5 py-1.5 bg-[#970747] hover:bg-[#750435] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  {retryingPayment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Opening PhonePe...</span>
                    </>
                  ) : (
                    <span>Retry Checkout with PhonePe</span>
                  )}
                </button>
              )}
              <button
                onClick={() => setPaymentNotice(null)}
                className="p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* A. Hero Streaks & Learning Scheduler (Matching Screenshot 1) */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Streak card (Screenshot 1) */}
            <div className="bg-white border border-[#F1D3DE] rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <h3 className="font-bold text-sm text-[#1C1D1F]">Start a new streak</h3>
                </div>
                <p className="text-xs text-[#52525B] leading-snug">
                  We know you have it in you. Go after your goals!
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-[#52525B]">
                  <span className="font-extrabold text-[#970747]">1 week</span>
                  <span>Current streak</span>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray="60, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-emerald-600">
                    60%
                  </span>
                </div>
                <div className="text-[11px] text-[#52525B]">
                  <p className="font-bold text-[#1C1D1F]">18/30 course min</p>
                  <p>1/1 visit • Oct 18 - 24</p>
                </div>
              </div>
            </div>

            {/* Schedule Learning Time Card (Screenshot 1) */}
            {showScheduleCard && (
              <div className="bg-white border border-[#F1D3DE] rounded-2xl p-5 shadow-xs flex items-start justify-between relative">
                <div className="flex items-start gap-3.5 pr-6">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF5F7] text-[#970747] flex items-center justify-center shrink-0 border border-[#F1D3DE]">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1D1F]">Schedule learning time</h3>
                    <p className="text-xs text-[#52525B] mt-0.5 leading-snug">
                      Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals.
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => setActiveTab('tools')}
                        className="btn-primary py-1.5 px-3.5 text-xs font-bold rounded-lg shadow-xs"
                      >
                        Get started
                      </button>
                      <button
                        onClick={() => setShowScheduleCard(false)}
                        className="text-xs text-[#52525B] hover:text-[#1C1D1F] font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowScheduleCard(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1 absolute top-3 right-3"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* B. ALL COURSES TAB (Screenshot 1 & 5) */}
        {activeTab === 'all' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1C1D1F]">
                Enrolled Masterclasses ({activeCourses.length})
              </h2>
              <span className="text-xs text-[#52525B]">
                {completedCourses.length} Completed • {activeCourses.length - completedCourses.length} In Progress
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white border border-[#F1D3DE] rounded-2xl p-4 h-80 animate-pulse space-y-3">
                    <div className="aspect-video bg-zinc-200 rounded-xl" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-200 rounded w-1/2" />
                    <div className="h-2 bg-zinc-200 rounded-full mt-4" />
                  </div>
                ))}
              </div>
            ) : activeCourses.length === 0 ? (
              <div className="bg-white border border-[#F1D3DE] rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF5F7] text-[#970747] flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <h3 className="text-lg font-bold text-[#1C1D1F]">No Enrolled Courses Yet</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  You haven't enrolled in any paid masterclasses or registered for free passes. Browse our live interactive catalog to get started.
                </p>
                <Link to="/webinars" className="btn-primary py-2.5 px-6 text-xs font-bold inline-block rounded-xl">
                  Explore Live Webinars
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCourses.map(course => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    activeMenuCourseId={activeMenuCourseId}
                    setActiveMenuCourseId={setActiveMenuCourseId}
                    onToggleArchive={handleToggleArchive}
                    onToggleMyList={handleToggleMyList}
                    onViewCertificate={handleViewCertificate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* C. MY LISTS TAB */}
        {activeTab === 'my-lists' && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#1C1D1F]">My Lists</h2>
              <p className="text-xs text-[#52525B]">Organize and bookmark courses you are focusing on right now.</p>
            </div>

            {myListCourses.length === 0 ? (
              <div className="bg-white border border-[#F1D3DE] rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs space-y-3">
                <Bookmark className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="text-sm font-bold text-[#1C1D1F]">Your list is currently empty</h3>
                <p className="text-xs text-[#52525B]">
                  Click the three-dot menu (<MoreVertical className="w-3.5 h-3.5 inline" />) on any course card to add it to My Lists.
                </p>
                <button onClick={() => setActiveTab('all')} className="btn-primary py-2 px-4 text-xs font-bold rounded-xl mt-2">
                  View All Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListCourses.map(course => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    activeMenuCourseId={activeMenuCourseId}
                    setActiveMenuCourseId={setActiveMenuCourseId}
                    onToggleArchive={handleToggleArchive}
                    onToggleMyList={handleToggleMyList}
                    onViewCertificate={handleViewCertificate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* D. WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#1C1D1F]">Saved Wishlist ({wishlist?.length || 0})</h2>
              <p className="text-xs text-[#52525B]">Masterclasses you saved to purchase or attend later.</p>
            </div>

            {(!wishlist || wishlist.length === 0) ? (
              <div className="bg-white border border-[#F1D3DE] rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs space-y-3">
                <Heart className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="text-sm font-bold text-[#1C1D1F]">No masterclasses in wishlist</h3>
                <p className="text-xs text-[#52525B]">
                  Click the heart icon on any masterclass card in the catalog to save it here.
                </p>
                <Link to="/webinars" className="btn-primary py-2 px-4 text-xs font-bold rounded-xl inline-block mt-2">
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(item => (
                  <div key={item.id || item.slug} className="bg-white border border-[#F1D3DE] rounded-2xl overflow-hidden hover:shadow-md transition-all">
                    <img src={item.posterImage || item.thumbnail} alt={item.title} className="w-full aspect-video object-cover" />
                    <div className="p-4 space-y-3">
                      <h4 className="font-bold text-sm text-[#1C1D1F] line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-[#52525B]">{item.speaker?.name || 'Instructor'}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F1D3DE]">
                        <span className="font-black text-sm text-[#1C1D1F]">
                          {item.price === 0 ? 'Free Pass' : `₹${item.price}.00`}
                        </span>
                        <Link to={`/webinars/${item.slug || item.id}?register=true`} className="btn-primary py-1.5 px-3 text-xs font-bold rounded-lg">
                          Enroll Pass
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* E. CERTIFICATIONS TAB */}
        {activeTab === 'certificates' && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#1C1D1F]">Certifications & Completed Credentials</h2>
              <p className="text-xs text-[#52525B]">Official verifiable certificates earned upon 100% completion of course curriculum.</p>
            </div>

            {completedCourses.length === 0 ? (
              <div className="bg-white border border-[#F1D3DE] rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs space-y-3">
                <Award className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-sm font-bold text-[#1C1D1F]">No certificates unlocked yet</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Certificates are automatically issued once all trackable lectures in a masterclass are marked 100% completed.
                </p>
                <button onClick={() => setActiveTab('all')} className="btn-primary py-2 px-4 text-xs font-bold rounded-xl mt-2">
                  Continue Learning
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map(course => (
                  <div key={course.courseId} className="bg-white border border-emerald-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-6 h-6 text-amber-300" />
                        <span className="font-extrabold text-xs tracking-wider uppercase">Accredited Certificate</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">100% DONE</span>
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="font-bold text-sm text-[#1C1D1F] line-clamp-2">{course.title}</h4>
                      <p className="text-xs text-[#52525B]">Instructor: <strong>{course.instructor.name}</strong></p>
                      <p className="text-[11px] text-zinc-400">Total duration: {course.duration}</p>

                      <button
                        onClick={() => handleViewCertificate(course.courseId)}
                        className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-amber-300" />
                        <span>View & Download Certificate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* F. ARCHIVED TAB (Screenshot 1 & 5) */}
        {activeTab === 'archived' && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#1C1D1F]">Archived Masterclasses ({archivedCourses.length})</h2>
              <p className="text-xs text-[#52525B]">Courses you have archived from your primary view.</p>
            </div>

            {archivedCourses.length === 0 ? (
              <div className="bg-white border border-[#F1D3DE] rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs space-y-3">
                <Archive className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="text-sm font-bold text-[#1C1D1F]">No archived masterclasses</h3>
                <p className="text-xs text-[#52525B]">
                  You can archive completed or parked courses at any time without losing any progress or notes.
                </p>
                <button onClick={() => setActiveTab('all')} className="btn-primary py-2 px-4 text-xs font-bold rounded-xl mt-2">
                  View All Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedCourses.map(course => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    activeMenuCourseId={activeMenuCourseId}
                    setActiveMenuCourseId={setActiveMenuCourseId}
                    onToggleArchive={handleToggleArchive}
                    onToggleMyList={handleToggleMyList}
                    onViewCertificate={handleViewCertificate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* G. LEARNING TOOLS TAB (Screenshot 1 & 3) */}
        {activeTab === 'tools' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white border border-[#F1D3DE] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5F7] text-[#970747] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C1D1F]">Learning Reminders</h3>
                  <p className="text-xs text-[#52525B]">Build a daily habit with automated calendar and email nudges.</p>
                </div>
              </div>

              <div className="border-t border-[#F1D3DE] pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="emailReminders" defaultChecked className="accent-[#970747]" />
                  <label htmlFor="emailReminders" className="text-xs font-semibold text-[#1C1D1F]">
                    Send daily learning reminder emails and milestone updates to <strong>{user?.email}</strong>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* H. RECEIPTS & INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#1C1D1F]">Verified Passes & Payment Invoices</h3>
                <p className="text-xs text-[#52525B]">Official invoices and scannable QR admission passes.</p>
              </div>
            </div>

            {registrations.length === 0 ? (
              <div className="bg-white border border-[#F1D3DE] rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
                <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs text-[#52525B]">No registration transactions found.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#F1D3DE] rounded-2xl overflow-hidden shadow-xs">
                <div className="divide-y divide-[#F1D3DE]">
                  {registrations.map(reg => (
                    <div key={reg.registrationId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#1C1D1F]">{reg.invoiceNumber || reg.registrationId}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            reg.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {reg.paymentStatus?.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#1C1D1F] mt-1">{reg.webinarTitle}</h4>
                        <p className="text-xs text-[#52525B]">Amount: ₹{reg.amount}.00 • Ticket: {reg.ticketType}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActivePassId(reg.registrationId)}
                          className="px-3 py-1.5 rounded-xl border border-[#F1D3DE] text-xs font-bold text-[#970747] hover:bg-[#FAF5F7] flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Pass</span>
                        </button>

                        <button
                          onClick={() => setInvoiceToPrint(reg)}
                          className="btn-primary py-1.5 px-3 text-xs font-bold rounded-xl flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* I. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white border border-[#F1D3DE] rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-base text-[#1C1D1F]">Student Account Profile</h3>
              <p className="text-xs text-[#52525B]">Manage your name, notifications, and accredited credentials info.</p>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile preferences updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1C1D1F] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EBDDE4] rounded-xl text-xs focus:outline-none focus:border-[#970747]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1D1F] block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-zinc-100 border border-[#EBDDE4] rounded-xl text-xs text-zinc-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1D1F] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EBDDE4] rounded-xl text-xs focus:outline-none focus:border-[#970747]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1D1F] block mb-1">Headline / Role</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 border border-[#EBDDE4] rounded-xl text-xs focus:outline-none focus:border-[#970747]"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary py-2 px-6 text-xs font-bold rounded-xl shadow-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* 3. Verified QR Pass Modal */}
      {activePassId && (
        <SuccessReceiptModal
          registrationId={activePassId}
          isOpen={!!activePassId}
          onClose={() => setActivePassId(null)}
        />
      )}

      {/* 4. Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border-4 border-[#970747]/20">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>
              
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#970747] block">
                  Certificate of Completion
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-heading text-[#1C1D1F] mt-1">
                  {selectedCertificate.courseTitle}
                </h3>
              </div>

              <p className="text-xs text-[#52525B]">
                This certifies that <strong className="text-[#1C1D1F]">{selectedCertificate.studentName}</strong> has successfully completed all trackable live lectures, architecture teardowns, and curriculum requirements.
              </p>

              <div className="bg-[#FAF5F7] p-4 rounded-xl border border-[#F1D3DE] flex items-center justify-between text-xs text-[#52525B] max-w-md mx-auto">
                <div>
                  <span className="font-bold text-[#1C1D1F] block">{selectedCertificate.instructorName}</span>
                  <span className="text-[10px]">{selectedCertificate.instructorRole}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-zinc-500 block">{selectedCertificate.certificateId}</span>
                  <span className="text-emerald-700 font-bold text-[11px]">✓ Digitally Verified</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Print & Download Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Printable Invoice Modal */}
      {invoiceToPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-[#F1D3DE] pb-4">
              <div>
                <h3 className="font-black text-lg text-[#1C1D1F]">Official Tax Invoice</h3>
                <p className="text-xs text-[#52525B]">{invoiceToPrint.invoiceNumber || invoiceToPrint.registrationId}</p>
              </div>
              <button onClick={() => setInvoiceToPrint(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Masterclass Item:</span>
                <strong className="text-[#1C1D1F]">{invoiceToPrint.webinarTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Attendee:</span>
                <span>{invoiceToPrint.fullName} ({invoiceToPrint.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pass Type:</span>
                <span>{invoiceToPrint.ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Status:</span>
                <span className="text-emerald-700 font-bold">{invoiceToPrint.paymentStatus?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-t border-[#F1D3DE] pt-3 text-sm font-black">
                <span>Total Amount Paid:</span>
                <span>₹{invoiceToPrint.amount}.00</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F1D3DE]">
              <button onClick={() => window.print()} className="btn-primary py-2 px-4 text-xs font-bold rounded-xl">
                Print Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Reusable Course Card component matching Screenshot 1 & 5
 */
function CourseCard({
  course,
  activeMenuCourseId,
  setActiveMenuCourseId,
  onToggleArchive,
  onToggleMyList,
  onViewCertificate
}) {
  const isCompleted = course.progress.completionPercentage === 100;
  const isMenuOpen = activeMenuCourseId === course.courseId;

  return (
    <div className="bg-white border border-[#F1D3DE] rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      
      {/* Thumbnail + 3-Dot Dropdown Menu */}
      <div className="relative aspect-video bg-black overflow-hidden">
        <Link to={`/course/${course.courseId}/learn`} className="block w-full h-full">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
            loading="lazy"
          />
        </Link>

        {/* Big Center Play Icon Hover */}
        <Link
          to={`/course/${course.courseId}/learn`}
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 hover:bg-[#970747] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs z-10"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </Link>

        {/* Three-Dot Menu Button (Screenshot 1 & 5) */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveMenuCourseId(isMenuOpen ? null : course.courseId);
            }}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 shadow-md flex items-center justify-center cursor-pointer transition-all"
            title="Course Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Options */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#F1D3DE] rounded-xl shadow-xl py-1 z-30 text-xs">
              <Link
                to={`/course/${course.courseId}/learn`}
                className="w-full px-3 py-2 text-left hover:bg-[#FAF5F7] flex items-center gap-2 text-[#1C1D1F] font-semibold"
              >
                <Play className="w-3.5 h-3.5 text-[#970747]" />
                <span>Resume Lesson</span>
              </Link>

              <button
                onClick={() => onToggleMyList(course.courseId, course.progress.isInMyList)}
                className="w-full px-3 py-2 text-left hover:bg-[#FAF5F7] flex items-center gap-2 text-[#1C1D1F] font-semibold cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-zinc-500" />
                <span>{course.progress.isInMyList ? 'Remove from My List' : 'Add to My List'}</span>
              </button>

              <button
                onClick={() => onToggleArchive(course.courseId, course.progress.isArchived)}
                className="w-full px-3 py-2 text-left hover:bg-[#FAF5F7] flex items-center gap-2 text-[#1C1D1F] font-semibold cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 text-zinc-500" />
                <span>{course.progress.isArchived ? 'Unarchive Course' : 'Archive Course'}</span>
              </button>

              {isCompleted && (
                <button
                  onClick={() => onViewCertificate(course.courseId)}
                  className="w-full px-3 py-2 text-left hover:bg-[#FAF5F7] flex items-center gap-2 text-emerald-700 font-semibold cursor-pointer border-t border-[#F1D3DE]"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Certificate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          <Link to={`/course/${course.courseId}/learn`} className="hover:text-[#970747] transition-colors">
            <h3 className="font-heading font-black text-[#1C1D1F] text-sm leading-snug line-clamp-2">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-[#52525B] mt-1 font-medium">{course.instructor.name}</p>
        </div>

        {/* Progress Section (Screenshot 1 & 5) */}
        <div className="space-y-1.5 pt-2 border-t border-[#F1D3DE]">
          
          {/* Progress Bar (Purple) */}
          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#970747] to-[#C71F6E] h-full transition-all duration-300"
              style={{ width: `${course.progress.completionPercentage}%` }}
            />
          </div>

          {/* Progress Label & Lesson Counts */}
          <div className="flex items-center justify-between text-[11px] text-[#52525B]">
            <span className="font-bold text-[#1C1D1F]">
              {course.progress.completionPercentage}% complete
            </span>
            <span>
              {course.progress.completedLessonCount} / {course.progress.totalTrackableLessonCount} lectures
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
            <span>{course.progress.passedQuizzesCount || 0} / {course.progress.totalSectionsCount || 3} Quizzes Passed</span>
            {isCompleted ? (
              <span className="bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded text-[10px]">
                Completed
              </span>
            ) : null}
          </div>

          {/* Action Buttons: Continue Learning + Certificate/Invoice */}
          <div className="space-y-1.5 pt-2">
            <Link
              to={`/course/${course.courseId}/learn`}
              className="w-full btn-primary py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{course.progress.completionPercentage > 0 ? 'Continue Learning' : 'Start Course'}</span>
            </Link>

            {isCompleted && (
              <a
                href={`/api/learning/certificate/${course.courseId}/download`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Download Certificate (PDF)</span>
              </a>
            )}

            {course.invoiceAvailable && (
              <a
                href={`/api/learning/invoice/${course.courseId}/download`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1 px-3 text-center text-[10px] font-semibold text-zinc-500 hover:text-[#970747] transition-colors flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Download Tax Invoice (PDF)</span>
              </a>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
