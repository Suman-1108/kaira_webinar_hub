const express = require('express');
const router = express.Router();
const {
  initiateRegistration,
  verifyPayment,
  getRegistrationReceipt,
  handleRazorpayWebhook
} = require('../controllers/registrationController');

router.post('/register', initiateRegistration);
router.post('/verify-payment', verifyPayment);
router.get('/receipt/:id', getRegistrationReceipt);
router.post('/webhook/razorpay', handleRazorpayWebhook);

module.exports = router;
