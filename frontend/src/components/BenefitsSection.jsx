import React from 'react';
import { 
  GraduationCap, 
  Terminal, 
  Layers, 
  MessageSquare, 
  FileText, 
  Video, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: GraduationCap,
      title: "Expert-Led Learning",
      description: "Direct mentorship from verified staff engineers, architects, and founders with decade-long production track records."
    },
    {
      icon: Terminal,
      title: "Practical Workshops",
      description: "Code along live with ready-to-run GitHub template repositories, realistic test harnesses, and edge case simulations."
    },
    {
      icon: Layers,
      title: "Industry-Relevant Topics",
      description: "Curriculum centered around emerging 2026 technology stacks: Agentic AI, modern React architectures, and Kubernetes SRE."
    },
    {
      icon: MessageSquare,
      title: "Community Access",
      description: "Join our vibrant invite-only Discord and student community channels for ongoing peer reviews, job postings, and discussions."
    },
    {
      icon: FileText,
      title: "Learning Resources",
      description: "Download comprehensive architectural diagrams, checklists, cheat sheets, and companion slide decks immediately."
    },
    {
      icon: Video,
      title: "Event Recordings",
      description: "Full lifetime access to cloud recordings with chapter-level timestamps, transcripts, and speaker code repositories."
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-white relative">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8EF] border border-[#F1D3DE]">
            <Sparkles className="w-4 h-4 text-[#970747]" />
            <span className="text-xs font-bold text-[#970747] tracking-wider uppercase font-mono">
              THE KAIRA PROMISE
            </span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#1C1D1F] tracking-tight">
            Designed for Real-World Impact
          </h2>

          <p className="text-base sm:text-lg text-[#52525B] leading-relaxed">
            Every webinar is crafted to provide immediate, actionable leverage in your day-to-day engineering and business decisions.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="p-8 bg-white border border-[#F1D3DE] rounded-2xl hover:border-[#970747] hover:shadow-xl hover:shadow-[#970747]/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Icon Box */}
                  <div className="w-14 h-14 rounded-2xl bg-[#FDF6F8] border border-[#F1D3DE] flex items-center justify-center text-[#970747] group-hover:bg-[#970747] group-hover:text-white transition-colors duration-300 shadow-xs">
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading font-black text-xl text-[#1C1D1F] group-hover:text-[#970747] transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="text-sm text-[#52525B] leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#FDF6F8] flex items-center gap-2 text-xs font-bold text-[#970747]">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Included with registration pass</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
