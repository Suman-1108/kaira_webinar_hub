const express = require('express');
const router = express.Router();
const webinarController = require('../controllers/webinarController');

router.get('/', webinarController.getWebinars);
router.get('/categories', webinarController.getCategories);
router.get('/speakers', webinarController.getSpeakers);
router.get('/:identifier', webinarController.getWebinarByIdOrSlug);

router.post('/', webinarController.createWebinar);
router.put('/:id', webinarController.updateWebinar);
router.delete('/:id', webinarController.deleteWebinar);

module.exports = router;
