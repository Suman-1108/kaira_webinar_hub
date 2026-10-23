const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// GET /api/v1/courses
router.get('/', async (req, res) => {
  try {
    const courses = await storage.getCourses();
    const published = courses.filter(c => c.status !== 'archived');
    res.json({
      success: true,
      count: published.length,
      data: published
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/courses/:identifier
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const course = await storage.getCourseById(identifier);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
