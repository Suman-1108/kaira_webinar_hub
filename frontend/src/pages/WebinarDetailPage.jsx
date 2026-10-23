import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  Calendar, 
  Clock, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Award, 
  Play, 
  Video, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles,
  ArrowRight,
  Heart,
  ShoppingCart
} from 'lucide-react';
import RegistrationModal from '../components/RegistrationModal';
import SuccessReceiptModal from '../components/SuccessReceiptModal';
import { useCart } from '../context/CartContext';
import { useEnrollment } from '../context/EnrollmentContext';
import CourseActionButton from '../components/common/CourseActionButton';

export default function WebinarDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { checkOwnership } = useEnrollment();
  const { addToCart, isInCart, toggleWishlist, isInWishlist, setIsCartDrawerOpen } = useCart();

  const [webinar, setWebinar] = useState(null);
  const [allWebinars, setAllWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [verifiedPassId, setVerifiedPassId] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/webinars/${slug}`);
        const data = await res.json();
        if (data.success && data.data) {
          setWebinar(data.data);
        }

        // Fetch related webinars
        const allRes = await fetch('/api/v1/webinars');
        const allData = await allRes.json();
        if (allData.success && allData.data) {
          setAllWebinars(allData.data);
        }
      } catch (err) {
        console.error('Failed to fetch webinar details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  // Protected action flow: If user returned from login with register=true, open registration modal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('register') === 'true' && user) {
      setIsRegisterModalOpen(true);
    }
  }, [location.search, user]);

  const handleRegisterClick = () => {
    if (!user) {
      // Preserve destination and redirect to login
      navigate(`/login?redirect=${encodeURIComponent(`/webinars/${slug}?register=true`)}`);
      return;
    }
    setIsRegisterModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#970747] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[#52525B]">Loading webinar masterclass details...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#1C1D1F] mb-4">Webinar Not Found</h2>
        <p className="text-[#52525B] mb-6">The requested webinar could not be located or may have ended.</p>
        <Link to="/webinars" className="btn-primary">Browse All Webinars</Link>
      </div>
    );
  }

  const isFree = webinar.price === 0;
  const rating = webinar.rating || 4.8;
  const reviewsCount = webinar.reviewsCount || 140;
  const learnersCount = webinar.learnersCount || 1200;
  const discountPercent = webinar.originalPrice && webinar.price ? Math.round(((webinar.originalPrice - webinar.price) / webinar.originalPrice) * 100) : 0;

  const relatedWebinars = allWebinars
    .filter(w => w.id !== webinar.id && (w.category === webinar.category || w.categoryId === webinar.categoryId))
    .slice(0, 3);

  const handleRegistrationSuccess = (regId) => {
    setIsRegisterModalOpen(false);
    setVerifiedPassId(regId);
  };

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. Dark Burgundy Top Banner Header */}
      <section className="bg-gradient-to-r from-[#18000A] via-[#350317] to-[#580628] text-white py-10 lg:py-14 border-b border-[#970747]/40">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="lg:max-w-3xl">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-rose-200 font-semibold mb-4">
              <Link to="/webinars" className="hover:text-white transition-colors">Webinars</Link>
              <span>&gt;</span>
              <Link to={`/webinars?category=${encodeURIComponent(webinar.category)}`} className="hover:text-white transition-colors text-rose-300">
                {webinar.category}
              </Link>
              <span>&gt;</span>
              <span className="text-rose-300/70 truncate max-w-xs">{webinar.title}</span>
            </nav>

            {/* Title & Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight leading-tight mb-3">
              {webinar.title}
            </h1>

            <p className="text-base sm:text-lg text-rose-100/90 leading-relaxed mb-4">
              {webinar.tagline || webinar.summary || webinar.description}
            </p>

            {/* Badges, Rating & Learners */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm mb-4">
              {webinar.isFeatured && (
                <span className="bestseller-badge">Bestseller</span>
              )}
              {isFree && (
                <span className="free-badge">Free Workshop</span>
              )}

              <div className="flex items-center gap-1.5 font-bold text-[#F3CA8C]">
                <span>{rating.toFixed(1)}</span>
                <div className="flex items-center text-[#E59819]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-current' : 'text-rose-950'}`}
                    />
                  ))}
                </div>
              </div>

              <span className="text-rose-200 underline">({reviewsCount.toLocaleString()} ratings)</span>
              <span className="text-rose-100 font-semibold">{learnersCount.toLocaleString()} learners</span>
            </div>

            {/* Creator / Speaker Line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-rose-200">
              <div className="flex items-center gap-2">
                <span>Created by</span>
                <Link to="/speakers" className="text-rose-300 font-bold hover:underline">
                  {webinar.speaker?.name || 'Academic Lead'}
                </Link>
              </div>

              <div className="flex items-center gap-1 text-rose-300/80">
                <Calendar className="w-3.5 h-3.5" />
                <span>{webinar.date}</span>
              </div>

              <div className="flex items-center gap-1 text-rose-300/80">
                <Globe className="w-3.5 h-3.5" />
                <span>{webinar.language || 'English'}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Main Body with Floating Purchase Card */}
      <section className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Details, What You'll Learn, Agenda, Speaker */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* What you'll learn Box (Udemy card) */}
            <div className="border border-[#D1D1D7] bg-[#F7F9FA] rounded-md p-6">
              <h2 className="text-xl font-bold font-heading text-[#1C1D1F] mb-4">
                What you'll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(webinar.outcomes || [
                  'Master practical real-world execution with industry frameworks',
                  'Gain actionable code samples and architectural teardowns',
                  'Participate in live interactive Q&A directly with the speaker',
                  'Receive a verified completion certificate upon attendance'
                ]).map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-[#1C1D1F]">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <span className="leading-snug">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workshop Content / Agenda Accordion */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold font-heading text-[#1C1D1F]">Webinar Curriculum</h2>
                  <p className="text-xs text-[#52525B] mt-0.5">
                    {webinar.agenda?.length || 4} sections • {webinar.duration} live interactive session
                  </p>
                </div>
              </div>

              <div className="border border-[#D1D1D7] rounded-md divide-y divide-[#D1D1D7]">
                {(webinar.agenda && webinar.agenda.length > 0 ? webinar.agenda : [
                  {
                    title: "Part 1: Foundational Frameworks & Mental Models",
                    duration: "25 mins",
                    description: "Core paradigms, architectural trade-offs, and design thinking.",
                    points: ["Core definitions", "Current industry standard practices"]
                  },
                  {
                    title: "Part 2: Real-World Implementation & Live Teardown",
                    duration: "35 mins",
                    description: "Step-by-step code demonstration and hands-on workflow execution.",
                    points: ["Tooling configuration", "Edge case handling"]
                  },
                  {
                    title: "Part 3: Performance Hardening & Production Pitfalls",
                    duration: "20 mins",
                    description: "Analyzing failure modes, observability, and cost control.",
                    points: ["Monitoring benchmarks", "Security checklists"]
                  },
                  {
                    title: "Part 4: Interactive Q&A & Code Repository Distribution",
                    duration: "10 mins",
                    description: "Open floor for attendee queries and access to post-session materials.",
                    points: ["GitHub repo fork", "Certificate instructions"]
                  }
                ]).map((item, idx) => (
                  <div key={idx} className="bg-white">
                    <button
                      onClick={() => setActiveSection(activeSection === idx ? null : idx)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#F7F9FA] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {activeSection === idx ? (
                          <ChevronUp className="w-4 h-4 text-[#970747]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#52525B]" />
                        )}
                        <span className="text-sm font-bold text-[#1C1D1F]">{item.title}</span>
                      </div>
                      <span className="text-xs text-[#52525B]">{item.duration}</span>
                    </button>

                    {activeSection === idx && (
                      <div className="px-5 pb-4 pt-1 bg-[#F7F9FA]/50 text-sm text-[#52525B]">
                        <p className="mb-2 text-xs">{item.description}</p>
                        {item.points && (
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            {item.points.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <h2 className="text-xl font-bold font-heading text-[#1C1D1F] mb-3">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-[#52525B]">
                {(webinar.prerequisites || [
                  'An internet-connected laptop or desktop computer with audio capability',
                  'Basic understanding of programming principles or domain fundamentals',
                  'No specialized software licenses required; all open-source or free-tier'
                ]).map((req, rIdx) => (
                  <li key={rIdx}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Detailed Description */}
            <div>
              <h2 className="text-xl font-bold font-heading text-[#1C1D1F] mb-3">Description</h2>
              <div className="prose text-sm text-[#52525B] leading-relaxed space-y-3">
                <p>{webinar.description}</p>
                <p>
                  This session is structured specifically for engineers, practitioners, and leaders who need actionable, production-ready depth. We bypass introductory slides to focus on concrete architectural decisions, real codebases, and live deployment demonstrations.
                </p>
              </div>
            </div>

            {/* Instructor Profile (Udemy style from Screenshot 3) */}
            {webinar.speaker && (
              <div className="pt-6 border-t border-[#D1D1D7]">
                <h2 className="text-xl font-bold font-heading text-[#1C1D1F] mb-4">Instructor</h2>
                
                <div>
                  <h3 className="text-base font-bold text-[#970747] hover:underline cursor-pointer">
                    {webinar.speaker.name}
                  </h3>
                  <p className="text-xs text-[#52525B] mt-0.5">{webinar.speaker.role} at {webinar.speaker.company}</p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 my-4">
                    <img
                      src={webinar.speaker.avatar}
                      alt={webinar.speaker.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#970747]"
                    />

                    <div className="space-y-1.5 text-xs text-[#1C1D1F] font-semibold">
                      <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{webinar.speaker.rating || 4.9} Instructor Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-[#970747]" />
                        <span>{(webinar.speaker.reviewsCount || 1200).toLocaleString()} Reviews</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{(webinar.speaker.studentCount || 15000).toLocaleString()} Students</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#52525B] leading-relaxed">
                    {webinar.speaker.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Student Reviews Section (Udemy style from Screenshot 4) */}
            <div className="pt-6 border-t border-[#D1D1D7]">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <h2 className="text-xl font-bold font-heading text-[#1C1D1F]">
                  {rating.toFixed(1)} webinar rating • {reviewsCount} ratings
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(webinar.reviews && webinar.reviews.length > 0 ? webinar.reviews : [
                  {
                    author: "Arun Krishnan",
                    rating: 5,
                    date: "3 days ago",
                    comment: "Exceptional live masterclass. The instructor answered queries in real time and the demo worked flawlessly without hiccups.",
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  },
                  {
                    author: "Sneha Mukherjee",
                    rating: 5,
                    date: "1 week ago",
                    comment: "Extremely clear curriculum and top-tier slides. The downloadable repository saved our startup months of trial and error.",
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  }
                ]).map((rev, idx) => (
                  <div key={idx} className="border border-[#D1D1D7] rounded-md p-4 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={rev.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#1C1D1F]">{rev.author}</div>
                          <div className="flex items-center gap-2 text-[11px] text-[#52525B]">
                            <div className="flex items-center text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span>{rev.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-[#52525B] leading-relaxed mt-2">{rev.comment}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#D1D1D7]/50 flex items-center gap-4 text-[11px] text-[#52525B]">
                      <span>Helpful?</span>
                      <button className="hover:text-[#970747] flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> Yes
                      </button>
                      <button className="hover:text-[#970747] flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3" /> No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Webinars / Students Also Registered For */}
            {relatedWebinars.length > 0 && (
              <div className="pt-6 border-t border-[#D1D1D7]">
                <h2 className="text-xl font-bold font-heading text-[#1C1D1F] mb-4">
                  Students Also Registered For
                </h2>

                <div className="divide-y divide-[#D1D1D7] border border-[#D1D1D7] rounded-md overflow-hidden bg-white">
                  {relatedWebinars.map((rw) => (
                    <Link
                      key={rw.id}
                      to={`/webinars/${rw.slug || rw.id}`}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-[#F7F9FA] transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={rw.posterImage || rw.thumbnail}
                          alt={rw.title}
                          className="w-20 h-12 object-cover rounded shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-[#1C1D1F] group-hover:text-[#970747] transition-colors line-clamp-1">
                            {rw.title}
                          </h4>
                          <p className="text-xs text-[#52525B]">
                            {rw.date} • {rw.speaker?.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {rw.price === 0 ? (
                          <span className="text-sm font-bold text-[#15803D]">Free</span>
                        ) : (
                          <span className="text-sm font-bold text-[#1C1D1F]">₹{rw.price}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Purchase Card (Udemy right card from Screenshot 2) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 border border-[#D1D1D7] rounded-lg bg-white shadow-md overflow-hidden">
              
              {/* Media Preview (Video or Poster with Play button) */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
                {isPlayingVideo && webinar.promoVideoUrl ? (
                  <video
                    src={webinar.promoVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={webinar.posterImage || webinar.thumbnail}
                      alt={webinar.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <button
                      onClick={() => setIsPlayingVideo(true)}
                      className="absolute w-14 h-14 rounded-full bg-white/90 text-[#1C1D1F] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all"
                    >
                      <Play className="w-6 h-6 fill-current ml-1 text-[#1C1D1F]" />
                    </button>
                    <span className="absolute bottom-3 text-white text-xs font-bold drop-shadow-md">
                      Preview this webinar
                    </span>
                  </>
                )}
              </div>

              {/* Purchase Card Body */}
              <div className="p-6 space-y-5">
                
                {/* Pricing Block */}
                <div>
                  <div className="flex items-baseline gap-3">
                    {isFree ? (
                      <span className="text-3xl font-extrabold text-[#15803D]">Free Pass</span>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-[#1C1D1F]">₹{webinar.price}.00</span>
                        {webinar.originalPrice && (
                          <span className="text-base text-[#52525B] line-through">₹{webinar.originalPrice}.00</span>
                        )}
                        {discountPercent > 0 && (
                          <span className="text-xs font-bold text-[#B45309] bg-amber-100 px-2 py-0.5 rounded">
                            {discountPercent}% off
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {!isFree && (
                    <div className="text-xs text-[#B45309] font-semibold mt-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Limited early-bird pricing ends soon</span>
                    </div>
                  )}
                </div>

                {/* Primary CTA Buttons */}
                <div className="space-y-2.5">
                  <CourseActionButton 
                    course={webinar} 
                    className="py-3 text-base"
                    onBeforeAction={() => {
                      if (!checkOwnership(webinar.id || webinar.slug)?.isEnrolled) {
                        handleRegisterClick();
                      }
                    }}
                  />

                  {!checkOwnership(webinar.id || webinar.slug)?.isEnrolled && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (isInCart(webinar.id || webinar.slug)) {
                            setIsCartDrawerOpen(true);
                          } else {
                            addToCart(webinar);
                          }
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isInCart(webinar.id || webinar.slug)
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-[#FAF5F7] hover:bg-[#FCE8EF] text-[#970747] border border-[#F1D3DE]'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{isInCart(webinar.id || webinar.slug) ? 'In Cart (Open)' : 'Add to Cart'}</span>
                      </button>

                      <button
                        onClick={() => toggleWishlist(webinar)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          isInWishlist(webinar.id || webinar.slug)
                            ? 'bg-[#970747] text-white border-[#970747]'
                            : 'bg-white hover:bg-[#FAF5F7] text-[#1C1D1F] border-[#D1D1D7]'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(webinar.id || webinar.slug) ? 'fill-current' : ''}`} />
                        <span>{isInWishlist(webinar.id || webinar.slug) ? 'Saved' : 'Wishlist'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Guarantees & Terms */}
                <div className="text-center text-xs text-[#52525B]">
                  <span>30-Day Money-Back Guarantee if dissatisfied</span>
                </div>

                {/* Webinar Includes Checklist */}
                <div className="border-t border-[#D1D1D7] pt-4 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1D1F]">
                    This webinar includes:
                  </h4>
                  <div className="space-y-2 text-xs text-[#1C1D1F]">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#970747]" />
                      <span>{webinar.duration} on-demand live stream & recording</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#970747]" />
                      <span>Verified Certificate of Completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                      <span>Full repository code & slides download</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#970747]" />
                      <span>Private instructor Q&A channel access</span>
                    </div>
                  </div>
                </div>

                {/* Social Share */}
                <div className="border-t border-[#D1D1D7] pt-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: webinar.title, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="text-xs font-semibold text-[#1C1D1F] hover:text-[#970747] flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Workshop</span>
                  </button>

                  <span className="text-[11px] text-[#52525B]">
                    {webinar.seatsAvailable} seats available
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <RegistrationModal
          webinar={webinar}
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {/* Verified Success Receipt Pass */}
      {verifiedPassId && (
        <SuccessReceiptModal
          registrationId={verifiedPassId}
          isOpen={!!verifiedPassId}
          onClose={() => setVerifiedPassId(null)}
        />
      )}

    </div>
  );
}
