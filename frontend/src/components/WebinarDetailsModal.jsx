import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Award,
  Video
} from 'lucide-react';

export default function WebinarDetailsModal({ webinar, isOpen, onClose, onRegisterClick }) {
  if (!isOpen || !webinar) return null;

  const isFree = webinar.price === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EBDDE4] overflow-hidden my-8">
        
        {/* Top Image Banner */}
        <div className="relative h-64 sm:h-72 w-full bg-[#F7DCE8]">
          <img
            src={webinar.posterImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}
            alt={webinar.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#25171E] via-[#25171E]/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and tags on banner */}
          <div className="absolute bottom-6 left-6 right-6 text-white text-left space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#970747] text-white">
                {webinar.category}
              </span>
              {isFree ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#970747]">
                  FREE PASS AVAILABLE
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#970747]">
                  ₹{webinar.price} VIP
                </span>
              )}
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-3xl leading-tight">
              {webinar.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto text-left">
          
          {/* Key Schedule Information */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] text-xs">
            <div>
              <span className="text-[#66545D] block mb-0.5">Date:</span>
              <span className="font-bold text-[#25171E] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#970747]" />
                {webinar.date}
              </span>
            </div>

            <div>
              <span className="text-[#66545D] block mb-0.5">Time:</span>
              <span className="font-bold text-[#25171E] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#970747]" />
                {webinar.time}
              </span>
            </div>

            <div>
              <span className="text-[#66545D] block mb-0.5">Remaining Seats:</span>
              <span className="font-bold text-[#970747] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#D63384]" />
                {webinar.seatsAvailable} spots
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-base text-[#25171E]">
              Overview
            </h3>
            <p className="text-sm text-[#66545D] leading-relaxed">
              {webinar.description}
            </p>
          </div>

          {/* Outcomes */}
          {webinar.outcomes && webinar.outcomes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-base text-[#25171E]">
                What You Will Master:
              </h3>
              <ul className="space-y-2">
                {webinar.outcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#25171E]">
                    <CheckCircle2 className="w-4 h-4 text-[#970747] shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Speaker Bio */}
          <div className="p-4 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] flex items-center gap-4">
            <img
              src={webinar.speaker.avatar}
              alt={webinar.speaker.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <p className="font-heading font-bold text-base text-[#25171E]">
                {webinar.speaker.name}
              </p>
              <p className="text-xs text-[#D63384] font-semibold">
                {webinar.speaker.role} at {webinar.speaker.company}
              </p>
              <p className="text-xs text-[#66545D] mt-1 line-clamp-2">
                {webinar.speaker.bio}
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 flex items-center justify-between gap-4 border-t border-[#EBDDE4]">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-[#EBDDE4] text-xs font-semibold text-[#66545D] hover:bg-[#FDF5F8] transition-colors"
            >
              Back to Catalog
            </button>

            <button
              onClick={() => {
                onClose();
                onRegisterClick(webinar);
              }}
              className="btn-primary px-8 py-3 text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>{isFree ? 'Claim Free Seat' : `Register Now (₹${webinar.price})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
