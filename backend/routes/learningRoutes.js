const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');

// Student-authenticated Udemy-style learning & entitlement routes
router.get('/enrollment-status', optionalToken, learningController.getEnrollmentStatus);
router.get('/my-courses', verifyToken, learningController.getMyEnrolledCourses);
router.post('/enroll-free', verifyToken, learningController.enrollFreeCourse);
router.get('/course/:courseId', verifyToken, learningController.getCourseCurriculum);
router.post('/progress', verifyToken, learningController.savePlaybackProgress);
router.post('/complete-lesson', verifyToken, learningController.toggleLessonComplete);

// Section Assessments / Quizzes
router.get('/quiz/:courseId/:sectionId', verifyToken, learningController.getSectionQuiz);
router.post('/quiz/:courseId/:sectionId/submit', verifyToken, learningController.submitSectionQuiz);

// Certificates & Invoices
router.get('/certificate/:courseId', verifyToken, learningController.getCertificate);
router.get('/certificate/:courseId/download', verifyToken, learningController.downloadCertificatePdf);
router.get('/invoice/:courseId/download', verifyToken, learningController.downloadInvoicePdf);

// Notes & User Preferences
router.post('/notes', verifyToken, learningController.addNote);
router.delete('/notes/:courseId/:noteId', verifyToken, learningController.deleteNote);
router.post('/archive', verifyToken, learningController.toggleArchive);
router.post('/my-list', verifyToken, learningController.toggleMyList);
router.post('/rating', verifyToken, learningController.saveCourseRating);

module.exports = router;
