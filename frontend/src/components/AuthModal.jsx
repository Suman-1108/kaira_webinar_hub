import React, { useState } from 'react';
import { X, User, Lock, Search, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onViewPass, onOpenAdmin }) {
  const { login } = useAuth();
  if (!isOpen) return null;

  const [mode, setMode] = useState('lookup'); // 'lookup' or 'admin'
  const [passId, setPassId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login('admin@kairawebinarhub.com', adminPassword);
      onClose();
      onOpenAdmin();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrator password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EBDDE4] overflow-hidden my-8">
        
        {/* Banner */}
        <div className="bg-[#970747] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
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

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-[#EBDDE4] bg-[#FDF5F8]">
          <button
            onClick={() => { setMode('lookup'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'lookup' 
                ? 'text-[#970747] border-b-2 border-[#970747] bg-white' 
                : 'text-[#66545D] hover:text-[#970747]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Pass Lookup</span>
          </button>

          <button
            onClick={() => { setMode('admin'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'admin' 
                ? 'text-[#970747] border-b-2 border-[#970747] bg-white' 
                : 'text-[#66545D] hover:text-[#970747]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{errorMsg}</span>
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
                <p className="text-[10px] text-[#66545D] mt-1">
                  Check your confirmation email for the 13-character Pass ID.
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
                    placeholder="Enter administrator password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBDDE4] text-xs focus:outline-none focus:border-[#970747]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Authenticating...' : 'Access Management Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#EBDDE4] flex items-center justify-center gap-2 text-[11px] text-[#66545D]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secured with cryptographic ticket verification</span>
          </div>
        </div>

      </div>
    </div>
  );
}
