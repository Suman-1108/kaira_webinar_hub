import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Award, 
  Users, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Clock, 
  BookOpen, 
  Video,
  TrendingUp,
  Cpu,
  Code2,
  Cloud,
  Briefcase
} from 'lucide-react';
import WebinarCard from '../components/common/WebinarCard';
import VibrantLearningHero from '../components/VibrantLearningHero';
import PromotionalVideoSection from '../components/PromotionalVideoSection';
import BenefitsSection from '../components/BenefitsSection';
import SpeakersSection from '../components/SpeakersSection';
import HowItWorks from '../components/HowItWorks';
import ContactSection from '../components/ContactSection';
import RegistrationModal from '../components/RegistrationModal';
import SuccessReceiptModal from '../components/SuccessReceiptModal';

export default function HomePage() {
  const navigate = useNavigate();
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState('Artificial Intelligence');
  const [heroSearch, setHeroSearch] = useState('');

  // Modals
  const [selectedWebinarForReg, setSelectedWebinarForReg] = useState(null);
  const [verifiedPassId, setVerifiedPassId] = useState(null);

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [webinarsRes, coursesRes] = await Promise.all([
          fetch('/api/v1/webinars'),
          fetch('/api/v1/courses')
        ]);
        const webinarsData = await webinarsRes.json();
        const coursesData = await coursesRes.json();
        
        let allItems = [];
        if (coursesData.success && coursesData.data) {
          const mappedCourses = coursesData.data.map(c => ({
            ...c,
            itemType: 'course',
            speaker: c.speaker || c.instructor
          }));
          setCourses(mappedCourses);
          allItems = [...mappedCourses];
        }
        if (webinarsData.success && webinarsData.data) {
          allItems = [...allItems, ...webinarsData.data];
          setWebinars(allItems);
        } else if (allItems.length > 0) {
          setWebinars(allItems);
        }
      } catch (err) {
        console.warn('Backend fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/webinars?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/webinars');
    }
  };

  const categories = [
    { name: 'Artificial Intelligence', icon: Cpu, desc: 'Agentic AI, MCP, LLM pipelines' },
    { name: 'Web Development', icon: Code2, desc: 'React 19, Micro-frontends, Next.js' },
    { name: 'Cloud & DevOps', icon: Cloud, desc: 'Kubernetes, GitOps, zero-trust' },
    { name: 'Business & Marketing', icon: Briefcase, desc: 'B2B SaaS growth, pricing models' }
  ];

  const filteredByCategory = webinars.filter(w =>
    w.category?.toLowerCase() === activeCategoryTab.toLowerCase()
  );

  const featuredWebinar = webinars.find(w => w.isFeatured) || webinars[0];

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. Vibrant Online Learning Elevation Hero Section (Matches Reference Mockup) */}
      <VibrantLearningHero 
        onExploreClick={() => navigate('/webinars')} 
      />

      {/* 2. Category Tabs & Course Selection (Wide Container) */}
      <section className="py-14 bg-white border-b border-[#F1D3DE]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1D1F]">
              A broad selection of expert-led webinars
            </h2>
            <p className="text-sm text-[#52525B] mt-1">
              Choose from high-impact live workshops with real production codebases.
            </p>
          </div>

          {/* Horizontal Category Nav with Dark Burgundy Active Indicator */}
          <div className="flex items-center gap-3 sm:gap-4 border-b border-[#F1D3DE] pb-3 overflow-x-auto scrollbar-none mb-8">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategoryTab(cat.name)}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-all whitespace-nowrap ${
                  activeCategoryTab === cat.name
                    ? 'bg-[#970747] text-white shadow-md shadow-[#970747]/30'
                    : 'bg-[#FDF6F8] text-[#52525B] hover:bg-[#FCE8EF] hover:text-[#970747]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Category Highlight Card */}
          <div className="bg-gradient-to-r from-[#FFF5F8] via-[#FCE8EF] to-white border border-[#F1D3DE] rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-[#1C1D1F]">
                Expand your career opportunities in {activeCategoryTab}
              </h3>
              <p className="text-xs text-[#52525B] mt-1 max-w-2xl">
                Learn modern patterns from practitioners currently deploying enterprise systems at leading tech companies.
              </p>
            </div>
            <Link
              to={`/webinars?category=${encodeURIComponent(activeCategoryTab)}`}
              className="btn-primary text-xs py-2.5 px-5 whitespace-nowrap self-start md:self-auto"
            >
              Explore {activeCategoryTab} &rarr;
            </Link>
          </div>

          {/* Webinars Grid for Active Tab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            {(filteredByCategory.length > 0 ? filteredByCategory : webinars).slice(0, 4).map((webinar) => (
              <WebinarCard key={webinar.id} webinar={webinar} />
            ))}
          </div>

        </div>
      </section>

      {/* 3. Promotional Video & Interactive Preview */}
      <PromotionalVideoSection
        onRegisterClick={() => {
          if (webinars.length > 0) {
            setSelectedWebinarForReg(webinars[0]);
          } else {
            navigate('/webinars');
          }
        }}
      />

      {/* 4. Benefits Section (Why Choose Kaira) */}
      <BenefitsSection />

      {/* 5. Featured Speakers Directory */}
      <SpeakersSection />

      {/* 6. How it works */}
      <HowItWorks onExploreClick={() => navigate('/webinars')} />

      {/* 7. Contact & Support Section */}
      <ContactSection />

      {/* Modals for Direct Quick Registration */}
      {selectedWebinarForReg && (
        <RegistrationModal
          webinar={selectedWebinarForReg}
          isOpen={!!selectedWebinarForReg}
          onClose={() => setSelectedWebinarForReg(null)}
          onSuccess={(regId) => {
            setSelectedWebinarForReg(null);
            setVerifiedPassId(regId);
          }}
        />
      )}

      {verifiedPassId && (
        <SuccessReceiptModal
          registrationId={verifiedPassId}
          isOpen={!!verifiedPassId}
          onClose={() => setVerifiedPassId(null)}
        />
      )}

    </div>
  );
}
