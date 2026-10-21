const storage = require('../services/storage');
const StudentCourseProgress = require('../models/StudentCourseProgress');
const Webinar = require('../models/Webinar');
const curriculumService = require('../services/curriculumService');
const mongoose = require('mongoose');

// In-memory resilient store for progress when running in memory mode
let memProgress = [];

const isDbActive = () => mongoose.connection.readyState === 1;

/**
 * Helper to get or create StudentCourseProgress
 */
const getOrCreateProgress = async (userId, userEmail, courseId, totalLessonsCount = 0) => {
  const uid = String(userId);
  const cid = String(courseId);
  const email = (userEmail || '').toLowerCase().trim();

  if (isDbActive()) {
    try {
      let doc = await StudentCourseProgress.findOne({
        $or: [
          { userId: uid, courseId: cid },
          { userEmail: email, courseId: cid }
        ]
      });

      if (!doc) {
        doc = await StudentCourseProgress.create({
          userId: uid,
          userEmail: email,
          courseId: cid,
          completedLessonIds: [],
          lessonProgress: [],
          completedLessonCount: 0,
          totalTrackableLessonCount: totalLessonsCount,
          completionPercentage: 0,
          lastAccessedLessonId: '',
          notes: []
        });
      } else if (totalLessonsCount > 0 && doc.totalTrackableLessonCount !== totalLessonsCount) {
        doc.totalTrackableLessonCount = totalLessonsCount;
        doc.completionPercentage = totalLessonsCount > 0 
          ? Math.round((doc.completedLessonIds.length / totalLessonsCount) * 100) 
          : 0;
        await doc.save();
      }
      return doc;
    } catch (e) {
      console.warn('DB error getting StudentCourseProgress, falling to memory:', e.message);
    }
  }

  // Memory Fallback
  let mem = memProgress.find(p => (p.userId === uid || p.userEmail === email) && p.courseId === cid);
  if (!mem) {
    mem = {
      _id: `prog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: uid,
      userEmail: email,
      courseId: cid,
      completedLessonIds: [],
      lessonProgress: [],
      completedLessonCount: 0,
      totalTrackableLessonCount: totalLessonsCount,
      completionPercentage: 0,
      lastAccessedLessonId: '',
      isArchived: false,
      isInMyList: false,
      rating: 0,
      notes: [],
      learningReminder: { enabled: false, time: '12:00 PM', days: ['Mo', 'Tu', 'We', 'Th', 'Fr'] },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memProgress.push(mem);
  } else if (totalLessonsCount > 0) {
    mem.totalTrackableLessonCount = totalLessonsCount;
    mem.completionPercentage = Math.round((mem.completedLessonIds.length / totalLessonsCount) * 100);
  }
  return mem;
};

/**
 * Helper to check course entitlement
 */
const checkStudentEntitlement = async (user, courseId) => {
  if (!user) return false;
  // Admins always have access
  if (user.role === 'admin') return true;

  const email = (user.email || '').toLowerCase().trim();
  const userId = String(user.id || user._id || '');

  // Fetch webinar to see if it is free
  const webinar = await storage.getWebinarById(courseId);
  if (webinar && webinar.price === 0) return true;

  // Check paid registrations in database
  const allRegistrations = await storage.getAllRegistrations();
  const match = allRegistrations.find(r => 
    (r.webinarId === courseId || r.webinarId === webinar?.id || r.webinarId === webinar?.slug) &&
    (r.email?.toLowerCase().trim() === email || String(r.userId) === userId) &&
    r.paymentStatus === 'completed'
  );

  return !!match;
};

/**
 * GET /api/learning/my-courses
 * Returns all courses the student is enrolled in with authentic MongoDB progress records
 */
exports.getMyEnrolledCourses = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const email = (user.email || '').toLowerCase().trim();
    const userId = String(user.id || user._id || '');

    // Get all completed registrations for this student
    const allRegistrations = await storage.getAllRegistrations();
    let userRegistrations = allRegistrations.filter(r => 
      (r.email?.toLowerCase().trim() === email || String(r.userId) === userId) &&
      r.paymentStatus === 'completed'
    );

    // If admin or test student, also include seed webinars if no registrations yet
    const allWebinars = await storage.getWebinars();
    let enrolledCourseIds = [...new Set(userRegistrations.map(r => r.webinarId))];

    if (enrolledCourseIds.length === 0 && (user.role === 'admin' || email.includes('techvision.io'))) {
      enrolledCourseIds = allWebinars.slice(0, 2).map(w => w.id);
    }

    const coursesWithProgress = [];

    for (const courseId of enrolledCourseIds) {
      const webinar = allWebinars.find(w => w.id === courseId || w.slug === courseId);
      if (!webinar) continue;

      const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
      const trackableLessons = curriculumService.getTrackableLessons(curriculum);
      const totalLessonsCount = trackableLessons.length;

      const progress = await getOrCreateProgress(userId, email, webinar.id, totalLessonsCount);

      const completedCount = progress.completedLessonIds ? progress.completedLessonIds.length : 0;
      const percentage = totalLessonsCount > 0 
        ? Math.min(100, Math.round((completedCount / totalLessonsCount) * 100)) 
        : 0;

      coursesWithProgress.push({
        courseId: webinar.id,
        slug: webinar.slug || webinar.id,
        title: webinar.title,
        tagline: webinar.tagline,
        category: webinar.category,
        thumbnail: webinar.posterImage || webinar.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
        instructor: {
          name: webinar.speaker?.name || 'Lead Specialist',
          role: webinar.speaker?.role || 'Instructor',
          company: webinar.speaker?.company || 'Industry Partner',
          avatar: webinar.speaker?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        },
        duration: webinar.duration || '2 hours',
        rating: webinar.rating || 4.8,
        reviewsCount: webinar.reviewsCount || 120,
        progress: {
          completionPercentage: percentage,
          completedLessonCount: completedCount,
          totalTrackableLessonCount: totalLessonsCount,
          lastAccessedLessonId: progress.lastAccessedLessonId || (trackableLessons[0]?.lessonId || ''),
          lastAccessedAt: progress.lastAccessedAt || progress.updatedAt,
          courseCompletedAt: progress.courseCompletedAt || null,
          isArchived: !!progress.isArchived,
          isInMyList: !!progress.isInMyList,
          userRating: progress.rating || 0
        },
        certificateEligible: percentage === 100,
        nextLesson: trackableLessons.find(l => !progress.completedLessonIds.includes(l.lessonId)) || trackableLessons[0]
      });
    }

    res.json({
      success: true,
      data: {
        courses: coursesWithProgress,
        stats: {
          totalEnrolled: coursesWithProgress.length,
          completedCourses: coursesWithProgress.filter(c => c.progress.completionPercentage === 100).length,
          inProgressCourses: coursesWithProgress.filter(c => c.progress.completionPercentage > 0 && c.progress.completionPercentage < 100).length,
          streak: {
            currentStreakWeeks: 1,
            weeklyGoalMins: 30,
            completedMins: 18,
            weekLabel: 'Oct 18 - 24'
          }
        }
      }
    });
  } catch (error) {
    console.error('getMyEnrolledCourses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/learning/course/:courseId
 * Retrieves full course curriculum, video stream sources, and authenticated student progress
 */
exports.getCourseCurriculum = async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify student entitlement
    const isEntitled = await checkStudentEntitlement(user, webinar.id);
    if (!isEntitled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course or payment verification is pending.',
        code: 'PAYMENT_REQUIRED',
        courseId: webinar.id,
        price: webinar.price
      });
    }

    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackableLessons = curriculumService.getTrackableLessons(curriculum);
    const totalLessonsCount = trackableLessons.length;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, totalLessonsCount);

    const completedLessonIds = progress.completedLessonIds || [];
    const completedCount = completedLessonIds.length;
    const percentage = totalLessonsCount > 0 
      ? Math.min(100, Math.round((completedCount / totalLessonsCount) * 100)) 
      : 0;

    res.json({
      success: true,
      data: {
        course: {
          id: webinar.id,
          slug: webinar.slug || webinar.id,
          title: webinar.title,
          tagline: webinar.tagline,
          description: webinar.description,
          outcomes: webinar.outcomes || [],
          prerequisites: webinar.prerequisites || [],
          category: webinar.category,
          level: webinar.level || 'All Levels',
          language: webinar.language || 'English',
          rating: webinar.rating || 4.8,
          reviewsCount: webinar.reviewsCount || 140,
          learnersCount: webinar.learnersCount || 3400,
          speaker: webinar.speaker,
          duration: webinar.duration || '2 hours',
          reviews: webinar.reviews || [],
          announcements: webinar.announcements && webinar.announcements.length > 0 ? webinar.announcements : [
            {
              author: webinar.speaker?.name || 'Course Instructor',
              avatar: webinar.speaker?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              date: '2 days ago',
              title: `Welcome to ${webinar.title}!`,
              content: 'All course repository materials, starter kits, and live slides have been updated for this cohort. Feel free to use the Notes tab to capture key takeaways.'
            }
          ]
        },
        curriculum,
        progress: {
          completedLessonIds,
          completedLessonCount: completedCount,
          totalTrackableLessonCount: totalLessonsCount,
          completionPercentage: percentage,
          lastAccessedLessonId: progress.lastAccessedLessonId || (trackableLessons[0]?.lessonId || ''),
          lessonProgress: progress.lessonProgress || [],
          isArchived: !!progress.isArchived,
          isInMyList: !!progress.isInMyList,
          userRating: progress.rating || 0
        },
        notes: progress.notes || []
      }
    });
  } catch (error) {
    console.error('getCourseCurriculum error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/learning/progress
 * Saves periodic playback position for video resume
 */
exports.savePlaybackProgress = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, lessonId, positionSeconds, durationSeconds } = req.body;

    if (!courseId || !lessonId) {
      return res.status(400).json({ success: false, message: 'courseId and lessonId are required' });
    }

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isEntitled = await checkStudentEntitlement(user, webinar.id);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Course access denied' });
    }

    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackable = curriculumService.getTrackableLessons(curriculum);
    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, trackable.length);

    // Update lesson progress array
    let item = progress.lessonProgress.find(lp => lp.lessonId === lessonId);
    if (!item) {
      item = {
        lessonId,
        completed: progress.completedLessonIds.includes(lessonId),
        lastPositionSeconds: positionSeconds || 0,
        durationSeconds: durationSeconds || 0,
        lastWatchedAt: new Date()
      };
      progress.lessonProgress.push(item);
    } else {
      item.lastPositionSeconds = positionSeconds;
      if (durationSeconds) item.durationSeconds = durationSeconds;
      item.lastWatchedAt = new Date();
    }

    progress.lastAccessedLessonId = lessonId;
    progress.lastAccessedAt = new Date();

    if (isDbActive() && progress.save) {
      await progress.save();
    }

    res.json({
      success: true,
      data: {
        lessonId,
        lastPositionSeconds: positionSeconds,
        lastAccessedLessonId: lessonId
      }
    });
  } catch (error) {
    console.error('savePlaybackProgress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/learning/complete-lesson
 * Marks a lesson complete or incomplete and recalculates overall percentage
 */
exports.toggleLessonComplete = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, lessonId, completed } = req.body;

    if (!courseId || !lessonId) {
      return res.status(400).json({ success: false, message: 'courseId and lessonId are required' });
    }

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isEntitled = await checkStudentEntitlement(user, webinar.id);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Course access denied' });
    }

    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackable = curriculumService.getTrackableLessons(curriculum);
    const totalCount = trackable.length;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, totalCount);

    const isCompleted = completed !== false;
    let completedSet = new Set(progress.completedLessonIds || []);

    if (isCompleted) {
      completedSet.add(lessonId);
    } else {
      completedSet.delete(lessonId);
    }

    progress.completedLessonIds = Array.from(completedSet);
    progress.completedLessonCount = progress.completedLessonIds.length;
    progress.totalTrackableLessonCount = totalCount;
    progress.completionPercentage = totalCount > 0 
      ? Math.min(100, Math.round((progress.completedLessonCount / totalCount) * 100)) 
      : 0;

    // Update item in lessonProgress
    let item = progress.lessonProgress.find(lp => lp.lessonId === lessonId);
    if (!item) {
      item = {
        lessonId,
        completed: isCompleted,
        lastPositionSeconds: 0,
        durationSeconds: 0,
        lastWatchedAt: new Date(),
        completedAt: isCompleted ? new Date() : null
      };
      progress.lessonProgress.push(item);
    } else {
      item.completed = isCompleted;
      if (isCompleted) item.completedAt = new Date();
    }

    if (progress.completionPercentage === 100 && !progress.courseCompletedAt) {
      progress.courseCompletedAt = new Date();
    } else if (progress.completionPercentage < 100) {
      progress.courseCompletedAt = null;
    }

    if (isDbActive() && progress.save) {
      await progress.save();
    }

    res.json({
      success: true,
      data: {
        courseId: webinar.id,
        lessonId,
        completed: isCompleted,
        completedLessonIds: progress.completedLessonIds,
        completedLessonCount: progress.completedLessonCount,
        totalTrackableLessonCount: progress.totalTrackableLessonCount,
        completionPercentage: progress.completionPercentage,
        courseCompletedAt: progress.courseCompletedAt
      }
    });
  } catch (error) {
    console.error('toggleLessonComplete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/learning/notes
 * Adds a timestamped personal note for a lesson
 */
exports.addNote = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, lessonId, lessonTitle, timestampSeconds, text } = req.body;

    if (!courseId || !lessonId || !text) {
      return res.status(400).json({ success: false, message: 'courseId, lessonId, and note text are required' });
    }

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isEntitled = await checkStudentEntitlement(user, webinar.id);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id);

    const newNote = {
      _id: new mongoose.Types.ObjectId(),
      lessonId,
      lessonTitle: lessonTitle || 'Lesson Note',
      timestampSeconds: Math.max(0, Math.floor(Number(timestampSeconds) || 0)),
      text: text.trim(),
      createdAt: new Date()
    };

    progress.notes.unshift(newNote);

    if (isDbActive() && progress.save) {
      await progress.save();
    }

    res.json({
      success: true,
      data: newNote
    });
  } catch (error) {
    console.error('addNote error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/learning/notes/:courseId/:noteId
 * Deletes a student's personal note
 */
exports.deleteNote = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, noteId } = req.params;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    progress.notes = progress.notes.filter(n => String(n._id) !== String(noteId));

    if (isDbActive() && progress.save) {
      await progress.save();
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('deleteNote error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/learning/archive
 * Toggles course archive status
 */
exports.toggleArchive = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, isArchived } = req.body;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    progress.isArchived = !!isArchived;

    if (isDbActive() && progress.save) {
      await progress.save();
    }

    res.json({ success: true, data: { courseId, isArchived: progress.isArchived } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/learning/my-list
 * Toggles course in user's custom list
 */
exports.toggleMyList = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, isInMyList } = req.body;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    progress.isInMyList = !!isInMyList;

    if (isDbActive() && progress.save) {
      await progress.save();
    }

    res.json({ success: true, data: { courseId, isInMyList: progress.isInMyList } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/learning/rating
 * Saves student course rating
 */
exports.saveCourseRating = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, rating, comment } = req.body;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    progress.rating = Math.min(5, Math.max(1, Number(rating) || 5));
    if (comment) progress.reviewComment = comment;

    if (isDbActive() && progress.save) {
      await progress.save();
    }

    res.json({ success: true, data: { courseId, rating: progress.rating } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/learning/certificate/:courseId
 * Retrieves accredited certificate details if 100% completed
 */
exports.getCertificate = async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackable = curriculumService.getTrackableLessons(curriculum);

    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, trackable.length);

    if (progress.completionPercentage < 100) {
      return res.status(400).json({
        success: false,
        message: 'Course must be 100% completed before a certificate can be generated.',
        completionPercentage: progress.completionPercentage
      });
    }

    const certId = `CERT-KWH-${(webinar.id || 'COURSE').toUpperCase().replace(/[^A-Z0-9]/g, '')}-${String(user.id || user._id).slice(-6)}`;

    res.json({
      success: true,
      data: {
        certificateId: certId,
        studentName: user.name || 'Verified Student',
        studentEmail: user.email,
        courseTitle: webinar.title,
        instructorName: webinar.speaker?.name || 'Lead Specialist',
        instructorRole: webinar.speaker?.role || 'Instructor',
        issueDate: progress.courseCompletedAt || new Date(),
        totalHours: webinar.duration || '2.5 Hours',
        issuer: 'Kaira Webinar Hub Certification Authority',
        verificationUrl: `https://kairahub.live/verify/cert/${certId}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
