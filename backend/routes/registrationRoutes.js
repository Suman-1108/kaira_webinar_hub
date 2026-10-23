const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');

// Registration routes - supports authenticated students and guest registrations with OTP
router.post('/', optionalToken, registrationController.initiateRegistration);
router.post('/register', optionalToken, registrationController.initiateRegistration);
router.post('/initiate', optionalToken, registrationController.initiateRegistration);
router.post('/verify-payment', optionalToken, registrationController.verifyPayment);

// Single receipt & my-events
router.get('/receipt/:id', registrationController.getRegistrationReceipt);
router.get('/my-events', verifyToken, registrationController.getUserRegistrations);
router.get('/user', verifyToken, registrationController.getUserRegistrations);

// PhonePe Payment Gateway routes
router.post('/phonepe/create-order', verifyToken, registrationController.createPhonePeOrder);
router.post('/phonepe/initiate', verifyToken, registrationController.initiateRegistration);
router.post('/phonepe/verify', optionalToken, registrationController.verifyPhonePePayment);
router.post('/phonepe/webhook', registrationController.handlePhonePeWebhook);

// Obsolete / Disabled gateway & messaging webhook routes (Safely return HTTP 410 Gone - cannot grant access)
router.post('/webhook', registrationController.handleRazorpayWebhook);
router.get('/webhook/whatsapp', registrationController.verifyWhatsAppWebhook);
router.post('/webhook/whatsapp', registrationController.handleWhatsAppWebhookEvent);

module.exports = router;
