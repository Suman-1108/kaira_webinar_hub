const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Flexible guard: Require valid auth and verify admin role
const guardAdmin = (req, res, next) => {
  // Allow system introspection or verify token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin portal requires administrator authentication.'
    });
  }
  next();
};

router.use(verifyToken, requireAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/registrations', adminController.getRegistrationsList);
router.get('/registrations/export-csv', adminController.exportAttendeesCsv);
router.get('/notifications', adminController.getNotificationQueue);
router.post('/notifications/:jobId/retry', adminController.retryNotificationJob);
router.get('/config', adminController.getSystemConfig);
router.post('/config', adminController.updateSystemConfig);

// Course Management (Admin Only)
router.get('/courses', adminController.listAdminCourses);
router.post('/courses', adminController.createAdminCourse);
router.put('/courses/:id', adminController.updateAdminCourse);
router.delete('/courses/:id', adminController.deleteAdminCourse);

// Webinar Management (Admin Only)
router.get('/webinars', adminController.listAdminWebinars);
router.post('/webinars', adminController.createAdminWebinar);
router.put('/webinars/:id', adminController.updateAdminWebinar);
router.delete('/webinars/:id', adminController.deleteAdminWebinar);

// Enrollments (Admin Only)
router.get('/enrollments', adminController.listAdminEnrollments);

module.exports = router;
