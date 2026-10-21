const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');

// Standard PhonePe Checkout Endpoints (as specified in PG v2 docs)
router.post('/create-order', verifyToken, registrationController.createPhonePeOrder);
router.post('/verify', optionalToken, registrationController.verifyPhonePePayment);
router.post('/webhook', registrationController.handlePhonePeWebhook);

module.exports = router;
