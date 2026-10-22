import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  Mail, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function SuccessReceiptModal({ registrationId, isOpen, onClose }) {
  if (!isOpen || !registrationId) return null;

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchReceipt() {
      try {
        setLoading(true);
        const res = await fetch(`/api/registration/receipt/${registrationId}`);
        const data = await res.json();
        if (data.success) {
          setReceipt(data.data);
        }
      } catch (err) {
        console.error('Receipt fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReceipt();
  }, [registrationId]);

  const copyJoiningLink = () => {
    if (receipt?.joiningLink) {
      navigator.clipboard.writeText(receipt.joiningLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EBDDE4] overflow-hidden my-8 print:shadow-none print:border-none">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#970747] to-[#D63384] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors print:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-full bg-white text-[#970747] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-[#970747]" />
          </div>

          <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-0.5 rounded-full bg-white/20 text-white font-mono inline-block mb-1">
            VERIFIED & CONFIRMED
          </span>

          <h3 className="font-heading font-black text-2xl text-white">
            Registration Successful!
          </h3>
          <p className="text-xs text-[#F7DCE8] mt-1">
            Your virtual entry pass has been generated and validated by our server.
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#970747] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#66545D]">Retrieving verified pass credentials...</p>
            </div>
          ) : receipt ? (
            <>
              {/* Pass Card with QR Code */}
              <div className="p-6 rounded-2xl bg-[#FDF5F8] border border-[#EBDDE4] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-left space-y-2 flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-[#970747] uppercase tracking-wider">
                      Pass Number
                    </span>
                    <p className="font-mono font-bold text-lg text-[#25171E]">
                      {receipt.registrationId}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#66545D] uppercase tracking-wider">
                      Attendee Name
                    </span>
                    <p className="font-bold text-sm text-[#25171E]">
                      {receipt.fullName}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#66545D] uppercase tracking-wider">
                      Tier & Invoice
                    </span>
                    <p className="text-xs text-[#66545D]">
                      {receipt.ticketType} • <span className="font-mono text-[#970747]">{receipt.invoiceNumber}</span>
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="p-3 bg-white rounded-xl border border-[#EBDDE4] shadow-xs shrink-0 text-center">
                  <QRCodeSVG 
                    value={JSON.stringify({
                      pass: receipt.registrationId,
                      name: receipt.fullName,
                      webinar: receipt.webinarTitle,
                      verified: true
                    })} 
                    size={105}
                    level="H"
                    fgColor="#25171E"
                  />
                  <span className="text-[9px] font-mono text-[#66545D] mt-1 block">SCAN TO ENTER</span>
                </div>
              </div>

              {/* Webinar Title and Schedule */}
              <div className="space-y-2 text-left border-b border-[#EBDDE4] pb-5">
                <h4 className="font-heading font-black text-lg text-[#25171E]">
                  {receipt.webinarTitle}
                </h4>
                <div className="flex flex-wrap gap-4 text-xs text-[#66545D]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#970747]" />
                    {receipt.webinar?.date || 'Confirmed Season Date'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#970747]" />
                    {receipt.webinar?.time || 'Live Broadcast'}
                  </span>
                </div>
              </div>

              {/* Secure Joining Link Box */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-[#970747]">
                  Your Secure Live Streaming Link:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={receipt.joiningLink}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FDF5F8] border border-[#EBDDE4] text-xs font-mono text-[#25171E] select-all"
                  />
                  <button
                    onClick={copyJoiningLink}
                    className="px-4 py-2.5 rounded-xl bg-[#970747] text-white hover:bg-[#80053b] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Notifications Dispatched */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Confirmation Sent</p>
                    <p className="text-[10px] text-emerald-700">{receipt.email}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[#5f259f] text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5f259f] shrink-0" />
                  <div>
                    <p className="font-bold">Pass Secured</p>
                    <p className="text-[10px] text-[#5f259f]/80">PhonePe PG v2 / Verified</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 print:hidden">
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-full border border-[#EBDDE4] hover:bg-[#FDF5F8] text-xs font-semibold text-[#25171E] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#970747]" />
                  <span>Download / Print Pass</span>
                </button>

                <button
                  onClick={onClose}
                  className="btn-primary px-7 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-red-600">Could not find receipt details.</p>
          )}
        </div>

      </div>
    </div>
  );
}
