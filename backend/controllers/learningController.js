const storage = require('../services/storage');
const StudentCourseProgress = require('../models/StudentCourseProgress');
const Webinar = require('../models/Webinar');
const Registration = require('../models/Registration');
const Invoice = require('../models/Invoice');
const Certificate = require('../models/Certificate');
const curriculumService = require('../services/curriculumService');
const quizService = require('../services/quizService');
const pdfService = require('../services/pdfService');
const mongoose = require('mongoose');

// In-memory resilient store for progress when running in memory mode
let memProgress = [];
let memCertificates = [];

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
          passedSectionIds: [],
          sectionQuizResults: [],
          lessonProgress: [],
          completedLessonCount: 0,
          totalTrackableLessonCount: totalLessonsCount,
          completionPercentage: 0,
          isCourseCompleted: false,
          lastAccessedLessonId: '',
          notes: []
        });
      } else if (totalLessonsCount > 0 && doc.totalTrackableLessonCount !== totalLessonsCount) {
        doc.totalTrackableLessonCount = totalLessonsCount;
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
      passedSectionIds: [],
      sectionQuizResults: [],
      lessonProgress: [],
      completedLessonCount: 0,
      totalTrackableLessonCount: totalLessonsCount,
      completionPercentage: 0,
      isCourseCompleted: false,
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
  }
  return mem;
};

/**
 * Authoritative backend check for course entitlement
 */
const checkStudentEntitlement = async (user, courseId) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const email = (user.email || '').toLowerCase().trim();
  const userId = String(user.id || user._id || '');

  const item = (storage.getItemById ? await storage.getItemById(courseId) : null) || await storage.getWebinarById(courseId);
  const targetCourseId = item?.id || courseId;
  const targetSlug = item?.slug || '';

  // 1. Check primary Enrollment collection first (instant indexed lookup)
  const enrollment = await storage.getEnrollment(userId, targetCourseId);
  if (enrollment && enrollment.status === 'active') return true;

  // 2. Check registrations fallback
  const allRegistrations = await storage.getAllRegistrations();
  const match = allRegistrations.find(r => 
    (r.webinarId === targetCourseId || r.webinarId === targetSlug) &&
    (r.email?.toLowerCase().trim() === email || String(r.userId) === userId) &&
    r.paymentStatus === 'completed'
  );

  return !!match;
};

