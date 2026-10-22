import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  BarChart3, 
  Users, 
  Video, 
  DollarSign, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Sparkles,
  Layers,
  Settings,
  Link as LinkIcon
} from 'lucide-react';

export default function AdminDashboard({ isOpen, onClose, onWebinarsUpdated }) {
  const { token } = useAuth();
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('overview'); // overview | webinars | attendees | notifications | promo
  const [stats, setStats] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [webinarsList, setWebinarsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAttendee, setSearchAttendee] = useState('');
  
  // New webinar form state
  const [showAddWebinar, setShowAddWebinar] = useState(false);
  const [newWebinar, setNewWebinar] = useState({
    title: '',
    category: 'AI & Machine Learning',
    date: 'Saturday, Dec 5, 2026',
    time: '6:00 PM IST',
    duration: '90 Mins',
    price: 499,
    originalPrice: 1999,
    seatsAvailable: 50,
    speakerName: '',
    speakerRole: '',
    speakerCompany: '',
    description: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [statsRes, attendeesRes, webinarsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }).then(r => r.json()),
        fetch('/api/admin/registrations', { headers }).then(r => r.json()),
        fetch('/api/webinars', { headers }).then(r => r.json())
      ]);

      if (statsRes && statsRes.success) setStats(statsRes.data);
      if (attendeesRes && attendeesRes.success) setAttendees(attendeesRes.data);
      if (webinarsRes && webinarsRes.success) setWebinarsList(webinarsRes.data);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleAddWebinarSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newWebinar.title,
        category: newWebinar.category,
        tagline: newWebinar.description.substring(0, 90),
        speaker: {
          name: newWebinar.speakerName,
          role: newWebinar.speakerRole,
          company: newWebinar.speakerCompany,
          bio: 'Seasoned industry leader and domain speaker.',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        },
        date: newWebinar.date,
        time: newWebinar.time,
        duration: newWebinar.duration,
        price: Number(newWebinar.price),
        originalPrice: Number(newWebinar.originalPrice),
        seatsAvailable: Number(newWebinar.seatsAvailable),
        maxSeats: 150,
        isFeatured: false,
        posterImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        outcomes: ['Practical architectural teardown', 'Live question & answer workshop'],
        description: newWebinar.description
      };

      const res = await fetch('/api/webinars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddWebinar(false);
        loadData();
        onWebinarsUpdated && onWebinarsUpdated();
      }
    } catch (e) {
      alert('Error creating webinar');
    }
  };

  const handleDeleteWebinar = async (id) => {
    if (!window.confirm('Are you sure you want to remove this webinar?')) return;
    try {
      await fetch(`/api/webinars/${id}`, { 
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      loadData();
      onWebinarsUpdated && onWebinarsUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAttendees = attendees.filter(a => {
    if (!searchAttendee) return true;
    const q = searchAttendee.toLowerCase();
    return (
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.registrationId?.toLowerCase().includes(q) ||
      a.webinarTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-[#EBDDE4] flex flex-col h-[90vh] overflow-hidden">
        
        {/* Top Navigation Bar */}
        <div className="bg-[#970747] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#970747] font-black flex items-center justify-center">
              K
            </div>
            <div>
              <h2 className="font-heading font-black text-lg text-white leading-tight">
                Kaira Administrator Dashboard
              </h2>
              <p className="text-[11px] text-[#F3A6C4]">
                Webinar Operations, Revenue & Attendee Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="bg-[#FDF5F8] px-6 py-2.5 border-b border-[#EBDDE4] flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Overview & Revenue', icon: BarChart3 },
            { id: 'attendees', label: 'Attendees & Passes', icon: Users },
            { id: 'webinars', label: 'Webinar Catalog', icon: Video },
            { id: 'notifications', label: 'Email Notification Workflows', icon: Mail },
            { id: 'promo', label: 'Promotional Video', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#970747] text-white shadow-xs'
                    : 'text-[#66545D] hover:bg-[#F7DCE8] hover:text-[#970747]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-6 flex-1 overflow-y-auto text-left bg-white">
          
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-[#F7DCE8] border-t-[#970747] animate-spin mx-auto" />
              <p className="text-xs text-[#66545D]">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & REVENUE */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top 4 KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="p-5 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] space-y-2">
                      <div className="flex items-center justify-between text-[#66545D]">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                        <div className="w-8 h-8 rounded-lg bg-[#F7DCE8] text-[#970747] flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="font-heading font-black text-2xl text-[#970747]">
                        ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
                      </p>
                      <p className="text-[11px] text-[#5f259f] font-semibold">
                        PhonePe PG v2 verified
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] space-y-2">
                      <div className="flex items-center justify-between text-[#66545D]">
                        <span className="text-xs font-bold uppercase tracking-wider">Confirmed Passes</span>
                        <div className="w-8 h-8 rounded-lg bg-[#F7DCE8] text-[#970747] flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="font-heading font-black text-2xl text-[#25171E]">
                        {stats?.confirmedAttendees || 0}
                      </p>
                      <p className="text-[11px] text-[#66545D]">
                        {stats?.paidAttendees || 0} VIP / {stats?.freeAttendees || 0} Free
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] space-y-2">
                      <div className="flex items-center justify-between text-[#66545D]">
                        <span className="text-xs font-bold uppercase tracking-wider">Active Webinars</span>
                        <div className="w-8 h-8 rounded-lg bg-[#F7DCE8] text-[#970747] flex items-center justify-center">
                          <Video className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="font-heading font-black text-2xl text-[#25171E]">
                        {stats?.totalWebinars || 0}
                      </p>
                      <p className="text-[11px] text-[#66545D]">
                        Across 4 primary domains
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] space-y-2">
                      <div className="flex items-center justify-between text-[#66545D]">
                        <span className="text-xs font-bold uppercase tracking-wider">Delivery Rate</span>
                        <div className="w-8 h-8 rounded-lg bg-[#F7DCE8] text-[#970747] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="font-heading font-black text-2xl text-emerald-600">
                        100%
                      </p>
                      <p className="text-[11px] text-[#66545D]">
                        Automated SMTP email synced
                      </p>
                    </div>

                  </div>

                  {/* Category Breakdown & Recent Orders */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Category Breakdown */}
                    <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#EBDDE4] space-y-4">
                      <h4 className="font-heading font-bold text-base text-[#25171E]">
                        Webinar Distribution by Category
                      </h4>
                      <div className="space-y-3">
                        {stats?.categoryDistribution && Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-[#25171E]">
                              <span>{cat}</span>
                              <span className="text-[#970747]">{count} sessions</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#F7DCE8]">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-[#970747] to-[#D63384]"
                                style={{ width: `${Math.min(100, count * 25)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent 5 Registrations */}
                    <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#EBDDE4] space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-bold text-base text-[#25171E]">
                          Recent Registrations
                        </h4>
                        <button
                          onClick={() => setActiveTab('attendees')}
                          className="text-xs font-bold text-[#970747] hover:underline"
                        >
                          View All
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#EBDDE4] text-[#66545D]">
                              <th className="pb-2">Pass ID</th>
                              <th className="pb-2">Attendee</th>
                              <th className="pb-2">Tier</th>
                              <th className="pb-2">Amount</th>
                              <th className="pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#FDF5F8]">
                            {attendees.slice(0, 5).map((r) => (
                              <tr key={r.registrationId} className="hover:bg-[#FDF5F8]">
                                <td className="py-2.5 font-mono font-bold text-[#970747]">{r.registrationId}</td>
                                <td className="py-2.5 font-medium text-[#25171E]">{r.fullName}</td>
                                <td className="py-2.5 text-[#66545D]">{r.ticketType}</td>
                                <td className="py-2.5 font-bold text-[#25171E]">₹{r.amount}</td>
                                <td className="py-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                    {r.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ATTENDEES & PASSES */}
              {activeTab === 'attendees' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-[#970747] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchAttendee}
                        onChange={(e) => setSearchAttendee(e.target.value)}
                        placeholder="Search attendee by name, email or pass ID..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EBDDE4] text-xs focus:outline-none focus:border-[#970747]"
                      />
                    </div>

                    <a
                      href="/api/admin/export-attendees"
                      download="kaira_webinar_attendees.csv"
                      className="btn-secondary px-5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#970747]" />
                      <span>Export Roster CSV</span>
                    </a>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#EBDDE4]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FDF5F8] text-[#25171E] border-b border-[#EBDDE4]">
                        <tr>
                          <th className="p-3">Pass ID</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Contact</th>
                          <th className="p-3">Webinar Title</th>
                          <th className="p-3">Ticket</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Email Confirmed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBDDE4]">
                        {filteredAttendees.map((a) => (
                          <tr key={a.registrationId} className="hover:bg-[#FDF5F8]/50">
                            <td className="p-3 font-mono font-bold text-[#970747]">{a.registrationId}</td>
                            <td className="p-3 font-semibold text-[#25171E]">{a.fullName}</td>
                            <td className="p-3 text-[#66545D]">
                              <div>{a.email}</div>
                              <div className="text-[10px] text-[#970747]">+91 {a.phone}</div>
                            </td>
                            <td className="p-3 max-w-xs truncate text-[#25171E]">{a.webinarTitle}</td>
                            <td className="p-3">{a.ticketType}</td>
                            <td className="p-3 font-bold text-[#25171E]">₹{a.amount}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {a.paymentStatus}
                              </span>
                            </td>
                            <td className="p-3">
                              {a.isEmailVerified !== false ? (
                                <span className="text-emerald-600 font-bold">YES</span>
                              ) : (
                                <span className="text-slate-400">PENDING</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: WEBINARS MANAGEMENT */}
              {activeTab === 'webinars' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-black text-xl text-[#25171E]">
                      Webinar Catalog ({webinarsList.length})
                    </h3>
                    <button
                      onClick={() => setShowAddWebinar(!showAddWebinar)}
                      className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddWebinar ? 'Cancel' : 'Add New Webinar'}</span>
                    </button>
                  </div>

                  {/* Add Webinar Form Drawer */}
                  {showAddWebinar && (
                    <form onSubmit={handleAddWebinarSubmit} className="p-6 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] space-y-4">
                      <h4 className="font-heading font-bold text-base text-[#970747]">
                        Create New Masterclass
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Webinar Title *</label>
                          <input
                            type="text"
                            required
                            value={newWebinar.title}
                            onChange={(e) => setNewWebinar({ ...newWebinar, title: e.target.value })}
                            placeholder="e.g. Next.js 15 & Server Actions"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">Category *</label>
                          <select
                            value={newWebinar.category}
                            onChange={(e) => setNewWebinar({ ...newWebinar, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          >
                            <option>AI & Machine Learning</option>
                            <option>Web Development</option>
                            <option>Cloud & DevOps</option>
                            <option>Business & Marketing</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Speaker Name *</label>
                          <input
                            type="text"
                            required
                            value={newWebinar.speakerName}
                            onChange={(e) => setNewWebinar({ ...newWebinar, speakerName: e.target.value })}
                            placeholder="e.g. Anand Sharma"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Speaker Role *</label>
                          <input
                            type="text"
                            required
                            value={newWebinar.speakerRole}
                            onChange={(e) => setNewWebinar({ ...newWebinar, speakerRole: e.target.value })}
                            placeholder="e.g. Principal Architect"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Company *</label>
                          <input
                            type="text"
                            required
                            value={newWebinar.speakerCompany}
                            onChange={(e) => setNewWebinar({ ...newWebinar, speakerCompany: e.target.value })}
                            placeholder="e.g. Vercel"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Date</label>
                          <input
                            type="text"
                            value={newWebinar.date}
                            onChange={(e) => setNewWebinar({ ...newWebinar, date: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={newWebinar.price}
                            onChange={(e) => setNewWebinar({ ...newWebinar, price: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Seats Available</label>
                          <input
                            type="number"
                            value={newWebinar.seatsAvailable}
                            onChange={(e) => setNewWebinar({ ...newWebinar, seatsAvailable: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Duration</label>
                          <input
                            type="text"
                            value={newWebinar.duration}
                            onChange={(e) => setNewWebinar({ ...newWebinar, duration: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Description & Curriculum</label>
                        <textarea
                          rows={3}
                          value={newWebinar.description}
                          onChange={(e) => setNewWebinar({ ...newWebinar, description: e.target.value })}
                          placeholder="Detailed workshop description..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-primary px-6 py-2.5 text-xs font-bold cursor-pointer"
                      >
                        Publish Webinar
                      </button>
                    </form>
                  )}

                  {/* Webinars Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {webinarsList.map((w) => (
                      <div key={w.id} className="p-4 rounded-2xl border border-[#EBDDE4] bg-white flex items-center justify-between gap-4">
                        <div className="space-y-1 text-left flex-1">
                          <span className="text-[10px] font-bold text-[#970747] uppercase">{w.category}</span>
                          <h4 className="font-heading font-bold text-sm text-[#25171E] line-clamp-1">{w.title}</h4>
                          <p className="text-xs text-[#66545D]">Speaker: {w.speaker.name} • {w.date}</p>
                          <p className="text-xs font-bold text-[#970747]">₹{w.price} ({w.seatsAvailable} spots)</p>
                        </div>
                        <button
                          onClick={() => handleDeleteWebinar(w.id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Webinar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: EMAIL NOTIFICATION WORKFLOWS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] space-y-3">
                    <div className="flex items-center gap-2 text-[#970747]">
                      <Mail className="w-5 h-5" />
                      <h4 className="font-heading font-bold text-base text-[#25171E]">
                        SMTP Transactional Email Gateway
                      </h4>
                    </div>
                    <p className="text-xs text-[#66545D]">
                      Active Providers: <code className="font-mono bg-white px-2 py-0.5 rounded border border-[#EBDDE4]">Gmail SMTP / Nodemailer</code> (Port 465 SSL)
                    </p>
                    <p className="text-xs text-[#66545D]">
                      Handles user registration OTPs, ticket delivery with QR pass IDs, and automated PDF tax invoices upon PhonePe payment completion.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] space-y-3">
                    <div className="flex items-center gap-2 text-[#970747]">
                      <Mail className="w-5 h-5" />
                      <h4 className="font-heading font-bold text-base text-[#25171E]">
                        Automated Confirmation Email Preview
                      </h4>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#EBDDE4] space-y-2 max-w-xl text-xs">
                      <p><strong>Subject:</strong> Confirmed: Your Kaira Webinar Hub Access Pass for {`{{webinarTitle}}`}</p>
                      <p className="text-[#66545D] leading-relaxed">
                        Hi {`{{fullName}}`},<br/><br/>
                        Your registration has been confirmed! Access your virtual seat using your secure link below:<br/><br/>
                        Joining Link: {`{{joiningLink}}`}<br/>
                        Registration ID: {`{{registrationId}}`}<br/><br/>
                        Warm regards,<br/>
                        Kaira Webinar Hub Team
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PROMOTIONAL VIDEO */}
              {activeTab === 'promo' && (
                <div className="space-y-4 max-w-2xl">
                  <h3 className="font-heading font-black text-xl text-[#25171E]">
                    Promotional Video Configuration
                  </h3>
                  <p className="text-xs text-[#66545D]">
                    Configure externally generated AI promotional walkthroughs or keynote teasers.
                  </p>
                  <div className="space-y-3 p-6 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4]">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Video Stream URL</label>
                      <input
                        type="text"
                        readOnly
                        value="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Poster Image URL</label>
                      <input
                        type="text"
                        readOnly
                        value="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#EBDDE4] text-xs font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-[#970747] font-semibold">
                      ✓ Audio autoplay disabled by policy. HD 1080p stream active.
                    </p>
                  </div>
                </div>
              )}

            </>
          )}

        </div>

      </div>
    </div>
  );
}
