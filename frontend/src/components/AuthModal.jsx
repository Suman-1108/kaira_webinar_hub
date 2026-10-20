import React, { useState } from 'react';
import { X, User, Lock, Search, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onViewPass, onOpenAdmin }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('lookup'); // 'lookup' or 'admin'
  const [passId, setPassId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const id = passId.trim().toUpperCase();
    if (!id) {
      setErrorMsg('Please enter your Registration Pass ID (e.g. KWH-2026-8941)');
      return;
    }
    onClose();
    onViewPass(id);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Simple demo admin credentials
    if (adminPassword === 'admin123' || adminPassword === 'kaira2026') {
      onClose();
      onOpenAdmin();
    } else {
      setErrorMsg('Invalid password. Default demo key is "kaira2026" or "admin123"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EBDDE4] overflow-hidden my-8">
        
        {/* Banner */}
        <div className="bg-[#970747] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white text-[#970747] flex items-center justify-center mx-auto mb-2 font-black text-xl">
            {mode === 'lookup' ? <Ticket className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>

          <h3 className="font-heading font-black text-2xl text-white">
            {mode === 'lookup' ? 'Attendee Access Portal' : 'Admin Login'}
          </h3>
          <p className="text-xs text-[#F7DCE8] mt-1">
            {mode === 'lookup' 
              ? 'Retrieve your verified entry pass & joining links' 
              : 'Sign in to access webinar operations & analytics'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#EBDDE4] bg-[#FDF5F8]">
          <button
            onClick={() => { setMode('lookup'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'lookup' 
                ? 'bg-white text-[#970747] border-b-2 border-[#970747]' 
                : 'text-[#66545D] hover:text-[#970747]'
            }`}
          >
            Find My Ticket / Pass
          </button>
          <button
            onClick={() => { setMode('admin'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'admin' 
                ? 'bg-white text-[#970747] border-b-2 border-[#970747]' 
                : 'text-[#66545D] hover:text-[#970747]'
            }`}
          >
            Administrator Login
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 text-left space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          {mode === 'lookup' ? (
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#25171E] mb-1.5">
                  Registration Pass ID *
                </label>
                <div className="relative">
                  <Ticket className="w-4 h-4 text-[#970747] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={passId}
                    onChange={(e) => setPassId(e.target.value)}
                    placeholder="e.g. KWH-2026-8941"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBDDE4] text-xs font-mono uppercase focus:outline-none focus:border-[#970747]"
                  />
                </div>
                <p className="text-[11px] text-[#66545D] mt-1">
                  Sent to your registered email and WhatsApp after booking. Try sample: <code className="font-bold text-[#970747]">KWH-2026-8941</code>
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Find My Entry Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#25171E] mb-1.5">
                  Admin Passkey *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#970747] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password (demo: kaira2026)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBDDE4] text-xs focus:outline-none focus:border-[#970747]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Access Management Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
