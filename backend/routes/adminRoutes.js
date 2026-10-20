const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRegistrationsList,
  exportAttendeesCsv,
  getSystemConfig,
  updateSystemConfig
} = require('../controllers/adminController');

router.get('/stats', getDashboardStats);
router.get('/registrations', getRegistrationsList);
router.get('/export-attendees', exportAttendeesCsv);
router.get('/config', getSystemConfig);
router.post('/config', updateSystemConfig);

module.exports = router;
