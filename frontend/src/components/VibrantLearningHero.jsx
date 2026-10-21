import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import heroBurgundyStudent from '../assets/hero-burgundy-student.jpg';

export default function VibrantLearningHero({ onExploreClick }) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EDE6FB] via-[#F4EEFD] to-white pt-4 pb-8 sm:pt-6 sm:pb-10 lg:pt-6 lg:pb-12 border-b border-[#E9DDF5]">
      
      {/* Background Soft Glows */}
      <div className="absolute top-6 left-1/4 w-80 h-80 bg-[#D8B4FE]/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#FBCFE8]/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* 1. Main Hero Container (Properly Aligned, Clean Studio Look, Only The Student Girl in Burgundy Sweater) */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#EDE6FB] via-[#F1E8FD] to-[#F5EEFD] shadow-md border border-[#E9DDF5]/80 p-6 sm:p-8 lg:p-0 min-h-[480px] lg:min-h-[520px] xl:min-h-[540px]">
          
          {/* Desktop-Only: Integrated 16:9 Clean Image (Student in Dark Burgundy Sweater, Balanced Framing with Ample Headroom) */}
          <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none">
            <img
              src={heroBurgundyStudent}
              alt="Online Learning Student"
              className="w-full h-full object-cover object-[75%_10%] xl:object-[73%_10%] select-none"
              loading="eager"
            />
            {/* Soft subtle gradient blend on the left ensuring 100% text contrast without covering the student */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#EDE6FB] via-[#EDE6FB]/85 to-transparent w-[50%]" />
          </div>

          {/* Grid Layout Container: Properly aligned vertically and horizontally */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[480px] lg:min-h-[520px] xl:min-h-[540px]">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-6 p-4 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-center space-y-4 sm:space-y-5 text-left z-10">
              
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#D8B4FE] shadow-2xs backdrop-blur-xs w-fit">
                <span className="w-2 h-2 rounded-full bg-[#970747] animate-pulse" />
                <span className="text-xs font-bold text-[#6B21A8] tracking-wide">
                  Certified Online Masterclasses
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[46px] font-black text-[#1C1D1F] tracking-tight leading-[1.14] font-heading">
                Online Learning – <br />
                <span className="text-[#970747] relative inline-block">
                  Elevation
                  <svg className="absolute -bottom-1 left-0 w-full h-2.5 text-[#970747]/30" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 150 2 198 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              {/* Subtext description */}
              <p className="text-xs sm:text-sm md:text-base text-[#4B5563] leading-relaxed max-w-xl font-normal">
                You can choose from hundreds of expert-led live video masterclasses and hands-on workshops with new curriculums published every week for ambitious learners across the globe.
              </p>

              {/* CTA Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => {
                    onExploreClick ? onExploreClick() : navigate('/webinars');
                  }}
                  className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#970747] hover:bg-[#750435] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>Explore Masterclasses</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/webinars')}
                  className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white hover:bg-[#FAF5FF] text-[#1C1D1F] border-2 border-[#1C1D1F] text-xs sm:text-sm font-bold shadow-2xs hover:border-[#970747] hover:text-[#970747] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#970747]" />
                  <span>Start Learning</span>
                </button>
              </div>

              {/* Quick trust metrics */}
              <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#52525B]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span className="font-semibold">Accredited Certificates</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span className="font-semibold">Live Q&A Sessions</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span className="font-semibold">Lifetime Recordings</span>
                </div>
              </div>

            </div>

            {/* Mobile/Tablet Visual: Clean student portrait in burgundy sweater */}
            <div className="lg:hidden w-full mt-2">
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-sm border border-[#E9DDF5]/80 bg-[#EDE6FB]">
                <img
                  src={heroBurgundyStudent}
                  alt="Online Learning Student"
                  className="w-full h-full object-cover object-[74%_12%] select-none"
                />
              </div>
            </div>

          </div>

        </div>

        {/* 2. Enlarged & Prominent Partner Logos Section (Increased Size as Requested) */}
        <div className="mt-8 sm:mt-10 bg-white rounded-3xl border border-[#E9DDF5] shadow-xl py-5 sm:py-6 px-6 sm:px-12 max-w-5xl xl:max-w-6xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-6 sm:gap-10">
          
          {/* Duolingo */}
          <div className="flex items-center gap-2.5 font-black text-sm sm:text-lg tracking-tight text-[#58CC02] hover:scale-105 transition-transform">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#58CC02] text-white flex items-center justify-center text-sm sm:text-base font-black shadow-xs">
              d
            </span>
            <span>duolingo</span>
          </div>

          {/* Magic Leap */}
          <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base tracking-widest uppercase text-[#374151] hover:scale-105 transition-transform">
            <span className="text-xs sm:text-sm">magic</span>
            <span className="text-[#970747]">leap</span>
          </div>

          {/* Microsoft */}
          <div className="flex items-center gap-2.5 font-bold text-sm sm:text-lg text-[#252525] hover:scale-105 transition-transform">
            <div className="grid grid-cols-2 gap-1 w-4.5 h-4.5 sm:w-5 sm:h-5">
              <span className="bg-[#F25022] w-2 h-2 rounded-[1px]" />
              <span className="bg-[#7FBA00] w-2 h-2 rounded-[1px]" />
              <span className="bg-[#00A4EF] w-2 h-2 rounded-[1px]" />
              <span className="bg-[#FFB900] w-2 h-2 rounded-[1px]" />
            </div>
            <span>Microsoft</span>
          </div>

          {/* Codecov */}
          <div className="flex items-center gap-2 font-bold text-sm sm:text-lg text-[#0070F3] hover:scale-105 transition-transform">
            <span className="text-base sm:text-xl font-black">&lt;/&gt;</span>
            <span>Codecov</span>
          </div>

          {/* KairaHub Certified */}
          <div className="flex items-center gap-2 font-bold text-sm sm:text-lg text-[#970747] hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#970747]" />
            <span>KairaHub Certified</span>
          </div>

        </div>

      </div>

    </section>
  );
}