/**
 * GET /api/learning/enrollment-status
 * Fast endpoint for navbar, course cards, and player to check ownership state
 */
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json({
        success: true,
        authenticated: false,
        enrolledCourseIds: [],
        enrollmentMap: {}
      });
    }

    const email = (user.email || '').toLowerCase().trim();
    const userId = String(user.id || user._id || '');

    // Get all enrollments for user
    const enrollments = await storage.getEnrollmentsByUser(userId, email);
    const registrations = (await storage.getAllRegistrations()).filter(r => 
      (r.email?.toLowerCase().trim() === email || String(r.userId) === userId) &&
      r.paymentStatus === 'completed'
    );

    const enrolledSet = new Set();
    enrollments.forEach(e => enrolledSet.add(e.courseId));
    registrations.forEach(r => enrolledSet.add(r.webinarId));

    const enrolledCourseIds = Array.from(enrolledSet);
    const enrollmentMap = {};

    for (const cid of enrolledCourseIds) {
      const prog = await getOrCreateProgress(userId, email, cid);
      enrollmentMap[cid] = {
        isEnrolled: true,
        isCompleted: prog.isCourseCompleted || prog.completionPercentage === 100,
        completionPercentage: prog.completionPercentage || 0,
        lastAccessedLessonId: prog.lastAccessedLessonId || '',
        certificateEligible: prog.isCourseCompleted || prog.completionPercentage === 100
      };
    }

    res.json({
      success: true,
      authenticated: true,
      enrolledCourseIds,
      enrollmentMap
    });
  } catch (error) {
    console.error('getEnrollmentStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/learning/enroll-free
 * Allows students to enroll in explicitly configured free courses (price === 0)
 */
exports.enrollFreeCourse = async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.body;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (webinar.price > 0) {
      return res.status(400).json({
        success: false,
        message: 'This course requires payment. Please use Buy Now to complete checkout.',
        price: webinar.price
      });
    }

    const email = user.email.toLowerCase().trim();
    const userId = String(user.id || user._id);

    // Check if already enrolled
    const alreadyEnrolled = await checkStudentEntitlement(user, webinar.id);
    if (alreadyEnrolled) {
      return res.json({
        success: true,
        message: 'You are already enrolled in this course.',
        courseId: webinar.id
      });
    }

    const registrationId = `KWH-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const regData = {
      registrationId,
      userId,
      webinarId: webinar.id,
      webinarTitle: webinar.title,
      fullName: user.name || 'Enrolled Student',
      email,
      phone: user.phone || '0000000000',
      countryCode: '+91',
      ticketType: 'Free Pass',
      amount: 0,
      currency: 'INR',
      paymentStatus: 'completed',
      paymentMethod: 'free',
      verifiedAt: new Date(),
      createdAt: new Date()
    };

    await storage.createRegistration(regData);

    // Create authoritative Enrollment record
    await storage.createEnrollment({
      userId,
      userEmail: email,
      courseId: webinar.id,
      courseTitle: webinar.title,
      amount: 0,
      currency: 'INR',
      paymentStatus: 'free',
      paymentMethod: 'free',
      registrationId,
      status: 'active'
    });

    // Initialize progress record
    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackable = curriculumService.getTrackableLessons(curriculum);
    await getOrCreateProgress(userId, email, webinar.id, trackable.length);

    res.json({
      success: true,
      message: 'Successfully enrolled in free course.',
      courseId: webinar.id
    });
  } catch (error) {
    console.error('enrollFreeCourse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/learning/my-courses
 * Returns individual courses the authenticated student is officially enrolled in
 */
exports.getMyEnrolledCourses = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const email = (user.email || '').toLowerCase().trim();
    const userId = String(user.id || user._id || '');

    // Get completed registrations
    const allRegistrations = await storage.getAllRegistrations();
    const userRegistrations = allRegistrations.filter(r => 
      (r.email?.toLowerCase().trim() === email || String(r.userId) === userId) &&
      r.paymentStatus === 'completed'
    );

    const allWebinars = await storage.getWebinars();
    let enrolledCourseIds = [...new Set(userRegistrations.map(r => r.webinarId))];

    // If admin, grant view of published catalog if no personal registrations exist
    if (user.role === 'admin' && enrolledCourseIds.length === 0) {
      enrolledCourseIds = allWebinars.slice(0, 2).map(w => w.id);
    }

    const coursesWithProgress = [];

    for (const courseId of enrolledCourseIds) {
      const webinar = allWebinars.find(w => w.id === courseId || w.slug === courseId);
      if (!webinar) continue;

      const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
      const trackableLessons = curriculumService.getTrackableLessons(curriculum);
      const totalLessonsCount = trackableLessons.length;
      const totalSectionsCount = curriculum.length;

      const progress = await getOrCreateProgress(userId, email, webinar.id, totalLessonsCount);

      const completedCount = progress.completedLessonIds ? progress.completedLessonIds.length : 0;
      const passedSections = progress.passedSectionIds || [];
      const passedQuizzesCount = passedSections.length;

      // Completion calculation considers both lessons and required section quizzes
      const totalRequirements = totalLessonsCount + totalSectionsCount;
      const completedRequirements = completedCount + passedQuizzesCount;
      const percentage = totalRequirements > 0
        ? Math.min(100, Math.round((completedRequirements / totalRequirements) * 100))
        : 0;

      const isCompleted = percentage === 100 && completedCount === totalLessonsCount && passedQuizzesCount === totalSectionsCount;

      // Check matching invoice
      const matchingReg = userRegistrations.find(r => r.webinarId === webinar.id || r.webinarId === webinar.slug);

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
        price: webinar.price,
        progress: {
          completionPercentage: percentage,
          completedLessonCount: completedCount,
          totalTrackableLessonCount: totalLessonsCount,
          passedQuizzesCount,
          totalSectionsCount,
          isCompleted,
          lastAccessedLessonId: progress.lastAccessedLessonId || (trackableLessons[0]?.lessonId || ''),
          lastAccessedAt: progress.lastAccessedAt || progress.updatedAt,
          courseCompletedAt: progress.courseCompletedAt || null,
          isArchived: !!progress.isArchived,
          isInMyList: !!progress.isInMyList,
          userRating: progress.rating || 0
        },
        certificateEligible: isCompleted,
        invoiceAvailable: !!matchingReg,
        invoiceNumber: matchingReg?.invoiceNumber || '',
        nextLesson: trackableLessons.find(l => !progress.completedLessonIds.includes(l.lessonId)) || trackableLessons[0]
      });
    }

    res.json({
      success: true,
      data: {
        courses: coursesWithProgress,
        stats: {
          totalEnrolled: coursesWithProgress.length,
          completedCourses: coursesWithProgress.filter(c => c.progress.isCompleted).length,
          inProgressCourses: coursesWithProgress.filter(c => !c.progress.isCompleted).length
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
 * Retrieves full course curriculum, quizzes, and sequential lock status
 */
exports.getCourseCurriculum = async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Entitlement Check
    const isEntitled = await checkStudentEntitlement(user, webinar.id);
    if (!isEntitled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course. Please purchase the course to begin learning.',
        code: 'PAYMENT_REQUIRED',
        courseId: webinar.id,
        title: webinar.title,
        price: webinar.price,
        thumbnail: webinar.posterImage || webinar.thumbnail
      });
    }

    const rawCurriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackableLessons = curriculumService.getTrackableLessons(rawCurriculum);
    const totalLessonsCount = trackableLessons.length;
    const totalSectionsCount = rawCurriculum.length;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, totalLessonsCount);
    const completedLessonIds = progress.completedLessonIds || [];
    const passedSectionIds = progress.passedSectionIds || [];

    // Process curriculum with section quiz status and sequential progression locks
    let previousSectionCompleted = true; // Section 1 is unlocked by default

    const curriculum = [];
    for (let i = 0; i < rawCurriculum.length; i++) {
      const sec = rawCurriculum[i];
      const isSectionLocked = !previousSectionCompleted;

      // Check lessons in this section
      const sectionLessons = (sec.lessons || []).map(les => {
        const isDone = completedLessonIds.includes(les.lessonId);
        return {
          ...les,
          completed: isDone,
          isLocked: isSectionLocked
        };
      });

      const sectionLessonsCompletedCount = sectionLessons.filter(l => l.completed).length;
      const allSectionLessonsDone = sectionLessons.length > 0 && sectionLessonsCompletedCount === sectionLessons.length;

      // Section quiz lookup
      const quizMeta = await quizService.getOrCreateSectionQuiz(webinar.id, sec.sectionId, sec.title);
      const isQuizPassed = passedSectionIds.includes(sec.sectionId);
      const isQuizUnlocked = !isSectionLocked && allSectionLessonsDone;

      const quizResult = (progress.sectionQuizResults || []).find(r => r.sectionId === sec.sectionId);

      // Section is complete ONLY when all required lessons are done AND quiz is passed
      const isSectionComplete = allSectionLessonsDone && isQuizPassed;

      curriculum.push({
        sectionId: sec.sectionId,
        title: sec.title,
        order: sec.order,
        duration: sec.duration,
        isLocked: isSectionLocked,
        isCompleted: isSectionComplete,
        lessonsCompletedCount: sectionLessonsCompletedCount,
        totalLessonsCount: sectionLessons.length,
        allLessonsCompleted: allSectionLessonsDone,
        quiz: {
          quizId: quizMeta.quizId,
          title: quizMeta.title,
          passingScore: quizMeta.passingScore || 80,
          totalQuestions: (quizMeta.questions || []).length,
          isUnlocked: isQuizUnlocked,
          isPassed: isQuizPassed,
          bestScore: quizResult?.bestScore || 0,
          attemptsCount: quizResult?.attemptsCount || 0
        },
        lessons: sectionLessons
      });

      // Sequential progression rule: Next section unlocks only when this section is fully completed
      previousSectionCompleted = isSectionComplete;
    }

    const completedLessonCount = completedLessonIds.length;
    const passedQuizzesCount = passedSectionIds.length;
    const totalRequirements = totalLessonsCount + totalSectionsCount;
    const completedRequirements = completedLessonCount + passedQuizzesCount;
    const completionPercentage = totalRequirements > 0
      ? Math.min(100, Math.round((completedRequirements / totalRequirements) * 100))
      : 0;

    const isCourseCompleted = completionPercentage === 100 && completedLessonCount === totalLessonsCount && passedQuizzesCount === totalSectionsCount;

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
          speaker: webinar.speaker,
          duration: webinar.duration || '2 hours',
          price: webinar.price,
          announcements: webinar.announcements && webinar.announcements.length > 0 ? webinar.announcements : [
            {
              author: webinar.speaker?.name || 'Course Instructor',
              avatar: webinar.speaker?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              date: 'Recently',
              title: `Welcome to ${webinar.title}`,
              content: 'All practical walkthroughs, code repositories, and section quizzes are active. Complete each section examination to advance.'
            }
          ]
        },
        curriculum,
        progress: {
          completedLessonIds,
          passedSectionIds,
          completedLessonCount,
          totalTrackableLessonCount: totalLessonsCount,
          passedQuizzesCount,
          totalSectionsCount,
          completionPercentage,
          isCourseCompleted,
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
 * Saves periodic playback position
 */
exports.savePlaybackProgress = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, lessonId, positionSeconds, durationSeconds } = req.body;

    if (!courseId || !lessonId) {
      return res.status(400).json({ success: false, message: 'courseId and lessonId are required' });
    }

    const isEntitled = await checkStudentEntitlement(user, courseId);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Course access denied' });
    }

    const webinar = await storage.getWebinarById(courseId);
    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackable = curriculumService.getTrackableLessons(curriculum);
    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, trackable.length);

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
 * Marks a lesson complete and recalculates progress
 */
exports.toggleLessonComplete = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, lessonId, completed } = req.body;

    if (!courseId || !lessonId) {
      return res.status(400).json({ success: false, message: 'courseId and lessonId are required' });
    }

    const isEntitled = await checkStudentEntitlement(user, courseId);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Course access denied' });
    }

    const webinar = await storage.getWebinarById(courseId);
    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackable = curriculumService.getTrackableLessons(curriculum);
    const totalLessonsCount = trackable.length;
    const totalSectionsCount = curriculum.length;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, totalLessonsCount);

    const isCompleted = completed !== false;
    let completedSet = new Set(progress.completedLessonIds || []);

    if (isCompleted) {
      completedSet.add(lessonId);
    } else {
      completedSet.delete(lessonId);
    }

    progress.completedLessonIds = Array.from(completedSet);
    progress.completedLessonCount = progress.completedLessonIds.length;
    progress.totalTrackableLessonCount = totalLessonsCount;

    // Recalculate combined completion percentage
    const passedSections = progress.passedSectionIds || [];
    const totalRequirements = totalLessonsCount + totalSectionsCount;
    const completedRequirements = progress.completedLessonCount + passedSections.length;
    progress.completionPercentage = totalRequirements > 0
      ? Math.min(100, Math.round((completedRequirements / totalRequirements) * 100))
      : 0;

    progress.isCourseCompleted = progress.completionPercentage === 100 && progress.completedLessonCount === totalLessonsCount && passedSections.length === totalSectionsCount;

    if (progress.isCourseCompleted && !progress.courseCompletedAt) {
      progress.courseCompletedAt = new Date();
    } else if (!progress.isCourseCompleted) {
      progress.courseCompletedAt = null;
    }

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
        totalTrackableLessonCount: totalLessonsCount,
        completionPercentage: progress.completionPercentage,
        isCourseCompleted: progress.isCourseCompleted,
        courseCompletedAt: progress.courseCompletedAt
      }
    });
  } catch (error) {
    console.error('toggleLessonComplete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/learning/quiz/:courseId/:sectionId
 * Fetches sanitized questions for section assessment (never sends answer keys)
 */
exports.getSectionQuiz = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, sectionId } = req.params;

    const isEntitled = await checkStudentEntitlement(user, courseId);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Course access denied' });
    }

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const targetSection = curriculum.find(s => s.sectionId === sectionId);
    if (!targetSection) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    // Verify all required lessons in this section are completed first
    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id);
    const completedLessonIds = progress.completedLessonIds || [];

    const sectionLessons = targetSection.lessons || [];
    const completedSectionLessons = sectionLessons.filter(l => completedLessonIds.includes(l.lessonId));

    if (completedSectionLessons.length < sectionLessons.length) {
      return res.status(403).json({
        success: false,
        code: 'LESSONS_INCOMPLETE',
        message: 'You must complete all required lessons in this section before taking the assessment.',
        completedCount: completedSectionLessons.length,
        totalRequired: sectionLessons.length
      });
    }

    const quizData = await quizService.getQuizForStudent(webinar.id, sectionId, targetSection.title);
    const attempts = await quizService.getStudentQuizHistory(user.id || user._id, webinar.id, sectionId);

    const isPassed = (progress.passedSectionIds || []).includes(sectionId);
    const quizResult = (progress.sectionQuizResults || []).find(r => r.sectionId === sectionId);

    res.json({
      success: true,
      data: {
        quiz: quizData,
        sectionTitle: targetSection.title,
        isPassed,
        bestScore: quizResult?.bestScore || (attempts[0]?.score || 0),
        attemptsCount: attempts.length,
        recentAttempts: attempts.slice(0, 5).map(a => ({
          score: a.score,
          passed: a.passed,
          submittedAt: a.submittedAt,
          attemptNumber: a.attemptNumber
        }))
      }
    });
  } catch (error) {
    console.error('getSectionQuiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/learning/quiz/:courseId/:sectionId/submit
 * Authoritatively grades quiz on backend, updates section completion, and unlocks next section
 */
exports.submitSectionQuiz = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, sectionId } = req.params;
    const { answers, selectedAnswers } = req.body;
    const studentAnswers = answers || selectedAnswers || {};

    const isEntitled = await checkStudentEntitlement(user, courseId);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Course access denied' });
    }

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const targetSection = curriculum.find(s => s.sectionId === sectionId);
    if (!targetSection) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    // Verify all required lessons are complete
    const trackable = curriculumService.getTrackableLessons(curriculum);
    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, trackable.length);
    const completedLessonIds = progress.completedLessonIds || [];

    const sectionLessons = targetSection.lessons || [];
    const completedSectionLessons = sectionLessons.filter(l => completedLessonIds.includes(l.lessonId));

    if (completedSectionLessons.length < sectionLessons.length) {
      return res.status(403).json({
        success: false,
        code: 'LESSONS_INCOMPLETE',
        message: 'Cannot submit assessment until all required lessons in this section are finished.'
      });
    }

    // Grade on backend
    const result = await quizService.submitQuizAttempt({
      userId: user.id || user._id,
      userEmail: user.email,
      courseId: webinar.id,
      sectionId,
      answers: studentAnswers
    });

    // Update progress record
    let passedSectionsSet = new Set(progress.passedSectionIds || []);
    if (result.passed) {
      passedSectionsSet.add(sectionId);
    }
    progress.passedSectionIds = Array.from(passedSectionsSet);

    // Update or add to sectionQuizResults
    let qr = (progress.sectionQuizResults || []).find(r => r.sectionId === sectionId);
    if (!qr) {
      qr = {
        sectionId,
        quizId: result.quizId,
        passed: result.passed,
        bestScore: result.score,
        attemptsCount: 1,
        lastAttemptAt: new Date()
      };
      progress.sectionQuizResults.push(qr);
    } else {
      qr.attemptsCount = (qr.attemptsCount || 0) + 1;
      qr.bestScore = Math.max(qr.bestScore || 0, result.score);
      if (result.passed) qr.passed = true;
      qr.lastAttemptAt = new Date();
    }

    // Recalculate completion
    const totalLessonsCount = trackable.length;
    const totalSectionsCount = curriculum.length;
    const totalRequirements = totalLessonsCount + totalSectionsCount;
    const completedRequirements = progress.completedLessonCount + progress.passedSectionIds.length;

    progress.completionPercentage = totalRequirements > 0
      ? Math.min(100, Math.round((completedRequirements / totalRequirements) * 100))
      : 0;

    progress.isCourseCompleted = progress.completionPercentage === 100 && progress.completedLessonCount === totalLessonsCount && progress.passedSectionIds.length === totalSectionsCount;

    if (progress.isCourseCompleted && !progress.courseCompletedAt) {
      progress.courseCompletedAt = new Date();
    }

    if (isDbActive() && progress.save) {
      await progress.save();
    }

    // Find next section
    const currentSectionIdx = curriculum.findIndex(s => s.sectionId === sectionId);
    const nextSection = currentSectionIdx >= 0 && currentSectionIdx + 1 < curriculum.length
      ? curriculum[currentSectionIdx + 1]
      : null;

    res.json({
      success: true,
      data: {
        score: result.score,
        passingScore: result.passingScore,
        passed: result.passed,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        attemptNumber: result.attemptNumber,
        sectionCompleted: result.passed && completedSectionLessons.length === sectionLessons.length,
        nextSectionUnlocked: result.passed && nextSection ? nextSection.sectionId : null,
        nextSectionTitle: result.passed && nextSection ? nextSection.title : null,
        courseCompletionPercentage: progress.completionPercentage,
        isCourseCompleted: progress.isCourseCompleted,
        feedback: result.feedback
      }
    });
  } catch (error) {
    console.error('submitSectionQuiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/learning/certificate/:courseId
 * Retrieves or registers accredited certificate upon verified 100% completion
 */
exports.getCertificate = async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    const isEntitled = await checkStudentEntitlement(user, courseId);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Course entitlement required' });
    }

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackable = curriculumService.getTrackableLessons(curriculum);
    const totalLessons = trackable.length;
    const totalSections = curriculum.length;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, totalLessons);

    const completedLessons = (progress.completedLessonIds || []).length;
    const passedSections = (progress.passedSectionIds || []).length;

    const isAllLessonsDone = completedLessons >= totalLessons;
    const isAllQuizzesPassed = passedSections >= totalSections;

    if (!isAllLessonsDone || !isAllQuizzesPassed) {
      return res.status(400).json({
        success: false,
        code: 'COMPLETION_INCOMPLETE',
        message: 'To earn your accredited certificate, you must complete all lessons and pass every section assessment.',
        completedLessons,
        totalLessons,
        passedSections,
        totalSections,
        completionPercentage: progress.completionPercentage
      });
    }

    // Unique certificate number format: CERT-KWH-2026-XXXXXX
    const certNumber = `CERT-KWH-2026-${(webinar.id || 'CRS').toUpperCase().slice(-4)}-${String(user.id || user._id || 'USR').slice(-4)}`;
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certNumber}`;

    let certDoc = null;
    if (isDbActive()) {
      try {
        certDoc = await Certificate.findOne({
          $or: [
            { certificateNumber: certNumber },
            { userId: String(user.id || user._id), courseId: webinar.id }
          ]
        }).lean();

        if (!certDoc) {
          certDoc = await Certificate.create({
            certificateNumber: certNumber,
            verificationIdentifier: `VREF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            userId: String(user.id || user._id),
            userEmail: user.email.toLowerCase().trim(),
            studentName: user.name || 'Verified Scholar',
            courseId: webinar.id,
            courseTitle: webinar.title,
            instructorName: webinar.speaker?.name || 'Lead Specialist',
            instructorRole: webinar.speaker?.role || 'Academic Director',
            issueDate: progress.courseCompletedAt || new Date(),
            totalHours: webinar.duration || '3.5 Hours',
            verificationUrl,
            metadata: {
              totalLessons,
              totalSections,
              quizzesPassed: passedSections
            }
          });
        }
      } catch (err) {
        console.warn('Certificate DB error, falling to memory:', err.message);
      }
    }

    if (!certDoc) {
      certDoc = memCertificates.find(c => c.certificateNumber === certNumber || (c.userId === String(user.id) && c.courseId === webinar.id));
      if (!certDoc) {
        certDoc = {
          certificateNumber: certNumber,
          verificationIdentifier: `VREF-${Date.now()}`,
          userId: String(user.id || user._id),
          userEmail: user.email,
          studentName: user.name || 'Verified Scholar',
          courseId: webinar.id,
          courseTitle: webinar.title,
          instructorName: webinar.speaker?.name || 'Lead Specialist',
          instructorRole: webinar.speaker?.role || 'Academic Director',
          issueDate: progress.courseCompletedAt || new Date(),
          totalHours: webinar.duration || '3.5 Hours',
          verificationUrl,
          issuer: 'Kaira Webinar Hub Certification Authority'
        };
        memCertificates.push(certDoc);
      }
    }

    // Update progress with certificate number
    if (progress.certificateNumber !== certDoc.certificateNumber) {
      progress.certificateIssued = true;
      progress.certificateNumber = certDoc.certificateNumber;
      if (isDbActive() && progress.save) await progress.save();
    }

    res.json({
      success: true,
      data: certDoc
    });
  } catch (error) {
    console.error('getCertificate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/learning/certificate/:courseId/download
 * Streams the landscape A4 certificate PDF directly to browser
 */
exports.downloadCertificatePdf = async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    const isEntitled = await checkStudentEntitlement(user, courseId);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const webinar = await storage.getWebinarById(courseId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
    const trackable = curriculumService.getTrackableLessons(curriculum);
    const progress = await getOrCreateProgress(user.id || user._id, user.email, webinar.id, trackable.length);

    if ((progress.completedLessonIds || []).length < trackable.length || (progress.passedSectionIds || []).length < curriculum.length) {
      return res.status(400).json({ success: false, message: 'All lessons and quizzes must be passed to download certificate.' });
    }

    const certNumber = `CERT-KWH-2026-${(webinar.id || 'CRS').toUpperCase().slice(-4)}-${String(user.id || user._id || 'USR').slice(-4)}`;
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certNumber}`;

    const pdfBuffer = await pdfService.generateCertificatePdf({
      certificateNumber: certNumber,
      studentName: user.name || 'Verified Scholar',
      courseTitle: webinar.title,
      instructorName: webinar.speaker?.name || 'Lead Specialist',
      instructorRole: webinar.speaker?.role || 'Academic Director',
      issuedAt: progress.courseCompletedAt || new Date(),
      verificationUrl
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate_${certNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('downloadCertificatePdf error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/learning/invoice/:courseId/download
 * Streams official A4 invoice PDF for a purchased course
 */
exports.downloadInvoicePdf = async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const email = user.email.toLowerCase().trim();
    const userId = String(user.id || user._id);

    const webinar = await storage.getWebinarById(courseId);
    const targetCourseId = webinar?.id || courseId;

    // Find completed registration
    const allRegistrations = await storage.getAllRegistrations();
    const reg = allRegistrations.find(r => 
      (r.webinarId === targetCourseId || r.webinarId === webinar?.slug) &&
      (r.email?.toLowerCase().trim() === email || String(r.userId) === userId) &&
      r.paymentStatus === 'completed'
    );

    if (!reg) {
      return res.status(404).json({ success: false, message: 'No completed purchase invoice found for this course.' });
    }

    const invoiceNumber = reg.invoiceNumber || `INV-KWH-2026-${reg.registrationId.slice(-6)}`;
    const pdfBuffer = await pdfService.generateInvoicePdf({
      invoiceNumber,
      studentName: reg.fullName || user.name || 'Learner',
      studentEmail: reg.email,
      studentPhone: reg.phone,
      courseTitle: reg.webinarTitle || webinar?.title || 'Masterclass Pass',
      amount: reg.amount,
      currency: reg.currency || 'INR',
      paymentMethod: reg.paymentMethod || 'phonepe',
      transactionId: reg.phonepeTransactionId || reg.phonepeMerchantTransactionId || reg.registrationId,
      orderId: reg.registrationId,
      paidAt: reg.verifiedAt || reg.createdAt || new Date()
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_${invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('downloadInvoicePdf error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/certificates/verify/:certificateNumber
 * Public endpoint to verify a certificate safely without exposing sensitive data
 */
exports.verifyCertificatePublic = async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    if (!certificateNumber) {
      return res.status(400).json({ success: false, message: 'Certificate number required' });
    }

    const cert = isDbActive() 
      ? await Certificate.findOne({ certificateNumber: certificateNumber.trim() }).lean()
      : memCertificates.find(c => c.certificateNumber === certificateNumber.trim());

    if (!cert) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: 'No official accredited certificate found matching this identification number.'
      });
    }

    // Mask name for privacy (e.g. Pooja S.)
    const nameParts = (cert.studentName || 'Student').trim().split(' ');
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : nameParts[0];

    res.json({
      success: true,
      isValid: true,
      data: {
        certificateNumber: cert.certificateNumber,
        studentName: maskedName,
        courseTitle: cert.courseTitle,
        instructorName: cert.instructorName,
        issueDate: cert.issueDate,
        totalHours: cert.totalHours || '3.5 Hours',
        issuer: cert.issuer || 'Kaira Webinar Hub Certification Authority'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Personal Notes Management
 */
exports.addNote = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, lessonId, lessonTitle, timestampSeconds, text } = req.body;

    if (!courseId || !lessonId || !text) {
      return res.status(400).json({ success: false, message: 'courseId, lessonId, and note text are required' });
    }

    const isEntitled = await checkStudentEntitlement(user, courseId);
    if (!isEntitled) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    const newNote = {
      _id: new mongoose.Types.ObjectId(),
      lessonId,
      lessonTitle: lessonTitle || 'Lesson Note',
      timestampSeconds: Math.max(0, Math.floor(Number(timestampSeconds) || 0)),
      text: text.trim(),
      createdAt: new Date()
    };

    progress.notes.unshift(newNote);
    if (isDbActive() && progress.save) await progress.save();

    res.json({ success: true, data: newNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, noteId } = req.params;

    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    progress.notes = progress.notes.filter(n => String(n._id) !== String(noteId));
    if (isDbActive() && progress.save) await progress.save();

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleArchive = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, isArchived } = req.body;
    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    progress.isArchived = !!isArchived;
    if (isDbActive() && progress.save) await progress.save();
    res.json({ success: true, data: { courseId, isArchived: progress.isArchived } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleMyList = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, isInMyList } = req.body;
    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    progress.isInMyList = !!isInMyList;
    if (isDbActive() && progress.save) await progress.save();
    res.json({ success: true, data: { courseId, isInMyList: progress.isInMyList } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveCourseRating = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, rating, comment } = req.body;
    const progress = await getOrCreateProgress(user.id || user._id, user.email, courseId);
    progress.rating = Math.min(5, Math.max(1, Number(rating) || 5));
    if (comment) progress.reviewComment = comment;
    if (isDbActive() && progress.save) await progress.save();
    res.json({ success: true, data: { courseId, rating: progress.rating } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
