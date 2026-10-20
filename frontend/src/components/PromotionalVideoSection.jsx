import React, { useState } from 'react';
import { Play, CheckCircle2, Sparkles, X, Volume2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PromotionalVideoSection({ onRegisterClick }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const outcomes = [
    'Architect resilient multi-agent task dispatching loops with low token overhead',
    'Evaluate frontier LLMs with strict safety guardrails and deterministic JSON schemas',
    'Hands-on interactive lab: building memory-persisted autonomous agents live',
    'Verified digital verifiable credential + full open-source workshop starter repository'
  ];

  return (
    <section className="py-20 bg-[#FDF5F8] relative overflow-hidden border-y border-[#EBDDE4]">
      {/* Soft Rose Decorative Circles */}
      <div 
        className="absolute top-10 left-10 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-50"
        style={{ background: '#F7DCE8' }}
      />
      <div 
        className="absolute -bottom-20 right-10 w-80 h-80 rounded-full pointer-events-none blur-3xl opacity-40"
        style={{ background: '#F3A6C4' }}
      />
      
      {/* Decorative concentric rings */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#F3A6C4]/30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-[#F7DCE8] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Video Player / Thumbnail Preview */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black aspect-video group">
              
              {!isPlaying ? (
                <>
                  <img
                    src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80"
                    alt="Promotional Webinar Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#25171E]/80 via-black/30 to-transparent" />

                  {/* Burgundy Play Button with glowing pulse */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="relative w-20 h-20 rounded-full bg-[#970747] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 hover:bg-[#80053b] transition-all cursor-pointer focus:outline-none"
                      aria-label="Play promotional video"
                    >
                      <span className="absolute -inset-2 rounded-full border-2 border-[#F3A6C4] animate-ping opacity-75" />
                      <Play className="w-8 h-8 fill-current ml-1 text-white" />
                    </button>
                  </div>

                  {/* Video meta pill on bottom */}
                  <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold tracking-wide uppercase">4-Min Masterclass Preview</span>
                    </div>
                    <span className="text-xs bg-black/50 backdrop-blur-md px-3 py-1 rounded-full font-mono text-[#F3A6C4]">
                      HD 1080p
                    </span>
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full bg-black">
                  <video
                    src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4"
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Right: Copy & Learning Outcomes */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7DCE8] border border-[#F3A6C4]">
              <Sparkles className="w-4 h-4 text-[#970747]" />
              <span className="text-xs font-bold text-[#970747] tracking-wider uppercase font-mono">
                FEATURED WORKSHOP SPOTLIGHT
              </span>
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#25171E] tracking-tight leading-tight">
              See what makes our masterclasses different.
            </h2>

            <p className="text-sm sm:text-base text-[#66545D] leading-relaxed">
              Every session is engineered with zero fluff. You'll work through real enterprise code repos, production telemetry, and unscripted architectural troubleshooting alongside lead engineers.
            </p>

            {/* Learning Outcomes Checklist */}
            <div className="space-y-3 pt-2">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#970747]">
                Key Learning Outcomes:
              </h4>
              <ul className="space-y-2.5">
                {outcomes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#25171E]">
                    <div className="w-5 h-5 rounded-full bg-[#F7DCE8] text-[#970747] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#970747]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Register Now CTA */}
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={onRegisterClick}
                className="btn-primary px-8 py-3.5 text-sm sm:text-base font-bold flex items-center gap-2.5 cursor-pointer"
              >
                <span>Register for Masterclass</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-2 text-xs text-[#66545D]">
                <ShieldCheck className="w-4 h-4 text-[#970747]" />
                <span>100% Satisfaction Guarantee</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
