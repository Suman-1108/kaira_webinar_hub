import React from 'react';
import { Sparkles, Compass, CreditCard, Video, Award, ArrowRight } from 'lucide-react';

export default function HowItWorks({ onExploreClick }) {
  const steps = [
    {
      num: '01',
      icon: Compass,
      title: 'Choose Your Topic',
      desc: 'Browse our curated masterclasses in Agentic AI, modern web stacks, cloud engineering, and SaaS growth.'
    },
    {
      num: '02',
      icon: CreditCard,
      title: 'Claim Your Pass',
      desc: 'Select Free or VIP pass tier. Complete seamless registration with instant backend verification & receipt generation.'
    },
    {
      num: '03',
      icon: Video,
      title: 'Join the Live Session',
      desc: 'Receive calendar invites, automated email reminders, and one-click access to interactive live streaming with live Q&A.'
    },
    {
      num: '04',
      icon: Award,
      title: 'Earn & Accelerate',
      desc: 'Get a cryptographically verifiable completion badge, permanent cloud recording access, and starter code repositories.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white relative">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8EF] border border-[#F1D3DE]">
            <Sparkles className="w-4 h-4 text-[#970747]" />
            <span className="text-xs font-bold text-[#970747] tracking-wider uppercase font-mono">
              SIMPLE 4-STEP PROCESS
            </span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#1C1D1F] tracking-tight">
            How Kaira Webinar Hub Works
          </h2>

          <p className="text-base sm:text-lg text-[#52525B] leading-relaxed">
            From discovering your next skill breakthrough to earning your industry credential in four frictionless steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-7 bg-[#FDF6F8] border border-[#F1D3DE] rounded-2xl hover:bg-white hover:border-[#970747] hover:shadow-xl hover:shadow-rose-950/10 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  {/* Step Number Top Banner */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-heading font-black text-3xl text-rose-300 group-hover:text-[#970747] transition-colors">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#F1D3DE] flex items-center justify-center text-[#970747] shadow-xs group-hover:bg-[#970747] group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-heading font-black text-lg text-[#1C1D1F] mb-2.5 group-hover:text-[#970747] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F1D3DE]/60 flex items-center gap-1.5 text-xs font-bold text-[#970747]">
                  <span>Step {step.num}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#970747]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner - Dark Burgundy Gradient */}
        <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#18000A] via-[#350317] to-[#580628] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-rose-950/30 border border-[#970747]/30">
          <div className="text-left space-y-1">
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">Ready to level up your craft?</h3>
            <p className="text-rose-200 text-sm">Seats are limited to maintain an interactive Q&A format.</p>
          </div>
          <button
            onClick={onExploreClick}
            className="px-8 py-3.5 rounded-full bg-white text-[#970747] hover:bg-rose-50 font-bold text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Browse All Masterclasses &rarr;
          </button>
        </div>

      </div>
    </section>
  );
}
