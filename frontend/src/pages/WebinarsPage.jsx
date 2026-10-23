import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Filter, 
  X, 
  Sparkles, 
  Heart, 
  ShoppingCart, 
  Radio, 
  Award, 
  Code2, 
  MessageSquare, 
  Users, 
  Calendar, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import WebinarCard from '../components/common/WebinarCard';
import { useCart } from '../context/CartContext';

export default function WebinarsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, wishlistCount, cartCount, setIsCartDrawerOpen, setIsWishlistDrawerOpen } = useCart();

  const [webinars, setWebinars] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeProgramTab, setActiveProgramTab] = useState('all'); // 'all' | 'courses' | 'webinars'
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedFocus, setSelectedFocus] = useState('all'); // 'all', 'live_this_week', 'hands_on_code', 'ai_systems', 'wishlist'

  // URL query state
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentPriceType = searchParams.get('priceType') || 'all';
  const currentSort = searchParams.get('sort') || 'upcoming';

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync search input if URL changes
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch webinars & courses with filters from API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (currentCategory && currentCategory !== 'All') {
          queryParams.set('category', currentCategory);
        }
        if (currentSearch) {
          queryParams.set('search', currentSearch);
        }
        if (currentPriceType && currentPriceType !== 'all') {
          queryParams.set('priceType', currentPriceType);
        }
        if (currentSort) {
          queryParams.set('sort', currentSort);
        }

        const [webinarsRes, coursesRes, catRes] = await Promise.all([
          fetch(`/api/v1/webinars?${queryParams.toString()}`),
          fetch(`/api/v1/courses`),
          fetch('/api/v1/webinars/categories')
        ]);

        const webinarsData = await webinarsRes.json();
        const coursesData = await coursesRes.json();
        const catData = await catRes.json();

        if (webinarsData.success && webinarsData.data) {
          setWebinars(webinarsData.data);
        }
        if (coursesData.success && coursesData.data) {
          const mappedCourses = coursesData.data.map(c => ({
            ...c,
            itemType: 'course',
            speaker: c.speaker || c.instructor
          }));
          setCourses(mappedCourses);
        }
        if (catData.success && catData.data) {
          setCategories(catData.data);
        }
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [currentCategory, currentSearch, currentPriceType, currentSort]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All' || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedFocus('all');
    setSearchParams(new URLSearchParams());
  };

  // Determine which items to display based on selected program tab and focus pill
  const displayedWebinars = React.useMemo(() => {
    let pool = [];
    if (activeProgramTab === 'courses') {
      pool = [...courses];
    } else if (activeProgramTab === 'webinars') {
      pool = [...webinars];
    } else {
      pool = [...courses, ...webinars];
    }

    if (selectedFocus === 'wishlist') {
      return wishlist;
    }
    if (selectedFocus === 'live_this_week') {
      return pool.filter(w => w.status === 'upcoming' || (w.seatsAvailable && w.seatsAvailable < 30));
    }
    if (selectedFocus === 'hands_on_code') {
      return pool.filter(w => 
        w.title?.toLowerCase().includes('react') || 
        w.title?.toLowerCase().includes('devops') || 
        w.title?.toLowerCase().includes('full stack') ||
        w.title?.toLowerCase().includes('python') ||
        w.title?.toLowerCase().includes('node') ||
        w.category?.toLowerCase().includes('web') ||
        w.category?.toLowerCase().includes('development')
      );
    }
    if (selectedFocus === 'ai_systems') {
      return pool.filter(w => 
        w.title?.toLowerCase().includes('ai') || 
        w.title?.toLowerCase().includes('agent') || 
        w.title?.toLowerCase().includes('neural') ||
        w.category?.toLowerCase().includes('intelligence') ||
        w.category?.toLowerCase().includes('data')
      );
    }
    return pool;
  }, [courses, webinars, wishlist, selectedFocus, activeProgramTab]);

  const hasActiveFilters = currentCategory !== 'All' || currentSearch || currentPriceType !== 'all' || currentSort !== 'upcoming' || selectedFocus !== 'all';

  return (
    <div className="bg-[#FDF6F8] min-h-screen py-8 lg:py-12">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        
        {/* 1. Header with Title & Quick Cart/Wishlist Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#F1D3DE]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#970747]/10 text-[#970747] text-xs font-bold uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>Expert-Led Live Masterclasses</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1C1D1F] tracking-tight">
              Live Webinars & Interactive Masterclasses
            </h1>
            <p className="text-sm text-[#52525B] mt-2 max-w-3xl leading-relaxed">
              Not ordinary pre-recorded courses. These are structured, live interactive sessions with verified industry executives and engineers. Join live Q&A, build real architecture, and receive an accredited completion pass.
            </p>
          </div>

          {/* Quick Drawer Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsWishlistDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#F1D3DE] bg-white hover:bg-[#FAF5F7] text-[#1C1D1F] font-bold text-xs shadow-xs transition-colors cursor-pointer group"
            >
              <Heart className={`w-4 h-4 transition-colors ${wishlistCount > 0 ? 'text-[#970747] fill-current' : 'text-[#52525B]'}`} />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#970747] text-white text-[11px] font-black">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#970747] hover:bg-[#750435] text-white font-bold text-xs shadow-md transition-all cursor-pointer group"
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Pass Cart</span>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white text-[#970747] text-[11px] font-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Main Webinar Focus Highlights Strip (Emphasizing Live Interactive Features) */}
        <div className="bg-white rounded-2xl border border-[#F1D3DE] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black tracking-wider uppercase text-[#970747] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>What Makes Our Live Webinars Different From Recorded Courses</span>
            </h2>
            <span className="text-[11px] font-semibold text-[#52525B] hidden sm:inline">
              100% Live Attendance • Verified Passing Certificate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Focus 1: Live Interactive Q&A */}
            <div className="p-3.5 rounded-xl bg-[#FAF5F7] border border-[#F1D3DE]/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#970747] text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#1C1D1F]">Live 2-Way Speaker Q&A</h3>
                <p className="text-[11px] text-[#52525B] mt-0.5 leading-snug">
                  Ask technical questions directly during dedicated 30-min live speaker breakout rooms.
                </p>
              </div>
            </div>

            {/* Focus 2: Hands-on Code & Architecture */}
            <div className="p-3.5 rounded-xl bg-[#FAF5F7] border border-[#F1D3DE]/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#970747] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Code2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#1C1D1F]">Live Code & Architecture</h3>
                <p className="text-[11px] text-[#52525B] mt-0.5 leading-snug">
                  Watch production systems built live with full GitHub repo distribution for attendees.
                </p>
              </div>
            </div>

            {/* Focus 3: Verified Digital Certificate */}
            <div className="p-3.5 rounded-xl bg-[#FAF5F7] border border-[#F1D3DE]/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#970747] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#1C1D1F]">Verified Pass Certificate</h3>
                <p className="text-[11px] text-[#52525B] mt-0.5 leading-snug">
                  Earn accredited credentials shareable on LinkedIn with verifiable cryptographic signature.
                </p>
              </div>
            </div>

            {/* Focus 4: Real-Time Cohort Networking */}
            <div className="p-3.5 rounded-xl bg-[#FAF5F7] border border-[#F1D3DE]/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#970747] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#1C1D1F]">Peer Network & Chat</h3>
                <p className="text-[11px] text-[#52525B] mt-0.5 leading-snug">
                  Connect with fellow developers, engineering managers, and startup founders in real time.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Filter & Search Control Panel */}
        <div className="bg-white p-5 rounded-2xl border border-[#F1D3DE] shadow-xs space-y-4">
          
          {/* Program Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#F1D3DE]">
            <button
              onClick={() => setActiveProgramTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeProgramTab === 'all'
                  ? 'bg-[#970747] text-white shadow-xs'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:text-[#970747] hover:bg-[#FCE8EF] border border-[#F1D3DE]'
              }`}
            >
              <span>All Programs</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                activeProgramTab === 'all' ? 'bg-white/20 text-white' : 'bg-[#970747]/10 text-[#970747]'
              }`}>
                {courses.length + webinars.length}
              </span>
            </button>

            <button
              onClick={() => setActiveProgramTab('courses')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeProgramTab === 'courses'
                  ? 'bg-[#970747] text-white shadow-xs'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:text-[#970747] hover:bg-[#FCE8EF] border border-[#F1D3DE]'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Certification Courses</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                activeProgramTab === 'courses' ? 'bg-white/20 text-white' : 'bg-[#970747]/10 text-[#970747]'
              }`}>
                {courses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveProgramTab('webinars')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeProgramTab === 'webinars'
                  ? 'bg-[#970747] text-white shadow-xs'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:text-[#970747] hover:bg-[#FCE8EF] border border-[#F1D3DE]'
              }`}
            >
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Live Webinars</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                activeProgramTab === 'webinars' ? 'bg-white/20 text-white' : 'bg-[#970747]/10 text-[#970747]'
              }`}>
                {webinars.length}
              </span>
            </button>
          </div>

          {/* Focus Format Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#F1D3DE]/60 scrollbar-none">
            <span className="text-xs font-bold text-[#52525B] shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#970747]" />
              <span>Format Focus:</span>
            </span>

            <button
              onClick={() => setSelectedFocus('all')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedFocus === 'all'
                  ? 'bg-[#970747] text-white shadow-xs'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:bg-[#FCE8EF] hover:text-[#970747]'
              }`}
            >
              All Masterclasses
            </button>

            <button
              onClick={() => setSelectedFocus('live_this_week')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedFocus === 'live_this_week'
                  ? 'bg-[#970747] text-white shadow-xs'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:bg-[#FCE8EF] hover:text-[#970747]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Live This Week</span>
            </button>

            <button
              onClick={() => setSelectedFocus('hands_on_code')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedFocus === 'hands_on_code'
                  ? 'bg-[#970747] text-white shadow-xs'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:bg-[#FCE8EF] hover:text-[#970747]'
              }`}
            >
              ⚡ Hands-on Coding & Tech
            </button>

            <button
              onClick={() => setSelectedFocus('ai_systems')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedFocus === 'ai_systems'
                  ? 'bg-[#970747] text-white shadow-xs'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:bg-[#FCE8EF] hover:text-[#970747]'
              }`}
            >
              🤖 AI & Neural Architecture
            </button>

            <button
              onClick={() => setSelectedFocus('wishlist')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedFocus === 'wishlist'
                  ? 'bg-[#970747] text-white shadow-xs'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:bg-[#FCE8EF] hover:text-[#970747]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${selectedFocus === 'wishlist' ? 'fill-current' : 'text-[#970747]'}`} />
              <span>Saved Wishlist ({wishlistCount})</span>
            </button>
          </div>

          {/* Search Bar, Price Toggle & Sort */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by topic, speaker name, or key skill..."
                className="w-full pl-10 pr-4 py-2 border border-[#D1D1D7] rounded-xl text-xs sm:text-sm text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747] bg-[#F7F9FA] focus:bg-white transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateFilter('search', '');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#1C1D1F]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Price Filter Pills & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-[#FAF5F7] p-1 rounded-xl border border-[#F1D3DE]">
                <button
                  onClick={() => updateFilter('priceType', 'all')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    currentPriceType === 'all' ? 'bg-[#970747] text-white shadow-xs' : 'text-[#52525B] hover:text-[#1C1D1F]'
                  }`}
                >
                  All Passes
                </button>
                <button
                  onClick={() => updateFilter('priceType', 'free')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    currentPriceType === 'free' ? 'bg-[#15803D] text-white shadow-xs' : 'text-[#52525B] hover:text-[#1C1D1F]'
                  }`}
                >
                  Free Passes
                </button>
                <button
                  onClick={() => updateFilter('priceType', 'paid')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    currentPriceType === 'paid' ? 'bg-[#970747] text-white shadow-xs' : 'text-[#52525B] hover:text-[#1C1D1F]'
                  }`}
                >
                  VIP & Premium
                </button>
              </div>

              {/* Sort Selector */}
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="text-xs font-bold border border-[#D1D1D7] rounded-xl px-3 py-2 bg-white text-[#1C1D1F] focus:outline-none focus:ring-2 focus:ring-[#970747]"
              >
                <option value="upcoming">Sort: Upcoming Schedule</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="price_low">Sort: Price: Low to High</option>
                <option value="price_high">Sort: Price: High to Low</option>
                <option value="newest">Sort: Recently Added</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-[#B91C1C] hover:underline px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>

          </div>

          {/* Category Quick Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#F1D3DE]/60 scrollbar-none">
            <span className="text-xs font-bold text-[#52525B] shrink-0 mr-1">Categories:</span>
            <button
              onClick={() => updateFilter('category', 'All')}
              className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                currentCategory === 'All'
                  ? 'bg-[#1C1D1F] text-white'
                  : 'bg-[#FAF5F7] text-[#52525B] hover:bg-[#FCE8EF] hover:text-[#970747]'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => updateFilter('category', cat.name)}
                className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  currentCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#1C1D1F] text-white'
                    : 'bg-[#FAF5F7] text-[#52525B] hover:bg-[#FCE8EF] hover:text-[#970747]'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

        </div>

        {/* 4. Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1C1D1F]">
              Showing <span className="text-[#970747] font-black">{displayedWebinars.length}</span> {selectedFocus === 'wishlist' ? (displayedWebinars.length !== 1 ? 'saved wishlist webinars' : 'saved wishlist webinar') : (displayedWebinars.length !== 1 ? 'live masterclasses' : 'live masterclass')}
            </p>
            {selectedFocus === 'wishlist' && (
              <span className="text-xs font-bold text-[#970747] bg-[#FCE8EF] px-2 py-0.5 rounded-md">
                Wishlist View
              </span>
            )}
          </div>

          {selectedFocus === 'wishlist' && displayedWebinars.length > 0 && (
            <button
              onClick={() => setSelectedFocus('all')}
              className="text-xs font-bold text-[#970747] hover:underline"
            >
              &larr; Back to All Masterclasses
            </button>
          )}
        </div>

        {/* 5. Webinars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#F1D3DE] rounded-2xl h-96 animate-pulse p-4 flex flex-col justify-between">
                <div className="aspect-video bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-slate-200 rounded-xl mt-auto"></div>
              </div>
            ))}
          </div>
        ) : displayedWebinars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedWebinars.map((webinar) => (
              <WebinarCard key={webinar.id || webinar.slug} webinar={webinar} />
            ))}
          </div>
        ) : selectedFocus === 'wishlist' ? (
          /* Wishlist Specific Empty State */
          <div className="bg-white border border-[#F1D3DE] rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF5F7] text-[#970747] flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-heading text-[#1C1D1F]">Your Wishlist is Empty</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              You haven't saved any masterclasses yet. Browse our live workshops and click the heart icon (<Heart className="w-3.5 h-3.5 inline text-[#970747]" />) on any webinar card to save it for later.
            </p>
            <button
              onClick={() => setSelectedFocus('all')}
              className="btn-primary text-xs py-2.5 px-6"
            >
              Explore Live Webinars
            </button>
          </div>
        ) : (
          /* General Empty Filter State */
          <div className="bg-white border border-[#D1D1D7] rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-3">
            <SlidersHorizontal className="w-12 h-12 text-[#970747] mx-auto mb-2" />
            <h3 className="text-lg font-bold text-[#1C1D1F]">No matching live masterclasses found</h3>
            <p className="text-sm text-[#52525B]">
              Try adjusting your search criteria, category selection, or price filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-primary text-xs py-2.5 px-5 mt-2"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
