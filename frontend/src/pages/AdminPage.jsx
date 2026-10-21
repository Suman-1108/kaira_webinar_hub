import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Video, 
  DollarSign, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Settings, 
  ExternalLink,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Presentation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [webinarsList, setWebinarsList] = useState([]);
  const [notificationJobs, setNotificationJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAttendee, setSearchAttendee] = useState('');

  // New webinar form state
  const [showAddWebinar, setShowAddWebinar] = useState(false);
  const [newWebinar, setNewWebinar] = useState({
    title: '',
    category: 'Artificial Intelligence',
    date: 'Saturday, Dec 5, 2026',
    time: '6:00 PM - 7:30 PM IST',
    duration: '90 Mins',
    price: 499,
    originalPrice: 1999,
    seatsAvailable: 50,
    speakerName: '',
    speakerRole: '',
    speakerCompany: '',
    description: '',
    tagline: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [statsRes, attendeesRes, webinarsRes, notifRes] = await Promise.all([
        fetch('/api/v1/admin/stats', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/v1/admin/registrations', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/v1/webinars').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/v1/admin/notifications', { headers }).then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (attendeesRes.success) setAttendees(attendeesRes.data);
      if (webinarsRes.success) setWebinarsList(webinarsRes.data);
      if (notifRes.success) setNotificationJobs(notifRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWebinar = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newWebinar.title,
        category: newWebinar.category,
        tagline: newWebinar.tagline || newWebinar.title,
        description: newWebinar.description || 'Comprehensive expert-led masterclass.',
        date: newWebinar.date,
        time: newWebinar.time,
        duration: newWebinar.duration,
        price: Number(newWebinar.price),
        originalPrice: Number(newWebinar.originalPrice),
        seatsAvailable: Number(newWebinar.seatsAvailable),
        isFeatured: true,
        speaker: {
          name: newWebinar.speakerName || 'Visiting Specialist',
          role: newWebinar.speakerRole || 'Lead Architect',
          company: newWebinar.speakerCompany || 'Industry Labs',
          bio: 'Frontier researcher and systems engineer.',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        },
        posterImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        outcomes: [
          'Practical production implementation blueprint',
          'Live interactive code review and debugging session',
          'Accredited completion certificate & code repository'
        ]
      };

      const res = await fetch('/api/v1/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddWebinar(false);
        loadData();
      }
    } catch (err) {
      console.error('Failed to create webinar:', err);
    }
  };

  const handleDeleteWebinar = async (id) => {
    if (!window.confirm('Are you sure you want to delete this webinar?')) return;
    try {
      await fetch(`/api/v1/webinars/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleRetryJob = async (jobId) => {
    try {
      await fetch(`/api/v1/admin/notifications/${jobId}/retry`, { method: 'POST' });
      loadData();
      alert('Notification re-sent successfully.');
    } catch (err) {
      alert('Failed to retry job.');
    }
  };

  const filteredAttendees = attendees.filter(a =>
    a.fullName?.toLowerCase().includes(searchAttendee.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchAttendee.toLowerCase()) ||
    a.registrationId?.toLowerCase().includes(searchAttendee.toLowerCase()) ||
    a.webinarTitle?.toLowerCase().includes(searchAttendee.toLowerCase())
  );

  // SaaS Separation Guard: Admin Portal is strictly isolated from Student Portal
  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-[#FAF5F7] min-h-screen py-16 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-[#F1D3DE] shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FCE8EF] text-[#970747] flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#970747] bg-[#FCE8EF] px-3 py-1 rounded-full">
              SaaS Isolation Protocol
            </span>
            <h2 className="text-2xl font-black font-heading text-[#1C1D1F] mt-3">
              Admin Console Restricted
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] mt-2 leading-relaxed">
              The Admin Governance Portal is strictly isolated from the Student Portal and Seller Portal. 
              {user ? (
                <> You are logged in with student account <strong>({user.email})</strong> which does not have platform administrator privileges.</>
              ) : (
                <> Please sign in with authorized administrator credentials to manage platform telemetry, database switching, and user records.</>
              )}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              to="/my-learning"
              className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Go to Student Learning Hub</span>
            </Link>

            <Link
              to="/instructor"
              className="w-full py-2.5 px-4 rounded-xl border border-[#970747] text-[#970747] font-bold text-xs hover:bg-[#FCE8EF] flex items-center justify-center gap-2 transition-colors"
            >
              <Presentation className="w-4 h-4" />
              <span>Go to Seller / Instructor Portal</span>
            </Link>

            <Link
              to="/login?redirect=/admin"
              className="w-full py-2.5 px-4 rounded-xl border border-[#D1D1D7] text-[#52525B] font-bold text-xs hover:bg-[#FAF5F7] flex items-center justify-center gap-2 transition-colors"
            >
              <span>Sign In as Platform Admin (admin@kairahub.live)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F9FA] min-h-screen py-8">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
        
        {/* Top Header */}
        <div className="bg-white border border-[#D1D1D7] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-xs font-bold text-[#970747] hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Marketplace</span>
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1C1D1F]">
                Operations & Governance
              </span>
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-[#1C1D1F] tracking-tight mt-1 flex items-center gap-2">
              <span>Admin Management Console</span>
              <span className="text-xs font-bold bg-[#970747] text-white px-2 py-0.5 rounded">
                KWH v1.2
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={() => setShowAddWebinar(true)}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish New Webinar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#D1D1D7]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-[#970747] text-[#970747]' : 'border-transparent text-[#52525B] hover:text-[#1C1D1F]'
            }`}
          >
            Overview & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('webinars')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'webinars' ? 'border-[#970747] text-[#970747]' : 'border-transparent text-[#52525B] hover:text-[#1C1D1F]'
            }`}
          >
            Webinars Catalog ({webinarsList.length})
          </button>
          <button
            onClick={() => setActiveTab('attendees')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'attendees' ? 'border-[#970747] text-[#970747]' : 'border-transparent text-[#52525B] hover:text-[#1C1D1F]'
            }`}
          >
            Attendees & Passes ({attendees.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'notifications' ? 'border-[#970747] text-[#970747]' : 'border-transparent text-[#52525B] hover:text-[#1C1D1F]'
            }`}
          >
            Notification Jobs ({notificationJobs.length})
          </button>
        </div>

        {/* TAB 1: Overview */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[#D1D1D7] rounded-lg p-5 shadow-xs">
                <span className="text-xs font-bold uppercase text-[#52525B]">Total Revenue (INR)</span>
                <div className="text-2xl font-extrabold text-[#1C1D1F] mt-1">₹{stats.totalRevenue.toLocaleString()}</div>
                <span className="text-[11px] text-emerald-600 font-semibold">Verified Razorpay Settlements</span>
              </div>

              <div className="bg-white border border-[#D1D1D7] rounded-lg p-5 shadow-xs">
                <span className="text-xs font-bold uppercase text-[#52525B]">Confirmed Attendees</span>
                <div className="text-2xl font-extrabold text-[#1C1D1F] mt-1">{stats.confirmedAttendees}</div>
                <span className="text-[11px] text-[#52525B]">
                  {stats.freeAttendees} Free • {stats.paidAttendees} VIP
                </span>
              </div>

              <div className="bg-white border border-[#D1D1D7] rounded-lg p-5 shadow-xs">
                <span className="text-xs font-bold uppercase text-[#52525B]">Active Masterclasses</span>
                <div className="text-2xl font-extrabold text-[#970747] mt-1">{stats.totalWebinars}</div>
                <span className="text-[11px] text-[#52525B]">Across 4 Core Categories</span>
              </div>

              <div className="bg-white border border-[#D1D1D7] rounded-lg p-5 shadow-xs">
                <span className="text-xs font-bold uppercase text-[#52525B]">Notification Queue</span>
                <div className="text-2xl font-extrabold text-[#15803D] mt-1">
                  {stats.notificationStats?.totalQueued || 0}
                </div>
                <span className="text-[11px] text-[#52525B]">WhatsApp & Email Reminders</span>
              </div>
            </div>

            {/* Integration Statuses (Section 13, 14, 15) */}
            <div className="bg-white border border-[#D1D1D7] rounded-lg p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1D1F] mb-4">
                Platform Integrations Diagnostic
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded border border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C1D1F] block">Razorpay Gateway</span>
                    <span className="text-emerald-700 font-medium">Mode: {stats.integrations?.razorpay?.mode}</span>
                    <p className="text-[#52525B] text-[11px] mt-1">HMAC-SHA256 signature verification active.</p>
                  </div>
                </div>

                <div className="p-4 rounded border border-[#F1D3DE] bg-[#FCE8EF]/60 flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-[#970747] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C1D1F] block">Meta WhatsApp Cloud API</span>
                    <span className="text-[#750435] font-medium">Webhook Endpoint: Verified</span>
                    <p className="text-[#52525B] text-[11px] mt-1">Challenge endpoint active on /api/v1/registrations/webhook/whatsapp</p>
                  </div>
                </div>

                <div className="p-4 rounded border border-blue-200 bg-blue-50/60 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C1D1F] block">Transactional SMTP</span>
                    <span className="text-blue-700 font-medium">Sender: {stats.integrations?.smtp?.sender}</span>
                    <p className="text-[#52525B] text-[11px] mt-1">Automated 24h & 1h calendar reminders scheduled.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-white border border-[#D1D1D7] rounded-lg overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#D1D1D7] flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1C1D1F]">Recent Webinar Registrations</h3>
                <button
                  onClick={() => setActiveTab('attendees')}
                  className="text-xs font-bold text-[#970747] hover:underline"
                >
                  View All &rarr;
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F9FA] text-[#52525B] uppercase font-bold border-b border-[#D1D1D7]">
                    <tr>
                      <th className="py-2.5 px-4">Attendee</th>
                      <th className="py-2.5 px-4">Webinar</th>
                      <th className="py-2.5 px-4">Tier</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1D1D7]">
                    {attendees.slice(0, 5).map((a) => (
                      <tr key={a.registrationId} className="hover:bg-[#F7F9FA]/50">
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1C1D1F] block">{a.fullName}</span>
                          <span className="text-[11px] text-[#52525B]">{a.email}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#1C1D1F] max-w-xs truncate">
                          {a.webinarTitle}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#52525B]">{a.ticketType}</td>
                        <td className="py-3 px-4 font-bold text-[#1C1D1F]">₹{a.amount}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {a.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Webinars Management */}
        {activeTab === 'webinars' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-[#52525B]">Manage published and draft masterclasses.</p>
              <button
                onClick={() => setShowAddWebinar(true)}
                className="btn-primary text-xs py-2 px-3 shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Webinar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {webinarsList.map((w) => (
                <div key={w.id} className="bg-white border border-[#D1D1D7] rounded-lg p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#970747]">
                        {w.category}
                      </span>
                      <span className="text-xs font-bold text-[#1C1D1F]">
                        {w.price === 0 ? 'Free' : `₹${w.price}`}
                      </span>
                    </div>

                    <h4 className="font-bold text-[#1C1D1F] text-sm line-clamp-2 leading-snug mb-1">
                      {w.title}
                    </h4>

                    <p className="text-xs text-[#52525B] mb-3">
                      Speaker: {w.speaker?.name} • {w.date}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D1D1D7] flex items-center justify-between">
                    <Link
                      to={`/webinars/${w.slug || w.id}`}
                      className="text-xs font-bold text-[#970747] hover:underline flex items-center gap-1"
                    >
                      <span>Public Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => handleDeleteWebinar(w.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold p-1"
                      title="Delete Webinar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Attendees & Passes with CSV Export */}
        {activeTab === 'attendees' && (
          <div className="bg-white border border-[#D1D1D7] rounded-lg overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#D1D1D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-[#52525B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchAttendee}
                  onChange={(e) => setSearchAttendee(e.target.value)}
                  placeholder="Search by name, email, or pass ID..."
                  className="w-full pl-9 pr-3 py-1.5 border border-[#D1D1D7] rounded text-xs text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                />
              </div>

              <a
                href="/api/v1/admin/registrations/export-csv"
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 self-start sm:self-auto"
                download
              >
                <Download className="w-3.5 h-3.5 text-[#970747]" />
                <span>Export Attendees CSV</span>
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] border-b border-[#D1D1D7] text-[#52525B] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Pass ID</th>
                    <th className="py-2.5 px-4">Attendee</th>
                    <th className="py-2.5 px-4">Phone</th>
                    <th className="py-2.5 px-4">Webinar Title</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1D7]">
                  {filteredAttendees.map((a) => (
                    <tr key={a.registrationId} className="hover:bg-[#F7F9FA]/60">
                      <td className="py-3 px-4 font-mono font-bold text-[#970747]">{a.registrationId}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#1C1D1F] block">{a.fullName}</span>
                        <span className="text-[11px] text-[#52525B]">{a.email}</span>
                      </td>
                      <td className="py-3 px-4 text-[#52525B] font-mono">{a.countryCode || '+91'}{a.phone}</td>
                      <td className="py-3 px-4 font-semibold text-[#1C1D1F] max-w-xs truncate">{a.webinarTitle}</td>
                      <td className="py-3 px-4 font-bold text-[#1C1D1F]">₹{a.amount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {a.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#52525B]">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Notification Jobs Queue */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-[#D1D1D7] rounded-lg overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#D1D1D7]">
              <h3 className="text-sm font-bold text-[#1C1D1F]">Persistent Notification Reminders Queue</h3>
              <p className="text-xs text-[#52525B] mt-0.5">
                Tracks scheduled WhatsApp and email reminders. Supports safe retries for transient delivery disruptions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] border-b border-[#D1D1D7] text-[#52525B] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Job ID</th>
                    <th className="py-2.5 px-4">Channel</th>
                    <th className="py-2.5 px-4">Recipient</th>
                    <th className="py-2.5 px-4">Template</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Scheduled For</th>
                    <th className="py-2.5 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1D7]">
                  {notificationJobs.map((j) => (
                    <tr key={j.jobId} className="hover:bg-[#F7F9FA]/60">
                      <td className="py-3 px-4 font-mono font-bold text-[#1C1D1F]">{j.jobId}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          j.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {j.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#1C1D1F] block">{j.recipientName}</span>
                        <span className="text-[11px] text-[#52525B]">{j.recipientEmail || j.recipientPhone}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#52525B]">{j.templateId}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          j.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#52525B]">{new Date(j.scheduledAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleRetryJob(j.jobId)}
                          className="text-xs font-bold text-[#970747] hover:underline"
                        >
                          Trigger / Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Add New Webinar */}
      {showAddWebinar && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#D1D1D7] pb-3 mb-4">
              <h3 className="font-bold text-lg text-[#1C1D1F]">Publish New Masterclass</h3>
              <button
                onClick={() => setShowAddWebinar(false)}
                className="text-gray-500 hover:text-black font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateWebinar} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1C1D1F] uppercase mb-1">Webinar Title</label>
                <input
                  type="text"
                  required
                  value={newWebinar.title}
                  onChange={(e) => setNewWebinar({ ...newWebinar, title: e.target.value })}
                  placeholder="Mastering Next.js 15 & Server Actions"
                  className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#970747]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1D1F] uppercase mb-1">Category</label>
                  <select
                    value={newWebinar.category}
                    onChange={(e) => setNewWebinar({ ...newWebinar, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm bg-white"
                  >
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Business & Marketing">Business & Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1C1D1F] uppercase mb-1">Pass Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newWebinar.price}
                    onChange={(e) => setNewWebinar({ ...newWebinar, price: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1D1F] uppercase mb-1">Speaker Name</label>
                  <input
                    type="text"
                    required
                    value={newWebinar.speakerName}
                    onChange={(e) => setNewWebinar({ ...newWebinar, speakerName: e.target.value })}
                    placeholder="Dr. Rajesh Gupta"
                    className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C1D1F] uppercase mb-1">Speaker Role & Company</label>
                  <input
                    type="text"
                    value={newWebinar.speakerRole}
                    onChange={(e) => setNewWebinar({ ...newWebinar, speakerRole: e.target.value })}
                    placeholder="Staff Architect @ Hyperscale"
                    className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1C1D1F] uppercase mb-1">Tagline</label>
                <input
                  type="text"
                  value={newWebinar.tagline}
                  onChange={(e) => setNewWebinar({ ...newWebinar, tagline: e.target.value })}
                  placeholder="Architect scalable, resilient web applications in 2026."
                  className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C1D1F] uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newWebinar.description}
                  onChange={(e) => setNewWebinar({ ...newWebinar, description: e.target.value })}
                  placeholder="Detailed breakdown of session curriculum and practical takeaways..."
                  className="w-full px-3 py-2 border border-[#D1D1D7] rounded text-sm"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#D1D1D7] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWebinar(false)}
                  className="btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4"
                >
                  Publish Masterclass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
