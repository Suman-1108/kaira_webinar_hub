import React, { useState } from 'react';
import { Menu, X, Sparkles, User, ArrowRight } from 'lucide-react';

export default function Navbar({ onOpenAuth, onSelectTab, activeTab = 'home', onOpenAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Webinars', id: 'webinars' },
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id) => {
    if (onSelectTab) onSelectTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#970747] text-white shadow-md border-b border-[#80053b] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="font-heading font-black text-2xl text-[#970747] tracking-tighter">K</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-white">KAIRA</span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#D63384] text-white">HUB</span>
              </div>
              <p className="text-[11px] text-[#F3A6C4] font-medium tracking-wide -mt-0.5">EXPERT WEBINARS</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                    isActive 
                      ? 'text-white' 
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[#F3A6C4] rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Admin Dashboard shortcut */}
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#F7DCE8] hover:text-white hover:bg-white/10 transition-colors ml-2"
              title="Admin Dashboard"
            >
              Admin
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <User className="w-4 h-4 text-[#F3A6C4]" />
              <span>Login / My Account</span>
            </button>

            <button
              onClick={() => handleNavClick('webinars')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#FFFFFF] text-[#970747] hover:bg-[#FDF5F8] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Explore Webinars</span>
              <ArrowRight className="w-4 h-4 text-[#D63384]" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#80053b] border-t border-white/10 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold text-white hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>{link.name}</span>
              <ArrowRight className="w-4 h-4 text-[#F3A6C4]" />
            </button>
          ))}

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAdmin && onOpenAdmin(); }}
              className="w-full text-left px-4 py-2 text-sm text-[#F7DCE8] font-medium"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth && onOpenAuth(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold bg-white/10 text-white"
            >
              <User className="w-4 h-4" />
              <span>Login / My Account</span>
            </button>
            <button
              onClick={() => handleNavClick('webinars')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold bg-white text-[#970747]"
            >
              <span>Explore Webinars</span>
              <ArrowRight className="w-4 h-4 text-[#D63384]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
