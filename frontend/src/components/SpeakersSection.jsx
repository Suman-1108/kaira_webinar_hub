import React from 'react';
import { Sparkles, Award, CheckCircle, ExternalLink, Globe } from 'lucide-react';

export default function SpeakersSection() {
  const speakers = [
    {
      name: "Dr. Ananya Raman",
      role: "Principal AI Research Scientist",
      company: "CognitiveScale Labs",
      expertise: "Autonomous Multi-Agent Swarms & LLMs",
      bio: "8+ patents in distributed reasoning algorithms. Keynote speaker at leading AI summits with 12+ years pioneering cognitive computing architectures.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
      sessionsCount: "4 Masterclasses",
      rating: "4.95"
    },
    {
      name: "Vikram Sengupta",
      role: "Staff Frontend Architect",
      company: "Nexify Cloud",
      expertise: "React 19 & High-Performance Micro-Frontends",
      bio: "Spearheaded frontend transformations across 4 Unicorn tech companies. Passionate open-source contributor and mentor to 5,000+ engineers.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      sessionsCount: "6 Masterclasses",
      rating: "4.92"
    },
    {
      name: "Meera Krishnan",
      role: "Head of Infrastructure & SRE",
      company: "Aura Networks",
      expertise: "Cloud-Native Kubernetes & Zero-Trust SRE",
      bio: "Manages global multi-region clusters handling 40M+ transactions daily. CNCF Ambassador and prominent champion for resilient systems.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
      sessionsCount: "3 Masterclasses",
      rating: "4.98"
    },
    {
      name: "Rohan Varma",
      role: "VP of Growth & Revenue",
      company: "ScaleMetric",
      expertise: "B2B SaaS Growth & GTM Playbooks",
      bio: "Scaled ARR from seed to $15M+ across 3 fast-growing enterprise products. Creator of actionable frameworks for customer acquisition funnels.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
      sessionsCount: "5 Masterclasses",
      rating: "4.89"
    }
  ];

  return (
    <section id="about" className="py-20 bg-[#FDF5F8] border-b border-[#EBDDE4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7DCE8] border border-[#F3A6C4]">
            <Sparkles className="w-4 h-4 text-[#970747]" />
            <span className="text-xs font-bold text-[#970747] tracking-wider uppercase font-mono">
              VERIFIED PRACTITIONERS
            </span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#25171E] tracking-tight">
            Learn From Proven Leaders
          </h2>

          <p className="text-base sm:text-lg text-[#66545D] leading-relaxed">
            Our instructors don't teach from outdated slides. They teach from live production codebases and years of hard-won execution.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {speakers.map((speaker, index) => (
            <div
              key={index}
              className="card-kaira bg-white overflow-hidden flex flex-col justify-between border border-[#EBDDE4] hover:border-[#F3A6C4] transition-all duration-300 group"
            >
              {/* Speaker Photo */}
              <div className="relative h-64 w-full bg-[#F7DCE8] overflow-hidden">
                <img
                  src={speaker.avatar}
                  alt={speaker.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#970747] shadow-xs flex items-center gap-1">
                  <span>★</span>
                  <span>{speaker.rating}</span>
                </div>

                {/* Company Tag */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#970747] text-white shadow-xs">
                    {speaker.company}
                  </span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-1.5">
                  <h3 className="font-heading font-black text-lg text-[#25171E] group-hover:text-[#970747] transition-colors">
                    {speaker.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#D63384]">
                    {speaker.role}
                  </p>
                  <p className="text-xs text-[#66545D] leading-relaxed pt-2 line-clamp-3">
                    {speaker.bio}
                  </p>
                </div>

                {/* Expertise tag */}
                <div className="pt-3 border-t border-[#FDF5F8]">
                  <p className="text-[11px] font-bold text-[#970747] uppercase tracking-wide">
                    Focus: <span className="text-[#25171E] font-normal normal-case">{speaker.expertise}</span>
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
