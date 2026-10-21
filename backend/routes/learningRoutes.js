const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { verifyToken } = require('../middleware/authMiddleware');

// Student-authenticated Udemy-style learning routes
router.get('/my-courses', verifyToken, learningController.getMyEnrolledCourses);
router.get('/course/:courseId', verifyToken, learningController.getCourseCurriculum);
router.post('/progress', verifyToken, learningController.savePlaybackProgress);
router.post('/complete-lesson', verifyToken, learningController.toggleLessonComplete);
router.post('/notes', verifyToken, learningController.addNote);
router.delete('/notes/:courseId/:noteId', verifyToken, learningController.deleteNote);
router.post('/archive', verifyToken, learningController.toggleArchive);
router.post('/my-list', verifyToken, learningController.toggleMyList);
router.post('/rating', verifyToken, learningController.saveCourseRating);
router.get('/certificate/:courseId', verifyToken, learningController.getCertificate);

module.exports = router;
