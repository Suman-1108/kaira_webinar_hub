import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft, 
  Share2, 
  MoreVertical, 
  FileText, 
  Video, 
  Download, 
  Sparkles, 
  Clock, 
  Award, 
  Star, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  X,
  Menu,
  Check,
  HelpCircle,
  Lock,
  RefreshCw,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState({
    completedLessonIds: [],
    passedSectionIds: [],
    completedLessonCount: 0,
    totalTrackableLessonCount: 0,
    completionPercentage: 0,
    isCourseCompleted: false,
    lastAccessedLessonId: '',
    lessonProgress: []
  });
  const [notes, setNotes] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // overview, notes, announcements, reviews, tools
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  // Unenrolled Gate State
  const [notEnrolledData, setNotEnrolledData] = useState(null);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [enrollingFree, setEnrollingFree] = useState(false);

  // Quiz Modal State
  const [activeQuizSection, setActiveQuizSection] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Certificate Modal State
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

  // Video state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showProgressDropdown, setShowProgressDropdown] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);

  // New Note state
  const [newNoteText, setNewNoteText] = useState('');

  // Learning reminder state
  const [reminderSaved, setReminderSaved] = useState(false);
  const [reminderTime, setReminderTime] = useState('12:00 PM');
  const [reminderDays, setReminderDays] = useState(['Mo', 'Tu', 'We', 'Th', 'Fr']);

  const playerContainerRef = useRef(null);
  const lastSaveTimeRef = useRef(0);

  // Flattened trackable lessons list
  const allLessons = useMemo(() => {
    const list = [];
    if (!curriculum) return list;
    curriculum.forEach(section => {
      if (section.lessons) {
        section.lessons.forEach(lesson => {
          list.push({ ...lesson, sectionTitle: section.title, sectionId: section.sectionId, isSectionLocked: section.isLocked });
        });
      }
    });
    return list;
  }, [curriculum]);

  // Current lesson index in all lessons
  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return allLessons.findIndex(l => l.lessonId === activeLesson.lessonId);
  }, [activeLesson, allLessons]);

  // Fetch course details & progress
  const fetchCourse = async () => {
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/course/${courseId}/learn`)}`);
      return;
    }

    try {
      setLoading(true);
      setErrorNotice(null);
      const res = await fetch(`/api/learning/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.code === 'PAYMENT_REQUIRED') {
          setNotEnrolledData({
            courseId: data.courseId,
            title: data.title,
            price: data.price,
            thumbnail: data.thumbnail,
            message: data.message
          });
          setLoading(false);
          return;
        }
        throw new Error(data.message || 'Failed to load course');
      }

      setNotEnrolledData(null);
      const { course, curriculum: curr, progress: prog, notes: userNotes } = data.data;
      setCourseData(course);
      setCurriculum(curr || []);
      setProgress(prog || {
        completedLessonIds: [],
        passedSectionIds: [],
        completedLessonCount: 0,
        totalTrackableLessonCount: 0,
        completionPercentage: 0
      });
      setNotes(userNotes || []);

      // Flatten lessons to find starting lesson
      const flatLessons = [];
      (curr || []).forEach(s => s.lessons && flatLessons.push(...s.lessons));

      let startLesson = null;
      if (prog?.lastAccessedLessonId) {
        startLesson = flatLessons.find(l => l.lessonId === prog.lastAccessedLessonId);
      }
      if (!startLesson && flatLessons.length > 0) {
        startLesson = flatLessons.find(l => !(prog?.completedLessonIds || []).includes(l.lessonId)) || flatLessons[0];
      }

      setActiveLesson(startLesson);
    } catch (err) {
      console.error('Course load error:', err);
      setErrorNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId, token]);

  // Video position resume
  useEffect(() => {
    if (!activeLesson || !videoRef.current) return;

    const lp = (progress.lessonProgress || []).find(p => p.lessonId === activeLesson.lessonId);
    const resumePos = lp?.lastPositionSeconds || 0;

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration || activeLesson.durationSeconds || 0);
        if (resumePos > 0 && resumePos < (videoRef.current.duration - 5)) {
          videoRef.current.currentTime = resumePos;
          setCurrentTime(resumePos);
        }
      }
    };

    const vid = videoRef.current;
    vid.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [activeLesson, progress.lessonProgress]);

  // Periodic progress saving
  const saveProgressToBackend = async (pos, dur) => {
    if (!activeLesson || !token || !pos) return;
    try {
      await fetch('/api/learning/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          lessonId: activeLesson.lessonId,
          positionSeconds: Math.floor(pos),
          durationSeconds: Math.floor(dur || duration)
        })
      });
    } catch (err) {
      console.warn('Silent progress save error:', err.message);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pos = videoRef.current.currentTime;
    setCurrentTime(pos);

    const now = Date.now();
    if (now - lastSaveTimeRef.current > 12000) {
      lastSaveTimeRef.current = now;
      saveProgressToBackend(pos, videoRef.current.duration);
    }

    // Auto mark complete when watching 90% of lesson
    if (duration > 15 && pos / duration >= 0.92 && !progress.completedLessonIds.includes(activeLesson?.lessonId)) {
      handleToggleComplete(activeLesson.lessonId, true);
    }
  };

  // Video playback controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video playback deferred or source not ready:', err.message);
        });
      }
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      saveProgressToBackend(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      saveProgressToBackend(target, duration);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Toggle lesson complete in backend
  const handleToggleComplete = async (lessonId, targetCompleted) => {
    if (!token) return;
    const isNowCompleted = targetCompleted !== undefined 
      ? targetCompleted 
      : !progress.completedLessonIds.includes(lessonId);

    // Optimistic UI update
    let updatedCompletedIds = [...progress.completedLessonIds];
    if (isNowCompleted) {
      if (!updatedCompletedIds.includes(lessonId)) updatedCompletedIds.push(lessonId);
    } else {
      updatedCompletedIds = updatedCompletedIds.filter(id => id !== lessonId);
    }

    setProgress(prev => ({
      ...prev,
      completedLessonIds: updatedCompletedIds,
      completedLessonCount: updatedCompletedIds.length
    }));

    try {
      const res = await fetch('/api/learning/complete-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          completed: isNowCompleted
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProgress(prev => ({
          ...prev,
          completedLessonIds: data.data.completedLessonIds,
          completedLessonCount: data.data.completedLessonCount,
          totalTrackableLessonCount: data.data.totalTrackableLessonCount,
          completionPercentage: data.data.completionPercentage,
          isCourseCompleted: data.data.isCourseCompleted,
          courseCompletedAt: data.data.courseCompletedAt
        }));
        // Re-fetch curriculum to update section quiz unlock flags
        fetchCourse();
      }
    } catch (err) {
      console.warn('Failed to sync lesson completion:', err);
    }
  };

  const switchLesson = (lesson) => {
    if (lesson.isLocked) {
      alert('This section is locked. Please complete prior sections and pass their assessments first.');
      return;
    }
    if (videoRef.current) {
      saveProgressToBackend(videoRef.current.currentTime, videoRef.current.duration);
    }
    setActiveLesson(lesson);
    setIsPlaying(false);
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      switchLesson(allLessons[currentLessonIndex + 1]);
    }
  };

  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      switchLesson(allLessons[currentLessonIndex - 1]);
    }
  };

  // Notes
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeLesson || !token) return;

    try {
      const res = await fetch('/api/learning/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          lessonId: activeLesson.lessonId,
          lessonTitle: activeLesson.title,
          timestampSeconds: Math.floor(currentTime),
          text: newNoteText.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNotes([data.data, ...notes]);
        setNewNoteText('');
      }
    } catch (err) {
      console.error('Note add error:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!token) return;
    try {
      await fetch(`/api/learning/notes/${courseId}/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(n => n._id !== noteId));
    } catch (err) {
      console.error('Note delete error:', err);
    }
  };

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: courseData?.title || 'Kaira Webinar Hub Masterclass',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Course learning link copied to clipboard!');
    }
  };

  // Section Quiz Handlers
  const handleOpenQuiz = async (section) => {
    setActiveQuizSection(section);
    setQuizResult(null);
    setQuizAnswers({});
    setQuizLoading(true);

    try {
      const res = await fetch(`/api/learning/quiz/${courseId}/${section.sectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not load section assessment');
      }
      setQuizData(data.data.quiz);
    } catch (err) {
      alert(err.message);
      setActiveQuizSection(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuizSection || !quizData || quizSubmitting) return;

    const formattedAnswers = (quizData.questions || []).map(q => ({
      questionId: q.questionId,
      selectedOption: quizAnswers[q.questionId] !== undefined ? quizAnswers[q.questionId] : -1
    }));

    const unanswered = formattedAnswers.some(a => a.selectedOption === -1);
    if (unanswered) {
      alert('Please select an answer for every assessment question.');
      return;
    }

    setQuizSubmitting(true);
    try {
      const res = await fetch(`/api/learning/quiz/${courseId}/${activeQuizSection.sectionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Assessment evaluation failed');
      }

      setQuizResult(data.data);
      if (data.data.passed) {
        // Refresh curriculum and unlocks
        fetchCourse();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Certificate Modal Handlers
  const handleOpenCertificate = async () => {
    setCertificateModalOpen(true);
    setCertificateLoading(true);
    try {
      const res = await fetch(`/api/learning/certificate/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Certificate requirements not completed yet.');
      }
      setCertificateData(data.data);
    } catch (err) {
      alert(err.message);
      setCertificateModalOpen(false);
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const res = await fetch(`/api/learning/certificate/${courseId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download certificate PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await fetch(`/api/learning/invoice/${courseId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download invoice PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  // Buy Now (PhonePe Standard Checkout)
  const handleBuyCourse = async () => {
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/course/${courseId}/learn`)}`);
      return;
    }
    setInitiatingPayment(true);
    try {
      const regRes = await fetch('/api/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          webinarId: notEnrolledData?.courseId || courseId,
          fullName: user.name || 'Valued Student',
          email: user.email,
          phone: user.phone || '9876543210',
          ticketType: 'VIP Masterclass Pass',
          paymentProvider: 'phonepe'
        })
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.message || 'Could not initiate registration.');
      }

      const peRes = await fetch('/api/payments/phonepe/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ registrationId: regData.registrationId })
      });
      const peData = await peRes.json();
      if (!peRes.ok || !peData.success || !peData.redirectUrl) {
        throw new Error(peData.message || 'PhonePe payment checkout could not be created.');
      }

      window.location.href = peData.redirectUrl;
    } catch (err) {
      alert(err.message);
    } finally {
      setInitiatingPayment(false);
    }
  };

  // Free Course Enrollment
  const handleEnrollFree = async () => {
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/course/${courseId}/learn`)}`);
      return;
    }
    setEnrollingFree(true);
    try {
      const res = await fetch('/api/learning/enroll-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: notEnrolledData?.courseId || courseId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Free enrollment failed');
      }
      setNotEnrolledData(null);
      fetchCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrollingFree(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1D1F] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-3 border-[#970747] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-zinc-300">
          Loading learning space & course curriculum...
        </p>
      </div>
    );
  }

  // Not Purchased / Enrollment Gate Screen
  if (notEnrolledData) {
    const isFree = notEnrolledData.price === 0;

    return (
      <div className="min-h-screen bg-[#FAF5F7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-[#F1D3DE] shadow-xl overflow-hidden p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#970747] uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Course Access Required</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <img
              src={notEnrolledData.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'}
              alt={notEnrolledData.title}
              className="w-full sm:w-56 aspect-video object-cover rounded-2xl shadow-md border border-[#F1D3DE]"
            />
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-black text-[#1C1D1F] font-heading leading-snug">
                {notEnrolledData.title}
              </h2>
              <p className="text-xs text-[#52525B] leading-relaxed">
                To stream lessons, take required section assessments, and earn your accredited Certificate of Completion, complete your individual enrollment below.
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black text-[#970747]">
                  {isFree ? 'Free Pass' : `₹${notEnrolledData.price}.00`}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#FAF5F7] border border-[#F1D3DE] rounded-2xl space-y-2 text-xs text-[#52525B]">
            <div className="flex items-center gap-2 font-bold text-[#1C1D1F]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>What is included with individual course purchase:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Full HD lectures & interactive code
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Required section examinations
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Verified Certificate of Completion
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Official Tax Invoice with GST receipt
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isFree ? (
              <button
                onClick={handleEnrollFree}
                disabled={enrollingFree}
                className="btn-primary flex-1 py-3 px-6 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {enrollingFree ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>Enroll for Free & Start Learning</span>
              </button>
            ) : (
              <button
                onClick={handleBuyCourse}
                disabled={initiatingPayment}
                className="btn-primary flex-1 py-3 px-6 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {initiatingPayment ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                <span>Buy Now with PhonePe (₹{notEnrolledData.price})</span>
              </button>
            )}

            <Link
              to="/webinars"
              className="py-3 px-5 text-xs font-bold rounded-xl border border-[#F1D3DE] bg-white hover:bg-[#FAF5F7] text-zinc-700 text-center"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1D1F] text-white flex flex-col font-sans">
      
      {/* 1. Header Bar */}
      <header className="h-14 bg-[#1C1D1F] border-b border-[#2D2F31] px-4 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: Back Arrow + Course Title */}
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <Link
            to="/my-learning"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2D2F31] transition-colors shrink-0"
            title="Back to My Learning"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="h-5 w-px bg-[#3E4143] shrink-0" />

          <h1 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
            {courseData?.title}
          </h1>
        </div>

        {/* Right: Progress Indicator + Share + Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          
          {/* Progress Circular Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProgressDropdown(!showProgressDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2D2F31] hover:bg-[#3E4143] text-xs font-bold transition-colors cursor-pointer border border-[#3E4143]"
            >
              <div className="relative w-4 h-4">
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-700"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#970747]"
                    strokeDasharray={`${progress.completionPercentage}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <span className="hidden md:inline text-zinc-300">Your progress</span>
              <span className="text-white font-extrabold">{progress.completionPercentage}%</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {showProgressDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-[#2D2F31] border border-[#3E4143] rounded-xl p-4 shadow-2xl z-50 text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Course Progress</span>
                  <span className="text-[#F1D3DE] font-black">{progress.completionPercentage}%</span>
                </div>
                
                <div className="w-full bg-[#1C1D1F] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#970747] to-[#C71F6E] h-full transition-all duration-300"
                    style={{ width: `${progress.completionPercentage}%` }}
                  />
                </div>

                <div className="space-y-1 text-zinc-300 text-[11px]">
                  <p>• {progress.completedLessonCount} of {progress.totalTrackableLessonCount} lectures completed</p>
                  <p>• {progress.passedSectionIds?.length || 0} of {curriculum.length} section assessments passed</p>
                </div>

                {progress.isCourseCompleted ? (
                  <div className="pt-2 border-t border-[#3E4143] text-center space-y-2">
                    <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <Award className="w-4 h-4" /> Certificate Ready!
                    </span>
                    <button
                      onClick={handleOpenCertificate}
                      className="btn-primary w-full py-1.5 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      View & Download Certificate
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 pt-1 border-t border-[#3E4143]">
                    Complete all lectures and pass every section quiz (80%+) to earn your accredited Certificate of Completion.
                  </p>
                )}

                <button
                  onClick={handleDownloadInvoice}
                  className="w-full py-1.5 bg-[#1C1D1F] hover:bg-black text-zinc-300 hover:text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#3E4143]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Tax Invoice (PDF)</span>
                </button>
              </div>
            )}
          </div>

          {/* Certificate Fast Button if 100% complete */}
          {progress.isCourseCompleted && (
            <button
              onClick={handleOpenCertificate}
              className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Certificate</span>
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2D2F31] transition-colors cursor-pointer"
            title="Share Course"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2D2F31] transition-colors cursor-pointer"
            title={sidebarOpen ? 'Hide Course Curriculum' : 'Show Course Curriculum'}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </header>

      {/* 2. Main 2-Column Desktop Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT / CENTER: Video Player Area + Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-black">
          
          {/* A. 16:9 Video Player Screen */}
          <div 
            ref={playerContainerRef}
            onMouseEnter={() => setIsHoveringControls(true)}
            onMouseLeave={() => setIsHoveringControls(false)}
            className="relative w-full aspect-video bg-black flex items-center justify-center group overflow-hidden select-none"
          >
            <video
              ref={videoRef}
              src={activeLesson?.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4"}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
            />

            {/* Big Center Play Icon overlay when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 hover:bg-[#970747] text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-2xl"
              >
                <Play className="w-7 h-7 fill-current ml-1" />
              </button>
            )}

            {/* Custom Control Bar */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 flex flex-col gap-2 ${
                isHoveringControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Seekbar */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[#970747]"
              />

              <div className="flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="hover:text-white cursor-pointer">
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button onClick={toggleMute} className="hover:text-white cursor-pointer">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[#970747]"
                    />
                  </div>

                  <span className="text-[11px] font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Speed Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-2 py-1 rounded hover:bg-white/10 font-mono text-[11px] font-bold"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-8 right-0 bg-[#2D2F31] border border-[#3E4143] rounded-lg shadow-xl p-1 z-50 text-[11px] flex flex-col min-w-16">
                        {[0.75, 1, 1.25, 1.5, 2].map(s => (
                          <button
                            key={s}
                            onClick={() => handleSpeedChange(s)}
                            className={`px-3 py-1 text-left rounded hover:bg-[#3E4143] ${
                              playbackSpeed === s ? 'text-[#F1D3DE] font-bold' : 'text-zinc-300'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="hover:text-white cursor-pointer">
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* B. Lesson Navigation Strip */}
          <div className="bg-[#1C1D1F] border-b border-[#2D2F31] px-6 py-3 flex items-center justify-between">
            <button
              onClick={goToPrevLesson}
              disabled={currentLessonIndex <= 0}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous Lecture</span>
            </button>

            <span className="text-xs font-bold text-zinc-300 truncate max-w-xs sm:max-w-md">
              {activeLesson?.title || 'Lecture Module'}
            </span>

            <button
              onClick={goToNextLesson}
              disabled={currentLessonIndex >= allLessons.length - 1}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
            >
              <span className="hidden sm:inline">Next Lecture</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* C. Tabs Header Bar */}
          <div className="bg-[#1C1D1F] border-b border-[#2D2F31] px-6 flex gap-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'notes', label: `Notes (${notes.length})` },
              { id: 'announcements', label: 'Announcements' },
              { id: 'tools', label: 'Learning tools & schedule' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#970747] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* D. Tab Content Area */}
          <div className="p-6 max-w-4xl space-y-6 text-zinc-300">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{courseData?.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{courseData?.tagline}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-300">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-current" /> {courseData?.rating || 4.8}
                    </span>
                    <span className="text-zinc-400">({courseData?.reviewsCount || 140} ratings)</span>
                    <span className="text-zinc-400">{courseData?.duration || '2.5 hours total'}</span>
                    <span className="text-zinc-400">Language: {courseData?.language || 'English'}</span>
                  </div>
                </div>

                {/* Progress Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#2D2F31] p-3 rounded-xl border border-[#3E4143]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Lectures</span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      {progress.completedLessonCount} / {progress.totalTrackableLessonCount}
                    </span>
                  </div>
                  <div className="bg-[#2D2F31] p-3 rounded-xl border border-[#3E4143]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Section Quizzes</span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      {progress.passedSectionIds?.length || 0} / {curriculum.length} Passed
                    </span>
                  </div>
                  <div className="bg-[#2D2F31] p-3 rounded-xl border border-[#3E4143]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Assessment Rule</span>
                    <span className="text-xs font-bold text-white mt-1 block">80% Passing Score</span>
                  </div>
                  <div className="bg-[#2D2F31] p-3 rounded-xl border border-[#3E4143]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Credential</span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      {progress.isCourseCompleted ? 'Earned' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* What You'll Learn */}
                {courseData?.outcomes && courseData.outcomes.length > 0 && (
                  <div className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1D3DE] mb-3">
                      Course Curriculum Outcomes
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {courseData.outcomes.map((out, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{out}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Description</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                    {courseData?.description}
                  </p>
                </div>

                {/* Instructor Profile */}
                {courseData?.speaker && (
                  <div className="border-t border-[#3E4143] pt-5 flex items-start gap-4">
                    <img
                      src={courseData.speaker.avatar}
                      alt={courseData.speaker.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#970747]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{courseData.speaker.name}</h4>
                      <p className="text-xs text-[#F1D3DE] font-semibold">{courseData.speaker.role} • {courseData.speaker.company}</p>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{courseData.speaker.bio}</p>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 2. NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <form onSubmit={handleAddNote} className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      Add note at <span className="text-[#F1D3DE] bg-[#970747]/20 px-2 py-0.5 rounded font-mono font-bold">{formatTime(currentTime)}</span>
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate max-w-xs">{activeLesson?.title}</span>
                  </div>

                  <textarea
                    rows="3"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type your notes or key takeaways here..."
                    className="w-full px-3 py-2 bg-[#1C1D1F] border border-[#3E4143] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#970747]"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-[#3E4143] pb-2">
                    <span className="font-bold text-white">Your Notes ({notes.length})</span>
                  </div>

                  {notes.length === 0 ? (
                    <div className="p-8 text-center bg-[#2D2F31]/50 rounded-2xl border border-[#3E4143] space-y-2">
                      <FileText className="w-8 h-8 text-zinc-500 mx-auto" />
                      <p className="text-xs text-zinc-400">You haven't added any notes yet.</p>
                    </div>
                  ) : (
                    notes.map(note => (
                      <div key={note._id} className="p-4 bg-[#2D2F31] border border-[#3E4143] rounded-xl flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = note.timestampSeconds;
                                setCurrentTime(note.timestampSeconds);
                              }
                            }}
                            className="text-[#F1D3DE] font-mono font-bold bg-[#970747]/20 px-2 py-0.5 rounded hover:underline cursor-pointer"
                          >
                            {formatTime(note.timestampSeconds)}
                          </button>
                          <p className="text-white mt-1 leading-relaxed">{note.text}</p>
                          <span className="text-[10px] text-zinc-400 block">{note.lessonTitle}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. ANNOUNCEMENTS TAB */}
            {activeTab === 'announcements' && (
              <div className="space-y-4">
                {(courseData?.announcements || []).map((ann, i) => (
                  <div key={i} className="p-5 bg-[#2D2F31] border border-[#3E4143] rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={ann.avatar} alt={ann.author} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <strong className="text-white block">{ann.author}</strong>
                        <span className="text-[10px] text-zinc-400">{ann.date}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-sm pt-1">{ann.title}</h4>
                    <p className="text-zinc-300 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 4. LEARNING TOOLS TAB */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                <div className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#970747]/20 border border-[#970747]/40 text-[#F1D3DE] flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-[#F1D3DE]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Learning Reminders</h4>
                      <p className="text-xs text-zinc-400">Set time aside to learn and receive automatic reminder notifications.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div>
                        <label className="text-[11px] text-zinc-400 uppercase font-bold block mb-1">Time</label>
                        <input
                          type="text"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="px-3 py-2 bg-[#1C1D1F] border border-[#3E4143] rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 uppercase font-bold block mb-1">Frequency Days</label>
                        <div className="flex gap-1.5">
                          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setReminderDays(prev => 
                                  prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                );
                              }}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                reminderDays.includes(day)
                                  ? 'bg-[#970747] text-white'
                                  : 'bg-[#1C1D1F] text-zinc-400 border border-[#3E4143]'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReminderSaved(true);
                        setTimeout(() => setReminderSaved(false), 3000);
                      }}
                      className="btn-primary py-2 px-4 text-xs font-bold rounded-xl mt-2"
                    >
                      {reminderSaved ? 'Reminder Configured!' : 'Save Learning Schedule'}
                    </button>
                  </div>
                </div>

                {/* Lesson Resources */}
                <div className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Lesson Resources & Downloads</h4>
                  {activeLesson?.resources && activeLesson.resources.length > 0 ? (
                    <div className="space-y-2">
                      {activeLesson.resources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-[#1C1D1F] border border-[#3E4143] hover:border-[#970747] transition-all text-xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Download className="w-4 h-4 text-[#F1D3DE] group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-white">{res.title}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400">No external downloads required for this specific lecture.</p>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Course Content Curriculum Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 sm:w-96 bg-[#1C1D1F] border-l border-[#2D2F31] flex flex-col shrink-0 z-20 overflow-hidden">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#2D2F31] flex items-center justify-between shrink-0">
              <h3 className="font-black text-sm text-white">Course content</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-[#2D2F31] transition-colors cursor-pointer"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Curriculum Accordions list */}
            <div className="flex-1 overflow-y-auto">
              {curriculum.map((section, secIdx) => {
                const isCollapsed = !!collapsedSections[section.sectionId];
                const sectionLessons = section.lessons || [];
                const completedCount = sectionLessons.filter(l => progress.completedLessonIds.includes(l.lessonId)).length;
                const isSectionLocked = section.isLocked;

                return (
                  <div key={section.sectionId || secIdx} className="border-b border-[#2D2F31]">
                    
                    {/* Section Accordion Header */}
                    <button
                      onClick={() => toggleSection(section.sectionId)}
                      className={`w-full p-4 text-left transition-colors flex items-center justify-between cursor-pointer ${
                        isSectionLocked 
                          ? 'bg-[#18191B] opacity-60' 
                          : 'bg-[#242729] hover:bg-[#2D2F31]'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="flex items-center gap-1.5">
                          {isSectionLocked && <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {section.title}
                          </h4>
                        </div>
                        <span className="text-[11px] text-zinc-400 mt-0.5 block font-medium">
                          {completedCount} / {sectionLessons.length} | {section.duration || '20 min'}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                      }`} />
                    </button>

                    {/* Section Lessons List */}
                    {!isCollapsed && (
                      <div className="divide-y divide-[#242729]">
                        {sectionLessons.map(lesson => {
                          const isCompleted = progress.completedLessonIds.includes(lesson.lessonId);
                          const isActive = activeLesson?.lessonId === lesson.lessonId;
                          const isLocked = isSectionLocked || lesson.isLocked;

                          return (
                            <div
                              key={lesson.lessonId}
                              onClick={() => !isLocked && switchLesson(lesson)}
                              className={`p-3.5 flex items-start gap-3 transition-colors ${
                                isLocked 
                                  ? 'opacity-40 cursor-not-allowed'
                                  : isActive 
                                    ? 'bg-[#2D2F31] border-l-4 border-[#970747] cursor-pointer' 
                                    : 'hover:bg-[#242729] cursor-pointer'
                              }`}
                            >
                              {/* Checkbox */}
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleComplete(lesson.lessonId);
                                }}
                                className="mt-0.5 shrink-0 text-zinc-500 hover:text-white cursor-pointer disabled:cursor-not-allowed"
                                title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#970747] fill-[#970747]/20" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-500" />
                                )}
                              </button>

                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-snug ${
                                  isActive ? 'text-white font-bold' : 'text-zinc-300 font-medium'
                                }`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                                  <Video className="w-3 h-3 text-zinc-400" />
                                  <span>{lesson.duration}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Section Assessment Card */}
                        {section.quiz && (
                          <div className={`p-3.5 flex items-center justify-between border-t border-[#3E4143] ${
                            section.quiz.isPassed 
                              ? 'bg-emerald-950/25 text-emerald-400' 
                              : section.quiz.isUnlocked 
                                ? 'bg-[#970747]/15 text-[#F1D3DE]'
                                : 'opacity-40 text-zinc-500'
                          }`}>
                            <div className="flex items-center gap-2.5">
                              {section.quiz.isPassed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : section.quiz.isUnlocked ? (
                                <HelpCircle className="w-4 h-4 text-[#F1D3DE] shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                              )}
                              <div>
                                <div className="text-xs font-bold flex items-center gap-1.5">
                                  <span>Section Assessment</span>
                                  {section.quiz.isPassed && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-black">
                                      {section.quiz.bestScore}% PASSED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                  {section.quiz.isPassed 
                                    ? 'Assessment requirement satisfied'
                                    : section.quiz.isUnlocked 
                                      ? 'Score 80%+ to complete section'
                                      : 'Complete all section lectures to unlock'}
                                </p>
                              </div>
                            </div>

                            {section.quiz.isUnlocked && (
                              <button
                                onClick={() => handleOpenQuiz(section)}
                                className="btn-primary py-1 px-3 text-[11px] font-bold rounded-lg cursor-pointer shrink-0"
                              >
                                {section.quiz.isPassed ? 'Retake' : 'Start Quiz'}
                              </button>
                            )}
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </aside>
        )}

      </div>

      {/* 3. Section Quiz Modal */}
      {activeQuizSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1D1F] border border-[#3E4143] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#2D2F31] flex items-center justify-between shrink-0 bg-[#242729]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F1D3DE] block">
                  Knowledge Assessment • 80% Passing Score
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeQuizSection.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveQuizSection(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {quizLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-[#970747] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400">Loading assessment questions...</p>
                </div>
              ) : quizResult ? (
                /* Assessment Result View */
                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                    quizResult.passed 
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}>
                    <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-black/40">
                      {quizResult.passed ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-7 h-7 text-red-400" />
                      )}
                    </div>
                    <h4 className="text-lg font-black">
                      {quizResult.passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
                    </h4>
                    <p className="text-xs">
                      You scored <strong>{quizResult.score}%</strong> ({quizResult.correctCount} of {quizResult.totalQuestions} correct). Required: 80%.
                    </p>
                    {quizResult.passed && (
                      <p className="text-[11px] text-emerald-400 font-bold pt-1">
                        ✓ Section requirement satisfied. Next section has been unlocked!
                      </p>
                    )}
                  </div>

                  {/* Question Feedback Explanations */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase text-zinc-400">Question Review</h5>
                    {(quizResult.feedback || []).map((fb, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#242729] border border-[#3E4143] text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            fb.isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={fb.isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {fb.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-[11px] pt-1">{fb.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : quizData ? (
                /* Active Quiz Form View */
                <div className="space-y-6">
                  <p className="text-xs text-zinc-400">
                    Select the most accurate response for each question. You must achieve at least 80% to complete this section and unlock the next module.
                  </p>

                  <div className="space-y-6">
                    {(quizData.questions || []).map((q, qIdx) => (
                      <div key={q.questionId} className="bg-[#242729] border border-[#3E4143] rounded-2xl p-4 sm:p-5 space-y-3">
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-start gap-2">
                          <span className="text-[#F1D3DE] font-black">{qIdx + 1}.</span>
                          <span>{q.questionText}</span>
                        </h4>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[q.questionId] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(q.questionId, optIdx)}
                                className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#970747]/20 border border-[#970747] text-white font-semibold'
                                    : 'bg-[#1C1D1F] border border-[#3E4143] text-zinc-300 hover:border-zinc-500'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-[#970747] bg-[#970747]' : 'border-zinc-500'
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#2D2F31] bg-[#242729] flex justify-end gap-3 shrink-0">
              {quizResult ? (
                <div className="flex gap-2">
                  {!quizResult.passed && (
                    <button
                      onClick={() => {
                        setQuizResult(null);
                        setQuizAnswers({});
                      }}
                      className="px-4 py-2 bg-[#1C1D1F] hover:bg-black text-white text-xs font-bold rounded-xl border border-[#3E4143] cursor-pointer"
                    >
                      Retry Assessment
                    </button>
                  )}
                  <button
                    onClick={() => setActiveQuizSection(null)}
                    className="btn-primary px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveQuizSection(null)}
                    className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={quizSubmitting}
                    className="btn-primary px-6 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {quizSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Submit Assessment</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. Certificate Award Modal */}
      {certificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1D1F] border border-[#3E4143] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 text-center">
            
            <button
              onClick={() => setCertificateModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F1D3DE] block">
                Official Credential Awarded
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Certificate of Completion
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {courseData?.title}
              </p>
            </div>

            {certificateLoading ? (
              <div className="py-6 text-center">
                <div className="w-8 h-8 border-3 border-[#970747] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : certificateData ? (
              <div className="space-y-4">
                <div className="bg-[#242729] p-4 rounded-2xl border border-[#3E4143] text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-[#3E4143] pb-2">
                    <span className="text-zinc-400">Awarded To</span>
                    <strong className="text-white">{certificateData.studentName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#3E4143] pb-2">
                    <span className="text-zinc-400">Certificate ID</span>
                    <span className="font-mono text-[#F1D3DE] font-bold">{certificateData.certificateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Issuing Authority</span>
                    <span className="text-emerald-400 font-bold">✓ Officially Accredited</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownloadCertificate}
                    className="btn-primary flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF Certificate</span>
                  </button>

                  <Link
                    to={`/verify-certificate/${certificateData.certificateNumber}`}
                    target="_blank"
                    className="py-3 px-4 rounded-xl border border-[#3E4143] bg-[#242729] hover:bg-[#2D2F31] text-xs font-bold text-zinc-300 hover:text-white text-center"
                  >
                    Verify Publicly
                  </Link>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
}
