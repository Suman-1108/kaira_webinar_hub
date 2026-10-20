import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroThree from './components/HeroThree';
import UpcomingWebinars from './components/UpcomingWebinars';
import PromotionalVideoSection from './components/PromotionalVideoSection';
import BenefitsSection from './components/BenefitsSection';
import SpeakersSection from './components/SpeakersSection';
import HowItWorks from './components/HowItWorks';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

// Modals
import RegistrationModal from './components/RegistrationModal';
import SuccessReceiptModal from './components/SuccessReceiptModal';
import WebinarDetailsModal from './components/WebinarDetailsModal';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';

export default function App() {
  const [webinars, setWebinars] = useState([]);
  const [loadingWebinars, setLoadingWebinars] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Modal triggers
  const [selectedWebinarForDetails, setSelectedWebinarForDetails] = useState(null);
  const [selectedWebinarForReg, setSelectedWebinarForReg] = useState(null);
  const [verifiedPassId, setVerifiedPassId] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Fetch webinars from backend API
  const fetchWebinars = async () => {
    try {
      setLoadingWebinars(true);
      const res = await fetch('/api/webinars');
      const data = await res.json();
      if (data.success && data.data) {
        setWebinars(data.data);
      }
    } catch (err) {
      console.warn('Backend fetch error, using client fallback:', err);
    } finally {
      setLoadingWebinars(false);
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  const scrollToSection = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegisterClick = (webinar) => {
    setSelectedWebinarForReg(webinar);
  };

  const handleRegistrationSuccess = (registrationId) => {
    setSelectedWebinarForReg(null);
    setSelectedWebinarForDetails(null);
    setVerifiedPassId(registrationId);
  };

  return (
    <div className="min-h-screen bg-white text-[#25171E] flex flex-col font-sans">
      
      {/* 1. Sticky Burgundy Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={scrollToSection}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Interactive Hero with Three.js */}
        <section id="home">
          <HeroThree
            onExploreClick={() => scrollToSection('webinars')}
            onWatchPreviewClick={() => {
              const el = document.getElementById('promo-video');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* 3. Upcoming Webinars with Filters & Search */}
        <UpcomingWebinars
          webinars={webinars}
          loading={loadingWebinars}
          onSelectWebinar={(w) => setSelectedWebinarForDetails(w)}
          onRegisterClick={handleRegisterClick}
        />

        {/* 4. Promotional Video Section */}
        <div id="promo-video">
          <PromotionalVideoSection
            onRegisterClick={() => {
              if (webinars.length > 0) {
                handleRegisterClick(webinars[0]);
              } else {
                scrollToSection('webinars');
              }
            }}
          />
        </div>

        {/* 5. Benefits & Core Features */}
        <BenefitsSection />

        {/* 6. Real Verified Speakers */}
        <SpeakersSection />

        {/* 7. How It Works - 4 Step Flow */}
        <HowItWorks
          onExploreClick={() => scrollToSection('webinars')}
        />

        {/* 8. Contact Support & FAQ */}
        <ContactSection />
      </main>

      {/* 9. Burgundy Footer with Policy Links */}
      <Footer
        onNavClick={scrollToSection}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* MODALS */}

      {/* Webinar Details Overview Modal */}
      {selectedWebinarForDetails && (
        <WebinarDetailsModal
          webinar={selectedWebinarForDetails}
          isOpen={!!selectedWebinarForDetails}
          onClose={() => setSelectedWebinarForDetails(null)}
          onRegisterClick={(w) => setSelectedWebinarForReg(w)}
        />
      )}

      {/* Registration & Razorpay Payment Modal */}
      {selectedWebinarForReg && (
        <RegistrationModal
          webinar={selectedWebinarForReg}
          isOpen={!!selectedWebinarForReg}
          onClose={() => setSelectedWebinarForReg(null)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {/* Verified Success Entry Pass Modal (Backend Verified) */}
      {verifiedPassId && (
        <SuccessReceiptModal
          registrationId={verifiedPassId}
          isOpen={!!verifiedPassId}
          onClose={() => setVerifiedPassId(null)}
        />
      )}

      {/* Attendee Pass Lookup & Admin Login Modal */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onViewPass={(passId) => setVerifiedPassId(passId)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      )}

      {/* Admin Operations & Analytics Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onWebinarsUpdated={fetchWebinars}
        />
      )}

    </div>
  );
}
