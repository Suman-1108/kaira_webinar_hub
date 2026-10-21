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
  Check
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
    completedLessonCount: 0,
    totalTrackableLessonCount: 0,
    completionPercentage: 0,
    lastAccessedLessonId: '',
    lessonProgress: []
  });
  const [notes, setNotes] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // overview, notes, announcements, reviews, tools
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

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
  const [notesFilter, setNotesFilter] = useState('all');

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
          list.push({ ...lesson, sectionTitle: section.title, sectionId: section.sectionId });
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
  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/course/${courseId}/learn`)}`);
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setErrorNotice(null);
        const res = await fetch(`/api/learning/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (data.code === 'PAYMENT_REQUIRED') {
            setErrorNotice('Payment Required: You are not enrolled in this masterclass yet.');
            setTimeout(() => {
              navigate(`/webinars/${courseId}?register=true`);
            }, 2500);
            return;
          }
          throw new Error(data.message || 'Failed to load course');
        }

        const { course, curriculum: curr, progress: prog, notes: userNotes } = data.data;
        setCourseData(course);
        setCurriculum(curr || []);
        setProgress(prog || {
          completedLessonIds: [],
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
          // Find first uncompleted lesson
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

    fetchCourse();
  }, [courseId, token, navigate]);

  // When active lesson changes, resume saved position
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

  // Periodic progress saving (throttled)
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
    } catch (e) {
      console.warn('Progress auto-save note:', e.message);
    }
  };

  // Video time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pos = videoRef.current.currentTime;
    setCurrentTime(pos);

    // Save every 12 seconds
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

  // Toggle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video playback deferred or source not yet ready:', err.message);
        });
      }
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      saveProgressToBackend(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  // Seek bar change
  const handleSeek = (e) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      saveProgressToBackend(target, duration);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Change Volume
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Change Playback Speed
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // Fullscreen toggle
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

    const total = progress.totalTrackableLessonCount || allLessons.length;
    const newPercentage = total > 0 ? Math.min(100, Math.round((updatedCompletedIds.length / total) * 100)) : 0;

    setProgress(prev => ({
      ...prev,
      completedLessonIds: updatedCompletedIds,
      completedLessonCount: updatedCompletedIds.length,
      completionPercentage: newPercentage
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
          completionPercentage: data.data.completionPercentage,
          courseCompletedAt: data.data.courseCompletedAt
        }));
      }
    } catch (err) {
      console.warn('Failed to sync lesson completion:', err);
    }
  };

  // Switch to lesson
  const switchLesson = (lesson) => {
    if (videoRef.current) {
      saveProgressToBackend(videoRef.current.currentTime, videoRef.current.duration);
    }
    setActiveLesson(lesson);
    setIsPlaying(false);
  };

  // Navigation: Next / Prev
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

  // Add personal note
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
      console.warn('Note add error:', err);
    }
  };

  // Delete personal note
  const handleDeleteNote = async (noteId) => {
    try {
      await fetch(`/api/learning/notes/${courseId}/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(n => n._id !== noteId));
    } catch (err) {
      console.warn('Note delete error:', err);
    }
  };

  // Toggle Section Collapse
  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Share link handler
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: courseData?.title || 'KairaHub Masterclass',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Course player link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1D1F] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#970747] border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Loading Course Player...</h3>
        <p className="text-xs text-zinc-400 mt-1">Retrieving verified enrollment and persistent progress...</p>
      </div>
    );
  }

  if (errorNotice) {
    return (
      <div className="min-h-screen bg-[#1C1D1F] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#2D2F31] border border-red-500/40 rounded-2xl p-6 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Access Notice</h2>
          <p className="text-sm text-zinc-300 mb-6">{errorNotice}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/my-learning" className="px-4 py-2 rounded-xl bg-zinc-700 text-white text-xs font-bold hover:bg-zinc-600">
              Back to My Learning
            </Link>
            <Link to={`/webinars/${courseId}?register=true`} className="px-4 py-2 rounded-xl btn-primary text-xs font-bold">
              Complete Enrollment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentCompleted = progress.completedLessonIds.includes(activeLesson?.lessonId);

  return (
    <div className="min-h-screen bg-[#1C1D1F] text-[#F7F9FA] flex flex-col font-sans select-none">
      
      {/* 1. Dark Top Header Bar (Udemy inspired) */}
      <header className="h-14 bg-[#1C1D1F] border-b border-[#3E4143] px-4 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: Brand + Course Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            to="/my-learning" 
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-[#2D2F31] transition-colors"
            title="Return to My Learning Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">My learning</span>
          </Link>
          <div className="h-4 w-px bg-[#3E4143] hidden sm:block" />
          <h1 className="text-sm font-bold text-white truncate max-w-xs md:max-w-md lg:max-w-xl">
            {courseData?.title}
          </h1>
        </div>

        {/* Right: Progress Indicator + Share + Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          
          {/* Progress Circular Pill Dropdown */}
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
              <div className="absolute right-0 mt-2 w-64 bg-[#2D2F31] border border-[#3E4143] rounded-xl p-4 shadow-2xl z-50 text-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white">Course Progress</span>
                  <span className="text-[#F1D3DE] font-black">{progress.completionPercentage}%</span>
                </div>
                <div className="w-full bg-[#1C1D1F] h-2 rounded-full overflow-hidden mb-3">
                  <div 
                    className="bg-gradient-to-r from-[#970747] to-[#C71F6E] h-full transition-all duration-300"
                    style={{ width: `${progress.completionPercentage}%` }}
                  />
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {progress.completedLessonCount} of {progress.totalTrackableLessonCount} lessons completed
                </p>

                {progress.completionPercentage === 100 ? (
                  <div className="mt-3 pt-3 border-t border-[#3E4143] text-center">
                    <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <Award className="w-4 h-4" /> Certificate Unlocked!
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 mt-2">
                    Complete all {progress.totalTrackableLessonCount} lectures to unlock your verifiable digital certificate.
                  </p>
                )}
              </div>
            )}
          </div>

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
            className="relative w-full aspect-video bg-black flex items-center justify-center group overflow-hidden max-h-[68vh]"
          >
            {activeLesson ? (
              <video
                ref={videoRef}
                src={activeLesson.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4"}
                poster={courseData?.posterImage || courseData?.thumbnail}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  handleToggleComplete(activeLesson.lessonId, true);
                  goToNextLesson();
                }}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
              />
            ) : (
              <div className="text-zinc-500 text-xs">No lesson selected</div>
            )}

            {/* Big Center Play Button when paused */}
            {!isPlaying && activeLesson && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-18 h-18 rounded-full bg-black/60 hover:bg-[#970747]/90 text-white flex items-center justify-center backdrop-blur-xs transition-all transform hover:scale-110 shadow-2xl z-20 cursor-pointer"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            )}

            {/* Custom Video Control Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 transition-opacity duration-300 z-20 ${
              isPlaying && !isHoveringControls ? 'opacity-0' : 'opacity-100'
            }`}>
              
              {/* Progress Seek Bar with Purple fill */}
              <div className="relative mb-2.5 flex items-center group/seek">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-zinc-600/60 rounded-lg appearance-none cursor-pointer accent-[#970747] hover:h-2.5 transition-all"
                  style={{
                    background: `linear-gradient(to right, #970747 ${(currentTime / (duration || 1)) * 100}%, rgba(100, 100, 100, 0.4) ${(currentTime / (duration || 1)) * 100}%)`
                  }}
                />
              </div>

              {/* Control Buttons Row */}
              <div className="flex items-center justify-between text-xs text-white">
                
                {/* Left Controls */}
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="hover:text-[#F1D3DE] transition-colors cursor-pointer" title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <button onClick={goToPrevLesson} disabled={currentLessonIndex <= 0} className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Previous Lesson">
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button onClick={goToNextLesson} disabled={currentLessonIndex >= allLessons.length - 1} className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Next Lesson">
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button onClick={toggleMute} className="hover:text-[#F1D3DE] cursor-pointer">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-zinc-600 rounded-lg accent-[#970747] opacity-75 group-hover/vol:opacity-100 cursor-pointer"
                    />
                  </div>

                  {/* Time Display */}
                  <span className="text-[11px] text-zinc-300 font-mono ml-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                  
                  {/* Playback Speed Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="font-bold text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      {playbackSpeed}x
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-[#2D2F31] border border-[#3E4143] rounded-lg py-1 shadow-2xl z-30 min-w-20">
                        {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`w-full px-3 py-1 text-left text-xs hover:bg-[#3E4143] flex items-center justify-between cursor-pointer ${
                              playbackSpeed === speed ? 'text-[#F1D3DE] font-bold' : 'text-zinc-300'
                            }`}
                          >
                            <span>{speed}x</span>
                            {playbackSpeed === speed && <Check className="w-3 h-3 text-[#F1D3DE]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="hover:text-[#F1D3DE] transition-colors cursor-pointer" title="Fullscreen">
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>

                </div>

              </div>

            </div>
          </div>

          {/* B. Lesson Info & Navigation Banner */}
          <div className="bg-[#1C1D1F] border-b border-[#3E4143] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#F1D3DE] font-bold">
                {activeLesson?.sectionTitle || 'Course Curriculum'}
              </p>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {activeLesson?.title}
              </h2>
            </div>

            {/* Quick Actions (Mark as Completed & Prev/Next) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => activeLesson && handleToggleComplete(activeLesson.lessonId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCurrentCompleted
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                    : 'bg-[#2D2F31] hover:bg-[#3E4143] text-white border border-[#3E4143]'
                }`}
              >
                {isCurrentCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-zinc-400" />
                    <span>Mark as complete</span>
                  </>
                )}
              </button>

              <button
                onClick={goToNextLesson}
                disabled={currentLessonIndex >= allLessons.length - 1}
                className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1 rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* C. Udemy-style Sub-Tabs below Player */}
          <div className="bg-[#1C1D1F] border-b border-[#3E4143] px-4 flex gap-6 text-xs font-bold">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'notes', label: `Notes (${notes.length})` },
              { id: 'announcements', label: 'Announcements' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'tools', label: 'Learning tools' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 border-b-2 transition-all cursor-pointer ${
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
            
            {/* 1. OVERVIEW TAB (Inspired by Screenshot 2 & 3) */}
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
                    <span className="text-zinc-400">{courseData?.learnersCount || 3420} students</span>
                    <span className="text-zinc-400">{courseData?.duration || '2.5 hours total'}</span>
                    <span className="text-zinc-400">Language: {courseData?.language || 'English'}</span>
                  </div>
                </div>

                {/* Schedule Learning Time Banner (Screenshot 1 & 3) */}
                <div className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#970747]/20 border border-[#970747]/40 text-[#F1D3DE] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#F1D3DE]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">Schedule learning time</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their career goals.
                    </p>
                    <button
                      onClick={() => setActiveTab('tools')}
                      className="mt-2 text-xs font-bold text-[#F1D3DE] hover:underline"
                    >
                      Set learning reminder &rarr;
                    </button>
                  </div>
                </div>

                {/* By the numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#2D2F31] p-3 rounded-xl border border-[#3E4143]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Skill Level</span>
                    <span className="text-xs font-bold text-white mt-1 block">{courseData?.level || 'All Levels'}</span>
                  </div>
                  <div className="bg-[#2D2F31] p-3 rounded-xl border border-[#3E4143]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Lectures</span>
                    <span className="text-xs font-bold text-white mt-1 block">{allLessons.length} Lectures</span>
                  </div>
                  <div className="bg-[#2D2F31] p-3 rounded-xl border border-[#3E4143]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Video Duration</span>
                    <span className="text-xs font-bold text-white mt-1 block">{courseData?.duration || '2.5 Hours'}</span>
                  </div>
                  <div className="bg-[#2D2F31] p-3 rounded-xl border border-[#3E4143]">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Credentials</span>
                    <span className="text-xs font-bold text-white mt-1 block">Accredited Pass</span>
                  </div>
                </div>

                {/* What You'll Learn */}
                {courseData?.outcomes && courseData.outcomes.length > 0 && (
                  <div className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1D3DE] mb-3">
                      What you'll learn in this course
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

            {/* 2. NOTES TAB (Screenshot 4 inspired) */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                
                {/* Note creation input box */}
                <form onSubmit={handleAddNote} className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      Create a new note at <span className="text-[#F1D3DE] bg-[#970747]/20 px-2 py-0.5 rounded font-mono font-bold">{formatTime(currentTime)}</span>
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate max-w-xs">{activeLesson?.title}</span>
                  </div>

                  <textarea
                    rows="3"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type your personal lesson insight or code note here..."
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

                {/* Notes List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-[#3E4143] pb-2">
                    <span className="font-bold text-white">Your Notes ({notes.length})</span>
                    <span className="text-zinc-400 text-[11px]">Click timestamp to seek video</span>
                  </div>

                  {notes.length === 0 ? (
                    <div className="p-8 text-center bg-[#2D2F31]/50 rounded-2xl border border-[#3E4143] space-y-2">
                      <FileText className="w-8 h-8 text-zinc-500 mx-auto" />
                      <p className="text-xs text-zinc-400">No notes captured yet for this masterclass.</p>
                      <p className="text-[11px] text-zinc-500">Capture technical concepts, code snippets, and timestamp bookmarks as you watch.</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note._id} className="bg-[#2D2F31] border border-[#3E4143] rounded-xl p-3.5 flex items-start justify-between gap-3 group">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            {/* Clickable Timestamp Chip */}
                            <button
                              onClick={() => {
                                if (videoRef.current) {
                                  videoRef.current.currentTime = note.timestampSeconds;
                                  videoRef.current.play();
                                  setIsPlaying(true);
                                }
                              }}
                              className="px-2 py-0.5 rounded bg-[#970747] hover:bg-[#750435] text-white font-mono text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title="Jump to this video timestamp"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{formatTime(note.timestampSeconds)}</span>
                            </button>
                            <span className="text-[11px] text-zinc-400 truncate font-medium">{note.lessonTitle}</span>
                          </div>
                          <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{note.text}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Course Announcements</h4>
                {(courseData?.announcements || []).map((ann, i) => (
                  <div key={i} className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={ann.avatar || courseData?.speaker?.avatar} alt={ann.author} className="w-9 h-9 rounded-full object-cover border border-[#970747]" />
                      <div>
                        <h5 className="text-xs font-bold text-white">{ann.author}</h5>
                        <span className="text-[10px] text-zinc-400">{ann.date}</span>
                      </div>
                    </div>
                    <h5 className="text-sm font-bold text-white">{ann.title}</h5>
                    <p className="text-xs text-zinc-300 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 4. REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-5 flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-4xl font-black text-amber-400 block">{courseData?.rating || 4.8}</span>
                    <div className="flex text-amber-400 text-xs justify-center my-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium">Course Rating</span>
                  </div>
                  <div className="h-12 w-px bg-[#3E4143]" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Student Feedback</h5>
                    <p className="text-[11px] text-zinc-400 mt-1">Verified reviews from cohort participants who completed this curriculum.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(courseData?.reviews || []).map((rev, i) => (
                    <div key={i} className="bg-[#2D2F31] border border-[#3E4143] rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#970747] text-white flex items-center justify-center font-bold text-xs">
                            {rev.author[0]}
                          </div>
                          <span className="text-xs font-bold text-white">{rev.author}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-400 text-xs">
                        {[...Array(rev.rating || 5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. LEARNING TOOLS TAB (Screenshot 1 & 3 inspired) */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                <div className="bg-[#2D2F31] border border-[#3E4143] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#970747]/20 border border-[#970747]/40 text-[#F1D3DE] flex items-center justify-center">
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

                {/* Lesson Resources & Attachments */}
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

        {/* RIGHT COLUMN: Course Content Curriculum Sidebar (Screenshot 2 inspired) */}
        {sidebarOpen && (
          <aside className="w-80 sm:w-96 bg-[#1C1D1F] border-l border-[#3E4143] flex flex-col shrink-0 z-20 overflow-hidden">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#3E4143] flex items-center justify-between shrink-0">
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

                return (
                  <div key={section.sectionId || secIdx} className="border-b border-[#2D2F31]">
                    
                    {/* Section Accordion Header */}
                    <button
                      onClick={() => toggleSection(section.sectionId)}
                      className="w-full p-4 text-left bg-[#242729] hover:bg-[#2D2F31] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="pr-2">
                        <h4 className="text-xs font-bold text-white leading-snug">
                          {section.title}
                        </h4>
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

                          return (
                            <div
                              key={lesson.lessonId}
                              onClick={() => switchLesson(lesson)}
                              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                                isActive 
                                  ? 'bg-[#2D2F31] border-l-4 border-[#970747]' 
                                  : 'hover:bg-[#242729]'
                              }`}
                            >
                              {/* Checkbox */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleComplete(lesson.lessonId);
                                }}
                                className="mt-0.5 shrink-0 text-zinc-500 hover:text-white cursor-pointer"
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
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </aside>
        )}

      </div>

    </div>
  );
}
