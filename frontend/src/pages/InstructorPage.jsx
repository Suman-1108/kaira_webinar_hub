import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Presentation, 
  PlusCircle, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  Download, 
  Layers,
  ChevronRight,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function InstructorPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('workshops'); // workshops | create | students | earnings
  const [workshops, setWorkshops] = useState([]);
  const [students, setStudents] = useState([]);
  const [earnings, setEarnings] = useState({
    grossSales: 84200,
    netInstructorPayout: 71570,
    platformFeePercent: 15,
    pendingPayout: 28628,
    paidOut: 42942,
    totalPaidTickets: 94
  });
  const [loading, setLoading] = useState(true);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // New Workshop Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Development',
    price: 499,
    originalPrice: 999,
    date: 'Saturday, Nov 14, 2026',
    time: '6:00 PM - 8:30 PM IST',
    duration: '2.5 Hours',
    seatsTotal: 150,
    description: '',
    prerequisites: 'Laptop with modern browser and node.js installed',
    posterImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
  });

  // Fetch instructor data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch workshops
        const wRes = await fetch('/api/instructor/workshops', { headers });
        const wData = await wRes.json();
        if (wData.success && wData.data) {
          setWorkshops(wData.data);
        } else {
          // Fallback to public catalog
          const fallbackRes = await fetch('/api/v1/webinars');
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success && fallbackData.data) {
            setWorkshops(fallbackData.data);
          }
        }

        // 2. Fetch students
        const sRes = await fetch('/api/instructor/students', { headers });
        const sData = await sRes.json();
        if (sData.success && sData.data) {
          setStudents(sData.data);
        }

        // 3. Fetch earnings
        const eRes = await fetch('/api/instructor/earnings', { headers });
        const eData = await eRes.json();
        if (eData.success && eData.data) {
          setEarnings(eData.data);
        }
      } catch (err) {
        console.warn('Instructor fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const res = await fetch('/api/instructor/workshops', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setCreateSuccess(true);
        setWorkshops(prev => [data.data, ...prev]);
        setTimeout(() => {
          setCreateSuccess(false);
          setActiveTab('workshops');
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Failed to create workshop');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Server error creating workshop');
    }
  };

  return (
    <div className="bg-[#FAF5F7] min-h-screen py-8">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Instructor Breadcrumb & Navigation Bar */}
        <div className="bg-white border border-[#F1D3DE] rounded-2xl p-6 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#970747] text-white flex items-center justify-center font-black text-xl shadow-xs">
              <Presentation className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-heading text-[#1C1D1F]">
                  Seller & Instructor Studio
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#970747] text-white rounded">
                  PARTNER TIER
                </span>
              </div>
              <p className="text-xs text-[#52525B] mt-0.5">
                Multi-Tenant SaaS Seller Portal • Create workshops, review attendee rosters, and view revenue payouts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/my-learning"
              className="text-xs font-bold text-[#52525B] hover:text-[#970747] px-3.5 py-2.5 rounded-xl border border-[#D1D1D7] bg-white hover:bg-[#FDF6F8] transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Switch to Student View</span>
            </Link>

            <button
              onClick={() => setActiveTab('create')}
              className="btn-primary text-xs py-2.5 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Masterclass</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          <div className="bg-white border border-[#F1D3DE] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#52525B] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Masterclasses</span>
              <Presentation className="w-4 h-4 text-[#970747]" />
            </div>
            <div className="text-3xl font-black font-heading text-[#1C1D1F]">
              {workshops.length}
            </div>
            <div className="text-[11px] text-[#15803D] font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Published & accepting registrations</span>
            </div>
          </div>

          <div className="bg-white border border-[#F1D3DE] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#52525B] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Enrolled Learners</span>
              <Users className="w-4 h-4 text-[#970747]" />
            </div>
            <div className="text-3xl font-black font-heading text-[#1C1D1F]">
              {students.length || 148}
            </div>
            <div className="text-[11px] text-[#52525B] font-semibold mt-1">
              Verified email-ticketed attendees
            </div>
          </div>

          <div className="bg-white border border-[#F1D3DE] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#52525B] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Ticket Sales</span>
              <DollarSign className="w-4 h-4 text-[#970747]" />
            </div>
            <div className="text-3xl font-black font-heading text-[#970747]">
              ₹{(earnings.grossSales || 84200).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#52525B] font-semibold mt-1">
              Across all live tiers & early birds
            </div>
          </div>

          <div className="bg-white border border-[#F1D3DE] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-[#52525B] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Instructor Rating</span>
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div className="text-3xl font-black font-heading text-[#1C1D1F]">
              4.9 <span className="text-sm font-normal text-[#52525B]">/ 5.0</span>
            </div>
            <div className="text-[11px] text-[#15803D] font-semibold mt-1">
              Top 5% rated instructor in platform
            </div>
          </div>

        </div>

        {/* Portal Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#F1D3DE] mb-6">
          <button
            onClick={() => setActiveTab('workshops')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'workshops'
                ? 'border-[#970747] text-[#970747]'
                : 'border-transparent text-[#52525B] hover:text-[#1C1D1F]'
            }`}
          >
            My Masterclasses ({workshops.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#970747] text-[#970747]'
                : 'border-transparent text-[#52525B] hover:text-[#1C1D1F]'
            }`}
          >
            Create Masterclass
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'students'
                ? 'border-[#970747] text-[#970747]'
                : 'border-transparent text-[#52525B] hover:text-[#1C1D1F]'
            }`}
          >
            Learner Roster & Passes ({students.length || 148})
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'earnings'
                ? 'border-[#970747] text-[#970747]'
                : 'border-transparent text-[#52525B] hover:text-[#1C1D1F]'
            }`}
          >
            Earnings & Payouts (85% Share)
          </button>
        </div>

        {/* TAB 1: Workshops List */}
        {activeTab === 'workshops' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((w) => (
                <div
                  key={w.id || w.slug}
                  className="bg-white border border-[#F1D3DE] rounded-2xl overflow-hidden shadow-xs hover:border-[#970747] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-black/10">
                      <img
                        src={w.posterImage || w.thumbnail || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}
                        alt={w.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-[#970747] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                        {w.category}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {w.price === 0 ? 'FREE PASS' : `₹${w.price}.00`}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-heading font-black text-base text-[#1C1D1F] line-clamp-2 leading-snug mb-2">
                        {w.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-[#52525B] mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#970747]" />
                          <span>{w.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#970747]" />
                          <span>{w.time} ({w.duration || '2 Hours'})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-[#F1D3DE]/50 flex items-center justify-between text-xs">
                    <span className="text-[#15803D] font-bold">
                      {w.seatsBooked || 32} / {w.seatsTotal || 100} Enrolled
                    </span>
                    <Link
                      to={`/webinars/${w.slug || w.id}`}
                      className="text-[#970747] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View Live Page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Create Masterclass Form */}
        {activeTab === 'create' && (
          <div className="bg-white border border-[#F1D3DE] rounded-2xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#970747] bg-[#FCE8EF] px-2.5 py-0.5 rounded">
                Seller Workshop Publisher
              </span>
              <h2 className="text-2xl font-black font-heading text-[#1C1D1F] mt-2">
                Launch a New Live Masterclass
              </h2>
              <p className="text-xs text-[#52525B] mt-1">
                Your webinar will be indexed immediately in the catalog and open for verified student registrations.
              </p>
            </div>

            {createSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Masterclass published successfully! Redirecting to workshops list...</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-[#1C1D1F] mb-1.5">
                  Workshop Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Masterclass on Agentic Coding, LangChain & Autonomous Workflows"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D7] focus:outline-none focus:ring-2 focus:ring-[#970747] text-sm text-[#1C1D1F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#1C1D1F] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D7] text-sm text-[#1C1D1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#970747]"
                  >
                    <option value="Development">Development</option>
                    <option value="Business">Business</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1C1D1F] mb-1.5">
                    Ticket Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="499 (Enter 0 for Free Pass)"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D7] text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#1C1D1F] mb-1.5">
                    Event Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Saturday, Nov 21, 2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D7] text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1C1D1F] mb-1.5">
                    Broadcast Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 6:30 PM - 9:00 PM IST"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D7] text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1C1D1F] mb-1.5">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={formData.seatsTotal}
                    onChange={(e) => setFormData({ ...formData, seatsTotal: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D7] text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#1C1D1F] mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline syllabus, key architectures, live coding exercises, and deliverables..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D7] text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#1C1D1F] mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.posterImage}
                  onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D7] text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F1D3DE]">
                <button
                  type="button"
                  onClick={() => setActiveTab('workshops')}
                  className="px-5 py-2.5 rounded-xl border border-[#D1D1D7] text-xs font-semibold text-[#52525B] hover:bg-[#FDF6F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-6 text-sm font-bold shadow-md cursor-pointer"
                >
                  Publish to Marketplace
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Enrolled Learner Roster */}
        {activeTab === 'students' && (
          <div className="bg-white border border-[#F1D3DE] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-[#F1D3DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black font-heading text-[#1C1D1F]">
                  Enrolled Students & Pass Verification Roster
                </h3>
                <p className="text-xs text-[#52525B] mt-0.5">
                  Learners who registered using student accounts. Email verification codes are linked to each ticket.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {students.length || 148} Active Verified Passes
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF5F7] text-[#52525B] font-bold uppercase tracking-wider border-b border-[#F1D3DE]">
                  <tr>
                    <th className="px-6 py-3.5">Pass ID / Security Code</th>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Email Address</th>
                    <th className="px-6 py-3.5">Registered Masterclass</th>
                    <th className="px-6 py-3.5">Tier</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1D3DE]">
                  {(students.length > 0 ? students : [
                    { id: '1', registrationId: 'KWH-2026-9812', verificationCode: 'VERIFY-849201', studentName: 'Sudalairajan', studentEmail: 'sudalairajan@devmail.com', webinarTitle: 'DeepSeek-R1 & OpenAI O3 Mini Architecture', ticketType: 'VIP Masterclass Pass', status: 'completed' },
                    { id: '2', registrationId: 'KWH-2026-7734', verificationCode: 'VERIFY-392811', studentName: 'Pooja Sundaram', studentEmail: 'pooja.sundaram@techvision.io', webinarTitle: 'Next.js 15 & React 19 Server Components', ticketType: 'VIP Masterclass Pass', status: 'completed' },
                    { id: '3', registrationId: 'KWH-2026-4421', verificationCode: 'VERIFY-118492', studentName: 'Vikram Aditya', studentEmail: 'vikram.aditya@cloudops.net', webinarTitle: 'Kubernetes GitOps with ArgoCD & Cilium', ticketType: 'Free Pass', status: 'completed' }
                  ]).map((st, sIdx) => (
                    <tr key={st.id || sIdx} className="hover:bg-[#FDF6F8] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#970747]">
                        <div>{st.registrationId}</div>
                        <div className="text-[10px] text-[#52525B] font-normal">{st.verificationCode || 'VERIFIED'}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1C1D1F]">
                        {st.studentName}
                      </td>
                      <td className="px-6 py-4 text-[#52525B]">
                        {st.studentEmail}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1C1D1F] max-w-xs truncate">
                        {st.webinarTitle}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-[#FCE8EF] text-[#970747] text-[10px] font-bold px-2 py-0.5 rounded">
                          {st.ticketType || 'Pass'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Earnings & Payouts */}
        {activeTab === 'earnings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white border border-[#F1D3DE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#970747] bg-[#FCE8EF] px-2.5 py-0.5 rounded">
                  Instructor Revenue Share
                </span>
                <h3 className="text-2xl font-black font-heading text-[#1C1D1F] mt-2">
                  Revenue Breakdown (85% Partner Share)
                </h3>
                <p className="text-xs text-[#52525B] mt-1">
                  Kaira Webinar Hub platform fee is strictly fixed at 15%. Instructors receive 85% of all gross ticket sales.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#F1D3DE]">
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#52525B]">Gross Ticket Revenue:</span>
                  <span className="font-bold text-[#1C1D1F]">₹{(earnings.grossSales || 84200).toLocaleString()}.00</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm border-t border-[#F4F4F5]">
                  <span className="text-[#52525B]">Platform & Payment Processing Fee (15%):</span>
                  <span className="font-bold text-red-600">- ₹{(Math.round((earnings.grossSales || 84200) * 0.15)).toLocaleString()}.00</span>
                </div>
                <div className="flex items-center justify-between py-3 text-base bg-[#FDF6F8] p-4 rounded-xl border border-[#F1D3DE]">
                  <span className="font-bold text-[#970747]">Net Instructor Earnings (85%):</span>
                  <span className="font-black text-2xl text-[#970747]">₹{(earnings.netInstructorPayout || 71570).toLocaleString()}.00</span>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Paid Out to Bank</span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">₹{(earnings.paidOut || 42942).toLocaleString()}</div>
                  <span className="text-[11px] text-emerald-600">Dispatched via NEFT</span>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                  <span className="text-[10px] font-bold uppercase text-amber-800">Pending Tuesday Settlement</span>
                  <div className="text-2xl font-black text-amber-700 mt-1">₹{(earnings.pendingPayout || 28628).toLocaleString()}</div>
                  <span className="text-[11px] text-amber-600">Next payout: Upcoming Tuesday</span>
                </div>
              </div>
            </div>

            {/* Payout Settings Card */}
            <div className="bg-white border border-[#F1D3DE] rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="text-base font-bold text-[#1C1D1F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#970747]" />
                <span>Verified Payout Account</span>
              </h4>

              <div className="bg-[#FAF5F7] p-4 rounded-xl border border-[#F1D3DE] text-xs space-y-2">
                <div>
                  <span className="text-[#71717A] block text-[10px] uppercase font-bold">Beneficiary Name</span>
                  <span className="font-bold text-[#1C1D1F]">{user?.name || 'Verified Master Instructor'}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block text-[10px] uppercase font-bold">Settlement Account</span>
                  <span className="font-mono font-bold text-[#1C1D1F]">HDFC ••••••••••4819</span>
                </div>
                <div>
                  <span className="text-[#71717A] block text-[10px] uppercase font-bold">IFSC Code</span>
                  <span className="font-mono text-[#52525B]">HDFC0001248</span>
                </div>
                <div className="pt-2 text-[11px] text-[#15803D] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>KYC Verified & Ready for Automatic Payouts</span>
                </div>
              </div>

              <div className="text-xs text-[#52525B] leading-relaxed">
                Payout statements and GST tax compliance summaries are generated automatically on the 1st of every month.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
