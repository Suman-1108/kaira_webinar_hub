import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  Calendar, 
  Users, 
  Heart, 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  Video, 
  Radio, 
  ArrowRight 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useEnrollment } from '../../context/EnrollmentContext';
import CourseActionButton from './CourseActionButton';

export default function WebinarCard({ webinar }) {
  if (!webinar) return null;

  const { isInWishlist, toggleWishlist, isInCart, addToCart, setIsCartDrawerOpen } = useCart();
  const { checkOwnership } = useEnrollment();

  const id = webinar.id || webinar.slug;
  const ownership = checkOwnership(id);
  const isEnrolled = !!ownership?.isEnrolled;
  const isCompleted = !!ownership?.isCompleted || ownership?.completionPercentage === 100;
  const isFree = webinar.price === 0;
  const targetUrl = isEnrolled 
    ? `/course/${webinar.id || webinar.slug}/learn`
    : `/webinars/${webinar.slug || webinar.id}`;
  const rating = webinar.rating || 4.8;
  const reviewsCount = webinar.reviewsCount || 140;
  const inWishlist = isInWishlist(id);
  const inCart = isInCart(id);

  // Focus areas for the webinar
  const focusAreas = webinar.topicsCovered?.slice(0, 3) || [
    'Live Architecture',
    'Hands-on Code',
    'Speaker Q&A'
  ];

  return (
    <div className="card-course flex flex-col h-full group bg-white border border-[#F1D3DE] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-[#970747]">
      
      {/* Thumbnail with Overlay Badges & Wishlist Button */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        <Link to={targetUrl} className="block w-full h-full">
          <img
            src={webinar.posterImage || webinar.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'}
            alt={webinar.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
            loading="lazy"
          />
        </Link>

        {/* Enrolled / Live Broadcast Indicator */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start pointer-events-none">
          {isEnrolled ? (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[10px] font-extrabold uppercase tracking-wide border border-white/20 shadow-md ${
              isCompleted ? 'bg-emerald-600' : 'bg-[#970747]'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>{isCompleted ? 'COMPLETED' : 'ENROLLED'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wide border border-white/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE MASTERCLASS</span>
            </span>
          )}

          {!isEnrolled && isFree && (
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#15803D] text-white text-[10px] font-extrabold uppercase shadow-xs">
              Free Pass
            </span>
          )}
        </div>

        {/* Interactive Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(webinar);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
            inWishlist
              ? 'bg-[#970747] text-white scale-110'
              : 'bg-white/90 hover:bg-white text-[#1C1D1F] hover:text-[#970747]'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-white' : ''}`} />
        </button>

        {/* Seats urgency badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-medium bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>Interactive Q&A Session</span>
          </div>
          <span className="text-amber-300 font-bold">
            {webinar.seatsAvailable ? `${webinar.seatsAvailable} seats left` : 'Filling Fast'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Category & Verified Badge */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#970747] bg-[#FCE8EF] px-2 py-0.5 rounded">
              {webinar.category || 'Specialized Masterclass'}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Certificate
            </span>
          </div>

          {/* Title */}
          <Link to={targetUrl} className="block group-hover:text-[#970747] transition-colors">
            <h3 className="font-heading font-black text-[#1C1D1F] text-base leading-snug line-clamp-2 mt-1 mb-2">
              {webinar.title}
            </h3>
          </Link>

          {/* Live Instructor Profile */}
          {webinar.speaker && (
            <div className="flex items-center gap-2 mb-3">
              <img
                src={webinar.speaker.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={webinar.speaker.name}
                className="w-6 h-6 rounded-full object-cover border border-[#970747]"
              />
              <p className="text-xs text-[#52525B] truncate font-semibold">
                {webinar.speaker.name} <span className="text-[#9CA3AF] font-normal">• {webinar.speaker.company}</span>
              </p>
            </div>
          )}

          {/* Main Focusing in Webinar (Live Takeaways) */}
          <div className="bg-[#FAF5F7] p-2.5 rounded-xl border border-[#F1D3DE]/80 mb-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#970747] block">
              Main Webinar Focus:
            </span>
            <div className="flex flex-wrap gap-1">
              {focusAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold text-[#4B5563] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]"
                >
                  ✓ {area}
                </span>
              ))}
            </div>
          </div>

          {/* Schedule Date & Duration */}
          <div className="flex items-center justify-between text-xs text-[#52525B] pt-1 border-t border-[#F1D3DE]/60">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#970747]" />
              <span>{webinar.date}</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#970747]" />
              <span>{webinar.duration || '90 Mins'}</span>
            </div>
          </div>
        </div>

        {/* Pricing, Add to Cart & Registration CTAs */}
        <div className="pt-3 border-t border-[#F1D3DE] space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              {isFree ? (
                <span className="text-xl font-black text-[#15803D]">Free Pass</span>
              ) : (
                <>
                  <span className="text-xl font-black text-[#1C1D1F]">₹{webinar.price}.00</span>
                  {webinar.originalPrice && (
                    <span className="text-xs text-[#6B7280] line-through">₹{webinar.originalPrice}.00</span>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-[#B4690E] font-bold">
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-[#6B7280] font-normal">({reviewsCount})</span>
            </div>
          </div>

          {/* Interactive Dynamic Action Buttons */}
          <div className="pt-1">
            {isEnrolled ? (
              <CourseActionButton course={webinar} />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (inCart) {
                      setIsCartDrawerOpen(true);
                    } else {
                      addToCart(webinar);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    inCart
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-[#FAF5F7] hover:bg-[#FCE8EF] text-[#970747] border border-[#F1D3DE]'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>
                </button>

                <CourseActionButton course={webinar} />
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
