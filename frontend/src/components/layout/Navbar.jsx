import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  GraduationCap, 
  FileText, 
  ShieldCheck, 
  LogOut,
  Heart,
  ShoppingCart,
  Bell,
  BookOpen,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount, setIsCartDrawerOpen, setIsWishlistDrawerOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/webinars?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/webinars');
    }
  };

  // Helper for active link styles
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Extract 2 initials for the avatar circle (e.g. "SA" from user prompt screenshot)
  const getUserInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const categories = [
    { name: 'Artificial Intelligence', slug: 'ai-ml', desc: 'Agentic workflows, LLMs, neural architectures' },
    { name: 'Web Development', slug: 'web-dev', desc: 'React 19, Full Stack architecture, Next.js' },
    { name: 'Cloud & DevOps', slug: 'devops', desc: 'Kubernetes, GitOps, cloud resilience' },
    { name: 'Business & Marketing', slug: 'business', desc: 'B2B SaaS growth, monetization, pricing' },
    { name: 'Data Science', slug: 'data-science', desc: 'MLOps, analytics pipelines, vector search' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-2xs">
      
      {/* Main Navbar Row */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: KairaHub Branding Logo */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#970747] flex items-center justify-center text-white shadow-xs group-hover:bg-[#750435] transition-colors">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div className="leading-tight">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1C1D1F] font-heading flex items-center">
                Kaira<span className="text-[#970747]">Hub</span>
              </span>
            </div>
          </Link>

          {/* Categories Dropdown */}
          <div className="relative hidden lg:block" ref={categoriesRef}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                isCategoriesOpen ? 'text-[#970747] bg-[#FCE8EF]' : 'text-[#1C1D1F] hover:text-[#970747] hover:bg-[#FAF5F7]'
              }`}
            >
              <span>Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 text-[#970747]' : ''}`} />
            </button>

            {isCategoriesOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#F4F4F5]">
                  Browse Categories
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/webinars?category=${encodeURIComponent(cat.name)}`}
                    onClick={() => setIsCategoriesOpen(false)}
                    className="flex flex-col px-4 py-2.5 hover:bg-[#FDF6F8] hover:text-[#970747] transition-colors"
                  >
                    <span className="text-xs font-bold text-[#1C1D1F]">{cat.name}</span>
                    <span className="text-[11px] text-[#6B7280] truncate">{cat.desc}</span>
                  </Link>
                ))}
                <div className="border-t border-[#F4F4F5] mt-1 pt-1 px-4 py-2 bg-[#FAF5F7]">
                  <Link
                    to="/webinars"
                    onClick={() => setIsCategoriesOpen(false)}
                    className="text-xs font-bold text-[#970747] hover:underline flex items-center justify-between"
                  >
                    <span>View All Webinars</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center-Left: Main Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1">
          <Link
            to="/"
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
              isActive('/') && location.pathname === '/'
                ? 'text-[#970747] bg-[#FCE8EF]'
                : 'text-[#4B5563] hover:text-[#970747] hover:bg-[#FAF5F7]'
            }`}
          >
            Home
          </Link>

          <Link
            to="/webinars"
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
              isActive('/webinars')
                ? 'text-[#970747] bg-[#FCE8EF]'
                : 'text-[#4B5563] hover:text-[#970747] hover:bg-[#FAF5F7]'
            }`}
          >
            Explore Webinars
          </Link>

          <Link
            to="/speakers"
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
              isActive('/speakers')
                ? 'text-[#970747] bg-[#FCE8EF]'
                : 'text-[#4B5563] hover:text-[#970747] hover:bg-[#FAF5F7]'
            }`}
          >
            Speakers
          </Link>

          <Link
            to="/about"
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
              isActive('/about')
                ? 'text-[#970747] bg-[#FCE8EF]'
                : 'text-[#4B5563] hover:text-[#970747] hover:bg-[#FAF5F7]'
            }`}
          >
            About
          </Link>

          <Link
            to="/contact"
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
              isActive('/contact')
                ? 'text-[#970747] bg-[#FCE8EF]'
                : 'text-[#4B5563] hover:text-[#970747] hover:bg-[#FAF5F7]'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Center-Right: Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative mx-2 hidden md:block">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6F73]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search webinars, speakers, topics..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#D1D1D7] text-xs text-[#1C1D1F] placeholder:text-[#6A6F73] focus:outline-none focus:ring-2 focus:ring-[#970747] bg-[#F7F9FA] hover:bg-white focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </form>

        {/* Right Section: Authentication / User Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {user ? (
            /* AUTHENTICATED USER (Udemy-inspired controls from screenshot: My learning | ♡ | 🛒 | 🔔 | SA circle) */
            <div className="flex items-center gap-1 sm:gap-2">
              
              {/* My Learning link */}
              <Link
                to="/my-events"
                className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors hidden sm:inline-flex items-center gap-1.5 ${
                  isActive('/my-events') || isActive('/my-learning')
                    ? 'text-[#970747] bg-[#FCE8EF]'
                    : 'text-[#1C1D1F] hover:text-[#970747] hover:bg-[#FAF5F7]'
                }`}
              >
                <span>My learning</span>
              </Link>

              {/* Wishlist Button with Counter */}
              <button
                onClick={() => setIsWishlistDrawerOpen(true)}
                className="p-2 text-[#1C1D1F] hover:text-[#970747] hover:bg-[#FAF5F7] rounded-full transition-colors relative cursor-pointer"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#970747] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Button with Counter */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="p-2 text-[#1C1D1F] hover:text-[#970747] hover:bg-[#FAF5F7] rounded-full transition-colors relative cursor-pointer"
                title="Pass Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#970747] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications Icon with Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-[#1C1D1F] hover:text-[#970747] hover:bg-[#FAF5F7] rounded-full transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#970747] rounded-full animate-pulse" />
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] p-4 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4F4F5]">
                      <span className="text-xs font-bold text-[#1C1D1F]">Notifications</span>
                      <span className="text-[10px] font-bold text-[#970747] bg-[#FCE8EF] px-2 py-0.5 rounded">1 New</span>
                    </div>
                    <div className="py-2.5 text-xs space-y-1">
                      <p className="font-bold text-[#970747]">Welcome to KairaHub!</p>
                      <p className="text-[#52525B] text-[11px]">Browse expert-led masterclasses and claim your verified course pass.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Circle with Initials e.g. "SA" & Purple Online Active Dot */}
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C1D1F] text-white flex items-center justify-center font-bold text-xs sm:text-sm tracking-tight hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  title={user.name}
                >
                  {getUserInitials(user.name)}

                  {/* Purple active dot from reference image! */}
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#A435F0] border-2 border-white rounded-full" />
                </button>

                {/* Simple Account Menu Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-[#F4F4F5] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1C1D1F] text-white flex items-center justify-center font-black text-sm shrink-0">
                        {getUserInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1C1D1F] truncate">{user.name}</div>
                        <div className="text-[11px] text-[#6B7280] truncate">{user.email}</div>
                      </div>
                    </div>

                    {/* Menu links */}
                    <div className="py-1">
                      <Link
                        to="/my-events"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#1C1D1F] hover:bg-[#FDF6F8] hover:text-[#970747] transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-[#6B7280]" />
                        <span>My Registrations</span>
                      </Link>

                      <Link
                        to="/my-account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#1C1D1F] hover:bg-[#FDF6F8] hover:text-[#970747] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#6B7280]" />
                        <span>Profile & Settings</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#970747] hover:bg-[#FCE8EF] transition-colors border-t border-[#F4F4F5]"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#970747]" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[#F4F4F5] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          ) : (
            /* UNAUTHENTICATED GUEST (Wishlist, Cart, Log in & Sign up buttons) */
            <div className="flex items-center gap-2">
              {/* Wishlist Button with Counter */}
              <button
                onClick={() => setIsWishlistDrawerOpen(true)}
                className="p-2 text-[#1C1D1F] hover:text-[#970747] hover:bg-[#FAF5F7] rounded-full transition-colors relative cursor-pointer"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#970747] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Button with Counter */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="p-2 text-[#1C1D1F] hover:text-[#970747] hover:bg-[#FAF5F7] rounded-full transition-colors relative cursor-pointer mr-1"
                title="Pass Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#970747] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              <Link
                to="/login"
                className="hidden sm:inline-flex text-xs font-bold px-3.5 sm:px-4 py-2 rounded-lg border border-[#1C1D1F] text-[#1C1D1F] hover:bg-[#F7F9FA] transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex text-xs font-bold px-3.5 sm:px-4 py-2 rounded-lg bg-[#970747] hover:bg-[#750435] text-white transition-colors shadow-xs"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#1C1D1F] hover:bg-[#F7F9FA] cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E5E7EB] bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in">
          
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6F73]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search webinars, speakers..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-[#D1D1D7] text-xs bg-[#F7F9FA]"
            />
          </form>

          <div className="flex flex-col space-y-1 text-xs font-bold pt-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#FDF6F8] text-[#1C1D1F]"
            >
              Home
            </Link>
            <Link
              to="/webinars"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#FDF6F8] text-[#1C1D1F]"
            >
              Explore Webinars
            </Link>
            <Link
              to="/speakers"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#FDF6F8] text-[#1C1D1F]"
            >
              Speakers
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#FDF6F8] text-[#1C1D1F]"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#FDF6F8] text-[#1C1D1F]"
            >
              Contact
            </Link>

            {/* Mobile Wishlist & Cart quick actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F4F4F5]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsWishlistDrawerOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FAF5F7] text-[#970747] font-bold text-xs"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Wishlist ({wishlistCount})</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartDrawerOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FAF5F7] text-[#970747] font-bold text-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart ({cartCount})</span>
              </button>
            </div>

            {user ? (
              <>
                <Link
                  to="/my-events"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-[#FCE8EF] text-[#970747] border-t border-[#F4F4F5] mt-2 pt-2"
                >
                  My Registrations & Passes
                </Link>
                <Link
                  to="/my-account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-[#FDF6F8] text-[#1C1D1F]"
                >
                  Profile & Settings
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 text-left"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="pt-3 flex gap-2 border-t border-[#F4F4F5]">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg border border-[#1C1D1F] text-[#1C1D1F]"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg bg-[#970747] text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
