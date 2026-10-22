const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { verifyToken, requireInstructorOrAdmin } = require('../middleware/authMiddleware');

// Dedicated Seller / Instructor routes
router.use(verifyToken, requireInstructorOrAdmin);

router.get('/workshops', instructorController.getMyWorkshops);
router.post('/workshops', instructorController.createWorkshop);
router.get('/students', instructorController.getEnrolledStudents);
router.get('/earnings', instructorController.getEarningsOverview);

module.exports = router;
