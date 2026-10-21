const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');

// Protected Registration routes - strictly requiring student login
router.post('/register', verifyToken, registrationController.initiateRegistration);
router.post('/initiate', verifyToken, registrationController.initiateRegistration);
router.post('/verify-payment', verifyToken, registrationController.verifyPayment);

// Single receipt & my-events
router.get('/receipt/:id', registrationController.getRegistrationReceipt);
router.get('/my-events', verifyToken, registrationController.getUserRegistrations);
router.get('/user', verifyToken, registrationController.getUserRegistrations);

// PhonePe Payment Gateway routes
router.post('/phonepe/create-order', verifyToken, registrationController.createPhonePeOrder);
router.post('/phonepe/initiate', verifyToken, registrationController.initiateRegistration);
router.post('/phonepe/verify', optionalToken, registrationController.verifyPhonePePayment);
router.post('/phonepe/webhook', registrationController.handlePhonePeWebhook);

// Webhook routes (authenticated via HMAC signatures)
router.post('/webhook', registrationController.handleRazorpayWebhook);
router.get('/webhook/whatsapp', registrationController.verifyWhatsAppWebhook);
router.post('/webhook/whatsapp', registrationController.handleWhatsAppWebhookEvent);

module.exports = router;
