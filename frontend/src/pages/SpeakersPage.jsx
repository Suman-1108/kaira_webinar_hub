import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Users, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/webinars/speakers');
        const data = await res.json();
        if (data.success && data.data) {
          setSpeakers(data.data);
        }
      } catch (err) {
        console.error('Failed to load speakers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  return (
    <div className="bg-[#F7F9FA] min-h-screen py-10">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#970747] bg-[#FCE8EF] px-3 py-1 rounded-full">
            Frontier Instructors
          </span>
          <h1 className="text-3xl font-extrabold font-heading text-[#1C1D1F] tracking-tight mt-3">
            Learn from industry practitioners
          </h1>
          <p className="text-sm text-[#52525B] mt-2">
            Our speakers aren't full-time slide presenters. They are staff architects, founders, and principal AI scientists actively deploying high-scale infrastructure.
          </p>
        </div>

        {/* Speakers Grid */}
        {loading ? (
          <div className="text-center py-12 text-sm text-[#52525B]">Loading instructor profiles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {speakers.map((spk, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#D1D1D7] rounded-xl p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-[#970747] transition-colors"
              >
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-4">
                    <img
                      src={spk.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={spk.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#970747]"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-[#1C1D1F]">{spk.name}</h3>
                      <p className="text-xs text-[#52525B] font-medium">{spk.role} • {spk.company}</p>

                      <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-[#1C1D1F]">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{spk.rating || 4.9} Rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{(spk.studentCount || 18000).toLocaleString()} Learners</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#52525B] leading-relaxed mb-6">
                    {spk.bio}
                  </p>
                </div>

                {/* Published Masterclasses by this Speaker */}
                <div className="pt-4 border-t border-[#D1D1D7]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#52525B] block mb-2">
                    Active Masterclasses ({spk.eventsCount || 1})
                  </span>
                  <div className="space-y-2">
                    {(spk.webinars || []).map((w) => (
                      <Link
                        key={w.id}
                        to={`/webinars/${w.slug || w.id}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-[#F7F9FA] group transition-colors text-xs"
                      >
                        <span className="font-semibold text-[#1C1D1F] group-hover:text-[#970747] truncate max-w-xs">
                          {w.title}
                        </span>
                        <span className="font-bold text-[#970747] shrink-0 flex items-center gap-1">
                          <span>{w.price === 0 ? 'Free' : `₹${w.price}`}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
