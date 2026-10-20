import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Tag, 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertCircle,
  Filter
} from 'lucide-react';

export default function UpcomingWebinars({ 
  webinars = [], 
  loading = false, 
  onSelectWebinar, 
  onRegisterClick 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'AI & Machine Learning',
    'Web Development',
    'Cloud & DevOps',
    'Business & Marketing'
  ];

  const filteredWebinars = useMemo(() => {
    return webinars.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = searchQuery.trim() === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [webinars, selectedCategory, searchQuery]);

  return (
    <section id="webinars" className="py-20 bg-white relative">
      {/* Background Soft Glow */}
      <div 
        className="absolute top-1/2 left-0 w-72 h-72 rounded-full opacity-30 pointer-events-none blur-3xl"
        style={{ background: '#F7DCE8' }}
      />
      <div 
        className="absolute bottom-10 right-0 w-80 h-80 rounded-full opacity-25 pointer-events-none blur-3xl"
        style={{ background: '#F3A6C4' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7DCE8] border border-[#F3A6C4]">
            <Sparkles className="w-4 h-4 text-[#970747]" />
            <span className="text-xs font-bold text-[#970747] tracking-wider uppercase font-mono">
              CURATED MASTERCLASSES
            </span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#25171E] tracking-tight">
            Explore Upcoming Webinars
          </h2>

          <p className="text-base sm:text-lg text-[#66545D] leading-relaxed">
            Gain practical insights and hands-on skills through deep-dive sessions led by seasoned industry architects and practitioners.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#EBDDE4]">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#970747] text-white shadow-sm'
                      : 'bg-[#FDF5F8] text-[#66545D] hover:bg-[#F7DCE8] hover:text-[#970747] border border-[#EBDDE4]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#970747] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search webinars or speakers..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FDF5F8] border border-[#EBDDE4] text-xs sm:text-sm text-[#25171E] placeholder-[#66545D]/60 focus:outline-none focus:border-[#970747] focus:ring-1 focus:ring-[#970747] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#66545D] hover:text-[#25171E]"
              >
                Clear
              </button>
            )}
          </div>

        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-3 border-[#F7DCE8] border-t-[#970747] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#66545D]">Loading upcoming sessions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredWebinars.length === 0 && (
          <div className="py-20 text-center bg-[#FDF5F8] rounded-3xl border border-[#EBDDE4] p-8 max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F7DCE8] text-[#970747] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-xl text-[#25171E]">No webinars found</h3>
            <p className="text-sm text-[#66545D]">
              We couldn't find any sessions matching "{searchQuery}" under "{selectedCategory}". Try adjusting your query or category filter.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-5 py-2 rounded-full bg-[#970747] text-white text-xs font-semibold hover:bg-[#80053b] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Webinar Cards Grid */}
        {!loading && filteredWebinars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredWebinars.map((webinar) => {
              const isFree = webinar.price === 0;

              return (
                <div
                  key={webinar.id}
                  className="card-kaira group flex flex-col justify-between overflow-hidden relative bg-white hover:border-[#F3A6C4] transition-all duration-300"
                >
                  {/* Top Thumbnail & Badges */}
                  <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-[#F7DCE8]">
                    <img
                      src={webinar.posterImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}
                      alt={webinar.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Category pill */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-[#970747] shadow-xs">
                        {webinar.category}
                      </span>
                    </div>

                    {/* Pricing pill */}
                    <div className="absolute top-4 right-4">
                      {isFree ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FDF5F8] text-[#970747] border border-[#F3A6C4] shadow-xs">
                          FREE ACCESS
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#970747] text-white shadow-xs">
                          ₹{webinar.price} <span className="line-through text-white/70 text-[10px] ml-1">₹{webinar.originalPrice}</span>
                        </span>
                      )}
                    </div>

                    {/* Date and Duration floating bar */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-[#F3A6C4]" />
                        <span>{webinar.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-[#F3A6C4]" />
                        <span>{webinar.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                    
                    <div className="space-y-3">
                      <h3 
                        onClick={() => onSelectWebinar && onSelectWebinar(webinar)}
                        className="font-heading font-black text-xl sm:text-2xl text-[#25171E] group-hover:text-[#970747] transition-colors cursor-pointer leading-snug"
                      >
                        {webinar.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-[#66545D] leading-relaxed line-clamp-2">
                        {webinar.tagline || webinar.description}
                      </p>
                    </div>

                    {/* Speaker info */}
                    <div className="p-3.5 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={webinar.speaker.avatar}
                          alt={webinar.speaker.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                        <div className="text-left">
                          <p className="font-heading font-bold text-sm text-[#25171E]">
                            {webinar.speaker.name}
                          </p>
                          <p className="text-[11px] text-[#66545D] leading-tight">
                            {webinar.speaker.role} • <strong className="text-[#970747]">{webinar.speaker.company}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#970747]">
                          <Users className="w-3 h-3 text-[#D63384]" />
                          <span>{webinar.seatsAvailable} spots left</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => onRegisterClick && onRegisterClick(webinar)}
                        className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{isFree ? 'Claim Free Seat' : 'Register Now'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSelectWebinar && onSelectWebinar(webinar)}
                        className="px-4 py-3 rounded-full border border-[#EBDDE4] text-xs font-semibold text-[#66545D] hover:bg-[#FDF5F8] hover:text-[#970747] hover:border-[#F3A6C4] transition-all"
                      >
                        Details
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
