import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Lightbulb, 
  Rocket, 
  TrendingUp, 
  CheckCircle2, 
  Play, 
  GraduationCap,
  Share2,
  Calendar,
  Clock,
  Coffee,
  Smartphone
} from 'lucide-react';

export default function EditorialHero({ onExploreClick, onSelectWebinar }) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const slides = [
    {
      tag: 'ARTICLE • CURATED WORKSHOP',
      title: 'IMPLEMENTING RPA & AGENTIC AI WITH CLARITY & CONFIDENCE',
      description: 'SurfaceAI & Agentic Swarms use frontier LLM orchestration techniques to capture and analyze in-depth details of production workflows. Real codebases, live interactive Q&A, and accredited credentials.',
      category: 'Artificial Intelligence',
      slug: 'agentic-ai-swarms-masterclass',
      speaker: 'Dr. Sarah Lin',
      role: 'Principal AI Scientist at Anthropic Systems',
      price: 'Free Pass Available',
      // High-resolution portrait matching the reference image (professional woman engineer with glasses, holding phone & cup)
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
      doodleColor: '#970747'
    },
    {
      tag: 'DEVOPS ARCHITECTURE',
      title: 'SCALING ZERO-DOWNTIME GITOPS WITH CLARITY & CONFIDENCE',
      description: 'Design fault-tolerant Kubernetes pipelines with automated canary rollbacks, eBPF telemetry, and runtime zero-trust enterprise security policies. Deploy with zero downtime and measurable resilience.',
      category: 'Cloud & DevOps',
      slug: 'zero-downtime-kubernetes-security',
      speaker: 'Alex Chen',
      role: 'Staff SRE at Hyperscale Infrastructure',
      price: '₹599 VIP Pass',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      doodleColor: '#970747'
    },
    {
      tag: 'FULLSTACK SYSTEMS',
      title: 'ARCHITECTING REACT 19 & NEXT.JS 15 WITH CLARITY & CONFIDENCE',
      description: 'Bypass introductory tutorials to engineer high-throughput web applications with Server Actions, Partial Prerendering, and edge data caching. Production architectures built for high-scale traffic.',
      category: 'Web Development',
      slug: 'nextjs-15-react-19-server-actions',
      speaker: 'Marcus Vance',
      role: 'Principal Architect at Vercel Labs',
      price: '₹499 VIP Pass',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
      doodleColor: '#970747'
    }
  ];

  // Auto-advance slides every 8 seconds unless interacted with
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/webinars?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const activeSlide = slides[currentSlide];

  return (
    <section className="relative w-full bg-gradient-to-br from-[#720835] via-[#970747] to-[#580628] py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-10 overflow-hidden select-none">
      
      {/* 1. Ambient Background Geometric Shapes & Dot Matrices (Matches reference screenshot) */}
      {/* Corner Dot Grid Matrix Top Right */}
      <div className="absolute top-6 right-6 lg:top-10 lg:right-12 z-0 opacity-25 pointer-events-none">
        <div className="grid grid-cols-6 gap-2">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>
      </div>

      {/* Corner Dot Grid Matrix Bottom Left */}
      <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-12 z-0 opacity-25 pointer-events-none">
        <div className="grid grid-cols-6 gap-2">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>
      </div>

      {/* Ambient Large Curved Shapes */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-black/25 blur-3xl pointer-events-none" />

      {/* 2. Main High-End Editorial Presentation Card (Stage) */}
      <div className="relative w-full max-w-[1520px] mx-auto bg-[#FAF7F5] rounded-[24px] sm:rounded-[36px] shadow-[0_30px_70px_-15px_rgba(20,0,10,0.5)] border border-white/40 overflow-hidden z-10 transition-all duration-300">
        
        {/* Stage Top Bar (Matching reference mockup navigation) */}
        <div className="border-b border-[#EFE8E2] px-6 sm:px-10 lg:px-14 py-4 sm:py-5 flex items-center justify-between gap-4 bg-white/60 backdrop-blur-md">
          
          {/* Logo with Red Monogram Badge */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-[#970747] text-white flex items-center justify-center font-heading font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg tracking-tight text-[#1C1D1F] leading-none">
                Surface<span className="text-[#970747]">Insight</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#71717A] mt-0.5 font-mono">
                KAIRA WEBINAR HUB
              </span>
            </div>
          </Link>

          {/* Center Clean Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#52525B]">
            <Link to="/webinars" className="text-[#970747] border-b-2 border-[#970747] pb-0.5">
              SurfaceAI
            </Link>
            <Link to="/webinars" className="hover:text-[#970747] transition-colors">
              Masterclasses
            </Link>
            <Link to="/speakers" className="hover:text-[#970747] transition-colors">
              Instructors
            </Link>
            <Link to="/about" className="hover:text-[#970747] transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-[#970747] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Header Controls (Search + Request Demo / Pass) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1D1F] transition-colors"
              title="Search masterclasses"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              to="/webinars"
              className="bg-[#1C1D1F] hover:bg-[#970747] text-white text-xs font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded transition-all shadow-sm whitespace-nowrap"
            >
              Request Pass
            </Link>
          </div>
        </div>

        {/* Collapsible Quick Search Input */}
        {isSearchOpen && (
          <div className="bg-[#FAF7F5] border-b border-[#EFE8E2] px-6 sm:px-14 py-3 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="flex max-w-xl mx-auto gap-2">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. AI Swarms, Next.js, Kubernetes)..."
                className="flex-1 px-4 py-2 bg-white border border-[#EFE8E2] rounded text-xs text-[#1C1D1F] focus:outline-none focus:border-[#970747]"
              />
              <button type="submit" className="btn-primary text-xs py-2 px-5 rounded">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Stage Content Grid: Left Editorial Text + Right Visual with Cutout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] items-stretch relative">
          
          {/* LEFT COLUMN: Editorial Headline & Copy */}
          <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-between text-left space-y-8 z-10">
            
            <div className="space-y-6 pt-4">
              {/* Category / Tracker Tag (ARTICLE in red tracking) */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#970747] tracking-[0.25em] uppercase font-mono">
                  {activeSlide.tag}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FCE8EF] text-[#970747] border border-[#F1D3DE]">
                  {activeSlide.price}
                </span>
              </div>

              {/* Bold Uppercase Headline (Exact Typography match) */}
              <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl xl:text-5xl text-[#1C1D1F] tracking-tight leading-[1.12] uppercase max-w-xl transition-all duration-300">
                {activeSlide.title}
              </h1>

              {/* Red Accent Dash + Descriptive Summary */}
              <div className="space-y-3">
                <div className="w-8 h-[2px] bg-[#970747]" />
                <p className="text-xs sm:text-sm lg:text-base text-[#52525B] leading-relaxed max-w-lg font-normal">
                  {activeSlide.description}
                </p>
              </div>

              {/* Red Elevated Button "Read More" / "Explore Masterclass" */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={`/webinars/${activeSlide.slug}`}
                  className="bg-[#970747] hover:bg-[#750435] text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded shadow-lg shadow-[#970747]/30 transition-all hover:scale-[1.03] active:scale-95 inline-flex items-center gap-2"
                >
                  <span>Explore Masterclass</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>

                <Link
                  to="/webinars"
                  className="text-xs font-bold text-[#1C1D1F] hover:text-[#970747] transition-colors flex items-center gap-1.5 px-3 py-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#970747]" />
                  <span>Browse All Workshops</span>
                </Link>
              </div>
            </div>

            {/* Bottom Indicator / Topic Line (Like "Fb Tw Ig" in reference) */}
            <div className="pt-6 border-t border-[#EFE8E2]/80 flex items-center gap-6 text-xs text-[#71717A] font-semibold">
              <div className="w-10 h-[1.5px] bg-[#1C1D1F]" />
              <div className="flex items-center gap-5">
                <span className="hover:text-[#970747] cursor-pointer">AI / ML</span>
                <span className="text-gray-300">•</span>
                <span className="hover:text-[#970747] cursor-pointer">Cloud DevOps</span>
                <span className="text-gray-300">•</span>
                <span className="hover:text-[#970747] cursor-pointer">React 19 & Next.js</span>
                <span className="text-gray-300">•</span>
                <span className="hover:text-[#970747] cursor-pointer">System Design</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Red Geometric Block + Person Cutout + Line-art Doodles */}
          <div className="lg:col-span-5 relative flex items-end justify-center px-4 sm:px-8 pb-0 pt-8 lg:pt-12 overflow-hidden">
            
            {/* Background Red Architectural Square/Block (Exact match to reference photo!) */}
            <div className="absolute right-6 sm:right-12 bottom-0 w-[280px] sm:w-[360px] lg:w-[420px] h-[340px] sm:h-[430px] lg:h-[490px] bg-gradient-to-br from-[#970747] via-[#85063c] to-[#600329] rounded-t-2xl shadow-xl z-0 overflow-hidden">
              {/* Subtle line-art geometric box accents on the red background */}
              <div className="absolute inset-4 border border-white/20 rounded-xl pointer-events-none" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 pointer-events-none" />
              <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/10 pointer-events-none" />
            </div>

            {/* Floating Line-Art Tech Doodles Around Visual */}
            {/* 1. Lightbulb Doodle (Top Left of image) */}
            <div className="absolute top-12 left-4 sm:left-12 z-20 bg-white/95 p-2 rounded-xl shadow-md border border-[#F1D3DE] animate-bounce hover:animate-none">
              <Lightbulb className="w-5 h-5 text-[#970747]" />
            </div>

            {/* 2. Rocket Doodle (Top Right) */}
            <div className="absolute top-14 right-4 sm:right-8 z-20 bg-white/95 p-2 rounded-xl shadow-md border border-[#F1D3DE]">
              <Rocket className="w-5 h-5 text-[#970747]" />
            </div>

            {/* 3. Growth Analytics Doodle (Middle Left) */}
            <div className="absolute bottom-28 left-6 sm:left-10 z-20 bg-white/95 p-2 rounded-xl shadow-md border border-[#F1D3DE]">
              <TrendingUp className="w-5 h-5 text-[#970747]" />
            </div>

            {/* 4. Dot Grid Pattern Doodle (Middle Right) */}
            <div className="absolute top-28 right-8 z-10 opacity-70 pointer-events-none">
              <div className="grid grid-cols-4 gap-1.5">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#970747]" />
                ))}
              </div>
            </div>

            {/* Professional Portrait (Holding cup & phone, standing in front of red block) */}
            <div className="relative z-10 max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] translate-y-2">
              <img
                src={activeSlide.image}
                alt="Tech professional learning with clarity"
                className="w-full h-auto object-cover object-top rounded-2xl drop-shadow-2xl max-h-[500px]"
              />

              {/* Floating Instructor Badge */}
              <div className="absolute bottom-6 left-2 sm:left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-[#F1D3DE] flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[#1C1D1F] line-clamp-1">{activeSlide.speaker}</p>
                  <p className="text-[9px] text-[#71717A] font-medium">{activeSlide.role}</p>
                </div>
              </div>
            </div>

            {/* BOTTOM RIGHT CORNER BLACK NAVIGATION BOX (Exact match to reference photo!) */}
            <div className="absolute bottom-0 right-0 z-30 bg-[#1C1D1F] text-white px-5 sm:px-6 py-4 flex items-center gap-5 rounded-tl-2xl shadow-2xl border-t border-l border-white/10">
              <span className="text-[11px] font-mono font-bold text-gray-400">
                0{currentSlide + 1} <span className="text-gray-600">/</span> 0{slides.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors text-white active:scale-90 cursor-pointer"
                  title="Previous masterclass"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-4 bg-white/20" />

                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors text-white active:scale-90 cursor-pointer"
                  title="Next masterclass"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
