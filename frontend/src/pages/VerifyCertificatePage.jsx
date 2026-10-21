import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, Calendar, Clock, ArrowLeft, GraduationCap } from 'lucide-react';

export default function VerifyCertificatePage() {
  const { certificateNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/certificates/verify/${encodeURIComponent(certificateNumber)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || 'Certificate verification failed.');
          return;
        }

        setCertData(data.data);
      } catch (err) {
        setError('Unable to connect to certificate verification registry.');
      } finally {
        setLoading(false);
      }
    };

    if (certificateNumber) {
      fetchVerification();
    }
  }, [certificateNumber]);

  return (
    <div className="min-h-[85vh] bg-[#FAF5F7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#F1D3DE] shadow-xl overflow-hidden p-6 sm:p-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#970747] rounded-xl flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#1C1D1F]">
              Kaira<span className="text-[#970747]">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#1C1D1F] font-heading">
            Official Credential Verification
          </h1>
          <p className="text-xs text-[#52525B]">
            Authoritative registry validation for Kaira Webinar Hub Certificates
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#970747] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-zinc-500">Querying digital credential registry...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-red-900">Certificate Not Found</h3>
            <p className="text-xs text-red-700 leading-relaxed max-w-sm mx-auto">
              {error}
            </p>
            <div className="pt-2">
              <Link to="/" className="btn-primary py-2 px-4 text-xs font-bold rounded-xl inline-block">
                Return to Home
              </Link>
            </div>
          </div>
        ) : certData ? (
          <div className="space-y-6">
            
            {/* Verified Badge Header */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Authentic & Verified Credential
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  This certificate was issued by Kaira Webinar Hub upon 100% course completion and passed section assessments.
                </p>
              </div>
            </div>

            {/* Credential Data Card */}
            <div className="bg-[#FAF5F7] border border-[#F1D3DE] rounded-2xl p-6 space-y-4 text-xs">
              
              <div className="flex justify-between items-start border-b border-[#F1D3DE] pb-3">
                <span className="text-zinc-500 font-medium">Certificate ID</span>
                <span className="font-mono font-bold text-[#970747] text-sm">{certData.certificateNumber}</span>
              </div>

              <div className="flex justify-between items-start border-b border-[#F1D3DE] pb-3">
                <span className="text-zinc-500 font-medium">Recipient</span>
                <strong className="text-[#1C1D1F] text-sm">{certData.studentName}</strong>
              </div>

              <div className="flex justify-between items-start border-b border-[#F1D3DE] pb-3">
                <span className="text-zinc-500 font-medium">Course Title</span>
                <strong className="text-[#1C1D1F] text-right max-w-xs">{certData.courseTitle}</strong>
              </div>

              <div className="flex justify-between items-center border-b border-[#F1D3DE] pb-3">
                <span className="text-zinc-500 font-medium">Instructor</span>
                <span className="text-zinc-800 font-semibold">{certData.instructorName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-[#F1D3DE] pb-3">
                <span className="text-zinc-500 font-medium">Issue Date</span>
                <span className="text-zinc-800 font-semibold">
                  {new Date(certData.issueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Issuing Authority</span>
                <span className="text-[#970747] font-bold">{certData.issuer}</span>
              </div>

            </div>

            <div className="text-center pt-2">
              <Link to="/my-learning" className="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm">
                <span>View in My Learning</span>
              </Link>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
