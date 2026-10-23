import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EnrollmentProvider } from './context/EnrollmentContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/common/CartDrawer';

// Pages
import HomePage from './pages/HomePage';
import WebinarsPage from './pages/WebinarsPage';
import WebinarDetailPage from './pages/WebinarDetailPage';
import SpeakersPage from './pages/SpeakersPage';
import ParticipantDashboard from './pages/ParticipantDashboard';
import CoursePlayerPage from './pages/CoursePlayerPage';
import InstructorPage from './pages/InstructorPage';
import AdminPage from './pages/AdminPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import { AboutPage, ContactPage, FAQPage, TermsPage, PrivacyPage, RefundPolicyPage } from './pages/StaticPages';
import VerifyCertificatePage from './pages/VerifyCertificatePage';

function AppShell() {
  const location = useLocation();
  const isPlayerRoute = location.pathname.startsWith('/course/') || location.pathname.startsWith('/learn/');

  return (
    <div className="min-h-screen bg-white text-[#1C1D1F] flex flex-col font-sans selection:bg-[#970747] selection:text-white overflow-x-hidden">
      
      {/* Global Slide-Over Drawer for Cart and Wishlist */}
      {!isPlayerRoute && <CartDrawer />}

      {/* 1. Global Udemy-Inspired Navbar */}
      {!isPlayerRoute && <Navbar />}

      {/* 2. Main Routed View Area */}
      <main className="flex-1">
        <Routes>
          {/* Public Discovery Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<WebinarsPage />} />
          <Route path="/webinars" element={<WebinarsPage />} />
          <Route path="/webinars/:slug" element={<WebinarDetailPage />} />
          <Route path="/webinars/:slug/register" element={<WebinarDetailPage />} />
          <Route path="/course/:slug" element={<WebinarDetailPage />} />
          <Route path="/courses/:slug" element={<WebinarDetailPage />} />
          <Route path="/speakers" element={<SpeakersPage />} />
          <Route path="/speakers/:slug" element={<SpeakersPage />} />

          {/* Static & Informational */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/verify-certificate/:certificateNumber" element={<VerifyCertificatePage />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Student Portal & Learning Hub */}
          <Route path="/my-learning" element={<ParticipantDashboard defaultTab="all" />} />
          <Route path="/my-events" element={<ParticipantDashboard defaultTab="invoices" />} />
          <Route path="/my-invoices" element={<ParticipantDashboard defaultTab="invoices" />} />
          <Route path="/my-account" element={<ParticipantDashboard defaultTab="profile" />} />
          <Route path="/my-account/profile" element={<ParticipantDashboard defaultTab="profile" />} />
          <Route path="/registration/confirmation/:registrationId" element={<ParticipantDashboard defaultTab="invoices" />} />

          {/* Dedicated Course Player (Udemy Inspired) */}
          <Route path="/course/:courseId/learn" element={<CoursePlayerPage />} />
          <Route path="/learn/:courseId" element={<CoursePlayerPage />} />

          {/* Dedicated Seller / Instructor Portal */}
          <Route path="/instructor" element={<InstructorPage />} />
          <Route path="/seller" element={<InstructorPage />} />

          {/* Admin Console (Strictly Isolated) */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Global Footer */}
      {!isPlayerRoute && <Footer />}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EnrollmentProvider>
        <CartProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </CartProvider>
      </EnrollmentProvider>
    </AuthProvider>
  );
}
