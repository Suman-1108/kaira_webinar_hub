import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Award, CheckCircle2, ArrowRight, Loader2, Video, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEnrollment } from '../../context/EnrollmentContext';
import { getApiUrl } from '../../services/api';

export default function CourseActionButton({ 
  course, 
  variant = 'compact', // 'compact' | 'full' | 'hero'
  className = '',
  onBeforeAction
}) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { loading: checkingOwnership, checkOwnership, refreshEnrollments } = useEnrollment();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!course) return null;

  const id = course.id || course.slug || course.courseId;
  const isWebinarEvent = !!course.date && !!course.time;
  const ownership = checkOwnership(id);
  const isEnrolled = !!ownership?.isEnrolled;
  const isCompleted = !!ownership?.isCompleted || ownership?.completionPercentage === 100;
  const isFree = course.price === 0;

  // Loading skeleton state
  if (checkingOwnership) {
    return (
      <div className={`animate-pulse bg-slate-200/80 rounded-xl h-10 w-full flex items-center justify-center text-xs text-slate-400 font-semibold ${className}`}>
        Checking status...
      </div>
    );
  }

  // 1. If Course is ENROLLED and COMPLETED -> Completed / View Certificate
  if (isEnrolled && isCompleted) {
    return (
      <div className={`flex flex-col sm:flex-row items-stretch gap-2 ${className}`}>
        <button
          onClick={() => navigate(`/course/${id}/learn`)}
          className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
          title="Review course material"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Completed</span>
        </button>

        <button
          onClick={() => navigate(`/course/${id}/learn?tab=certificate`)}
          className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#970747] text-white hover:bg-[#80063c] flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>View Certificate</span>
        </button>
      </div>
    );
  }

  // 2. If Course/Webinar is ENROLLED and IN PROGRESS -> Continue Learning (or Join Webinar)
  if (isEnrolled) {
    if (isWebinarEvent && course.meetingUrl) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <a
            href={course.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Video className="w-4 h-4" />
            <span>Join Webinar</span>
          </a>
          <button
            onClick={() => navigate(`/course/${id}/learn`)}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1"
            title="Course Materials"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => navigate(`/course/${id}/learn`)}
        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#970747] hover:bg-[#80063c] text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer ${className}`}
      >
        <Play className="w-4 h-4 fill-current text-white" />
        <span>Continue Learning</span>
        {ownership?.completionPercentage > 0 && (
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
            {ownership.completionPercentage}%
          </span>
        )}
      </button>
    );
  }

  // 3. User is NOT ENROLLED: Show "Buy Now — ₹{price}" or "Enroll Free" / "Register"
  const handleEnrollFree = async (e) => {
    e?.preventDefault();
    if (onBeforeAction) onBeforeAction();

    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/course/${id}/learn`)}`);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(getApiUrl('/api/v1/learning/enroll-free'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kaira_enrollment_updated'));
        }
        await refreshEnrollments();
        navigate(`/course/${id}/learn`);
      } else {
        alert(data.message || 'Could not enroll in free course.');
      }
    } catch (err) {
      alert(err.message || 'Network error enrolling in free course.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNow = (e) => {
    e?.preventDefault();
    if (onBeforeAction) onBeforeAction();

    // If unauthenticated, redirect to login with destination
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/webinars/${course.slug || id}?register=true`)}`);
      return;
    }

    // Direct to course/webinar registration checkout modal or detail view
    navigate(`/webinars/${course.slug || id}?register=true`);
  };

  if (isFree) {
    return (
      <button
        onClick={handleEnrollFree}
        disabled={isProcessing}
        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#15803D] hover:bg-[#166534] text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enrolling...</span>
          </>
        ) : (
          <>
            <span>{isWebinarEvent ? 'Register Free Pass' : 'Enroll Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleBuyNow}
      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#970747] hover:bg-[#80063c] text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer ${className}`}
    >
      <ShoppingCart className="w-4 h-4" />
      <span>{isWebinarEvent ? `Register Pass — ₹${course.price}` : `Buy Now — ₹${course.price}`}</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}
