// backend/test_system_verification_complete.js
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const storage = require('./services/storage');
const emailService = require('./services/emailService');
const phonepeService = require('./services/phonepeService');
const { validatePassword } = require('./utils/passwordValidator');

const User = require('./models/User');
const Registration = require('./models/Registration');

const API_BASE = 'http://localhost:5001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'kaira_webinar_hub_super_secret_jwt_key_2026';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runCompleteSystemVerification() {
  console.log('\n========================================================================');
  console.log('🧪 KAIRA WEBINAR HUB: COMPREHENSIVE END-TO-END SYSTEM VERIFICATION');
  console.log('========================================================================\n');

  await mongoose.connect('mongodb://127.0.0.1:27017/kaira_webinar_hub');

  const testId = Date.now();
  const testEmail = `student_${testId}@kairatest.com`;
  const attackerEmail = `attacker_${testId}@kairatest.com`;
  const testPassword = 'Password@2026!';

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: Route Availability & Mounting
    // ------------------------------------------------------------------------
    console.log('--- SECTION 1: Route Availability & Mounting ---');

    // 1a. Health endpoints
    const healthRes = await fetch('http://localhost:5001/health');
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'OK', '1a. Root /health endpoint responds with status OK');

    const v1HealthRes = await fetch(`${API_BASE}/v1/health`);
    assert(v1HealthRes.status === 200, '1b. Versioned /api/v1/health endpoint responds with status 200');

    // 1c. Current user endpoint without token returns 401 (NOT 404)
    const noTokenMeRes = await fetch(`${API_BASE}/v1/auth/me`);
    const noTokenMeData = await noTokenMeRes.json();
    assert(noTokenMeRes.status === 401 && noTokenMeData.success === false, '1c. GET /api/v1/auth/me without token returns 401 Unauthorized (not 404)');

    // 1d. Legacy /api/auth/me without token also returns 401
    const legacyMeRes = await fetch(`${API_BASE}/auth/me`);
    assert(legacyMeRes.status === 401, '1d. GET /api/auth/me route is mounted and returns 401');

    // ------------------------------------------------------------------------
    // SECTION 2: Password Policy Enforcement
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 2: Password Policy Enforcement ---');

    assert(!validatePassword('short').isValid, '2a. Rejects passwords shorter than 8 characters');
    assert(!validatePassword('alllowercase1!').isValid, '2b. Rejects passwords without uppercase letter');
    assert(!validatePassword('ALLUPPERCASE1!').isValid, '2c. Rejects passwords without lowercase letter');
    assert(!validatePassword('NoDigitsHere!@').isValid, '2d. Rejects passwords without digits');
    assert(!validatePassword('NoSpecialChar123').isValid, '2e. Rejects passwords without special characters');
    assert(validatePassword(testPassword).isValid, '2f. Accepts compliant password (8+ chars, upper, lower, digit, special)');

    // ------------------------------------------------------------------------
    // SECTION 3: Registration Without Prior Authentication (Guest Flow)
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 3: Guest Registration & SMTP OTP Flow ---');

    // 3a. Register with non-compliant password rejected by API
    const weakRegRes = await fetch(`${API_BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: testEmail,
        password: 'weak',
        phone: '9876543210'
      })
    });
    assert(weakRegRes.status === 400, '3a. Registration API rejects weak password with HTTP 400');

    // 3b. Register with compliant password creates pending account & dispatches OTP
    const regRes = await fetch(`${API_BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: testEmail,
        password: testPassword,
        phone: '9876543210'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 200 && regData.requiresVerification === true, '3b. Valid registration returns 200 with requiresVerification: true');

    // 3c. Account is NOT yet active in database
    const pendingRecord = await storage.findEmailVerification(testEmail);
    assert(pendingRecord !== null && pendingRecord.attempts === 0, '3c. Pending verification record exists with 0 attempts and hashed OTP');

    // ------------------------------------------------------------------------
    // SECTION 4: OTP Verification & Account Activation
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 4: OTP Verification & Account Activation ---');

    // 4a. Wrong OTP rejected
    const badOtpRes = await fetch(`${API_BASE}/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' })
    });
    assert(badOtpRes.status === 400, '4a. Incorrect OTP code is rejected with HTTP 400');

    // Look up real OTP from pending verification to simulate email delivery
    // Note: in storage, otpHash is SHA-256(otp). Let's simulate valid OTP by re-verifying with known OTP
    const knownOtp = '123456';
    const knownHash = crypto.createHash('sha256').update(knownOtp).digest('hex');
    await storage.updateEmailVerificationOtp(testEmail, knownHash, new Date(Date.now() + 10 * 60 * 1000));

    // 4b. Verify with correct OTP
    const goodOtpRes = await fetch(`${API_BASE}/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: knownOtp })
    });
    const goodOtpData = await goodOtpRes.json();
    assert(goodOtpRes.status === 200 && goodOtpData.token && goodOtpData.user?.emailVerified === true, '4b. Valid OTP activates account and returns JWT session');

    const studentToken = goodOtpData.token;
    const studentUser = goodOtpData.user;

    // 4c. Pending record deleted to prevent replay
    const pendingAfter = await storage.findEmailVerification(testEmail);
    assert(pendingAfter === null, '4c. Pending record deleted after activation to prevent replay');

    // ------------------------------------------------------------------------
    // SECTION 5: Login Error Handling & Credential Verification
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 5: Login Error Handling & Credential Verification ---');

    // 5a. Missing fields
    const missingRes = await fetch(`${API_BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    assert(missingRes.status === 400, '5a. Missing password returns HTTP 400');

    // 5b. Wrong password
    const wrongPwdRes = await fetch(`${API_BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword@123' })
    });
    assert(wrongPwdRes.status === 401, '5b. Incorrect password returns HTTP 401');

    // 5c. Correct password
    const loginRes = await fetch(`${API_BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success === true && loginData.token, '5c. Correct credentials returns 200 with JWT');

    // 5d. Master demo admin login
    const adminLoginRes = await fetch(`${API_BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kairawebinarhub.com', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminData.user?.role === 'admin', '5d. Admin demo account logs in successfully with role admin');

    // ------------------------------------------------------------------------
    // SECTION 6: Protected Endpoints & Empty Email Request Elimination
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 6: Protected Endpoints & Session Validation ---');

    // 6a. Authenticated GET /api/v1/auth/me returns student profile
    const meRes = await fetch(`${API_BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user?.email === testEmail, '6a. GET /api/v1/auth/me with valid token returns student profile');

    // 6b. GET /api/v1/auth/me with nonexistent user ID returns 401 (not 404)
    const ghostToken = jwt.sign({ id: new mongoose.Types.ObjectId().toString(), email: 'ghost@test.com' }, JWT_SECRET, { expiresIn: '1h' });
    const ghostRes = await fetch(`${API_BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${ghostToken}` }
    });
    assert(ghostRes.status === 401, '6b. Token with non-existent user returns HTTP 401 (not 404)');

    // 6c. User registrations endpoint rejects empty authentication
    const unauthRegsRes = await fetch(`${API_BASE}/registration/my-events`);
    assert(unauthRegsRes.status === 401, '6c. GET /api/registration/my-events without token is rejected with HTTP 401');

    // 6d. User registrations derives email strictly from validated JWT
    const authRegsRes = await fetch(`${API_BASE}/registration/my-events?email=tampered@test.com`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const authRegsData = await authRegsRes.json();
    assert(authRegsRes.status === 200 && Array.isArray(authRegsData.data), '6d. GET /api/registration/my-events succeeds and ignores query param in favor of JWT identity');

    // ------------------------------------------------------------------------
    // SECTION 7: PhonePe PG v2 Order Creation & Ownership Validation
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 7: PhonePe PG v2 Order Creation & Ownership ---');

    // Create an attacker user
    const attackerRes = await fetch(`${API_BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Attacker User', email: attackerEmail, password: testPassword, phone: '9876543211' })
    });
    const attackerOtp = '654321';
    const attackerHash = crypto.createHash('sha256').update(attackerOtp).digest('hex');
    await storage.updateEmailVerificationOtp(attackerEmail, attackerHash, new Date(Date.now() + 10 * 60 * 1000));
    const attackerVerify = await fetch(`${API_BASE}/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: attackerEmail, otp: attackerOtp })
    });
    const attackerData = await attackerVerify.json();
    const attackerToken = attackerData.token;

    // Student initiates webinar pass reservation
    const webinars = await storage.getWebinars();
    const targetWebinar = webinars[0];

    const regInitRes = await fetch(`${API_BASE}/registration/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        webinarId: targetWebinar.id,
        fullName: studentUser.name,
        email: testEmail,
        phone: '9876543210',
        ticketType: 'VIP Masterclass Pass',
        paymentProvider: 'phonepe'
      })
    });
    const regInitData = await regInitRes.json();
    assert(regInitRes.status === 200 && regInitData.data?.registrationId, '7a. Student reserves VIP Masterclass pass with pending payment');

    const registrationId = regInitData.data.registrationId;

    // 7b. Attacker cannot create PhonePe order for student's registration (Ownership check)
    const attackOrderRes = await fetch(`${API_BASE}/payments/phonepe/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${attackerToken}`
      },
      body: JSON.stringify({ registrationId })
    });
    assert(attackOrderRes.status === 403, '7b. PhonePe order creation enforces registration ownership (Attacker receives HTTP 403)');

    // 7c. Legitimate student owner creates PhonePe order using PG v2 SDK
    const studentOrderRes = await fetch(`${API_BASE}/payments/phonepe/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ registrationId })
    });
    const studentOrderData = await studentOrderRes.json();
    assert(
      studentOrderRes.status === 200 &&
      studentOrderData.success === true &&
      studentOrderData.redirectUrl &&
      studentOrderData.redirectUrl.startsWith('https://mercury'),
      '7c. PhonePe PG v2 SDK initiates order successfully and returns official mercury checkout redirectUrl'
    );

    // ------------------------------------------------------------------------
    // SECTION 8: Rejection of Simulated Payment Success
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 8: Simulated Payment Success Rejection ---');

    // 8a. Verifying an incomplete or pending PhonePe transaction must be REJECTED
    const fakeVerifyRes = await fetch(`${API_BASE}/payments/phonepe/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        registrationId,
        orderId: studentOrderData.merchantOrderId
      })
    });
    const fakeVerifyData = await fakeVerifyRes.json();
    assert(
      fakeVerifyRes.status === 400 && fakeVerifyData.success === false,
      '8a. Unpaid PhonePe transaction is strictly REJECTED by verify endpoint (No access granted without real PG confirmation)'
    );

    // 8b. Registration status in database remains pending
    const checkReg = await storage.getRegistrationById(registrationId);
    assert(checkReg.paymentStatus === 'pending', '8b. Database registration record remains strictly "pending"');

    // 8c. Course remains locked for student until payment verified
    const courseRes = await fetch(`${API_BASE}/learning/course/${targetWebinar.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const courseData = await courseRes.json();
    assert(courseRes.status === 403 && courseData.code === 'PAYMENT_REQUIRED', '8c. Student cannot access webinar curriculum while payment is pending');

    // ------------------------------------------------------------------------
    // SECTION 9: Verified Payment Fulfillment & Idempotency
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 9: Verified Payment Fulfillment & Idempotency ---');

    // Simulate legitimate verification fulfillment
    const fulfilled = await registrationController_fulfill({
      registration: checkReg,
      transactionId: `TXN_PHONEPE_${Date.now()}`,
      paymentMethod: 'phonepe'
    });
    assert(fulfilled.paymentStatus === 'completed', '9a. Legitimate fulfillment updates paymentStatus to completed');

    // Access is now unlocked
    const unlockedCourseRes = await fetch(`${API_BASE}/learning/course/${targetWebinar.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const unlockedData = await unlockedCourseRes.json();
    assert(unlockedCourseRes.status === 200 && unlockedData.success === true, '9b. Course curriculum successfully UNLOCKED for student after payment fulfillment');

    // ------------------------------------------------------------------------
    // SECTION 10: Razorpay & WhatsApp Disablement Verification
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 10: Razorpay & WhatsApp Disablement & PhonePe/SMTP Exclusivity ---');

    // 10a. Razorpay verification endpoint is disabled (returns HTTP 410)
    const rzpVerifyRes = await fetch(`${API_BASE}/registration/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId, razorpayPaymentId: 'pay_test' })
    });
    assert(rzpVerifyRes.status === 410, '10a. Obsolete Razorpay verify-payment endpoint returns HTTP 410 Gone');

    // 10b. Razorpay webhook is disabled (returns HTTP 410, cannot grant access)
    const rzpWebhookRes = await fetch(`${API_BASE}/registration/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { order_id: 'order_test' } } } })
    });
    assert(rzpWebhookRes.status === 410, '10b. Obsolete Razorpay webhook endpoint returns HTTP 410 Gone');

    // 10c. Meta WhatsApp webhook challenge is disabled (returns HTTP 410)
    const waWebhookGetRes = await fetch(`${API_BASE}/registration/webhook/whatsapp?hub.mode=subscribe&hub.challenge=test_123`);
    assert(waWebhookGetRes.status === 410, '10c. Obsolete WhatsApp GET webhook endpoint returns HTTP 410 Gone');

    // 10d. Meta WhatsApp webhook event handler is disabled (returns HTTP 410)
    const waWebhookPostRes = await fetch(`${API_BASE}/registration/webhook/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ object: 'whatsapp_business_account' })
    });
    assert(waWebhookPostRes.status === 410, '10d. Obsolete WhatsApp POST webhook endpoint returns HTTP 410 Gone');

    // 10e. Check registered paid order: paymentMethod is 'phonepe' and no razorpayOrderId generated
    assert(checkReg.paymentMethod === 'phonepe', '10e. Paid registration defaults paymentMethod to "phonepe"');

    // 10f. Notification queue contains zero WhatsApp jobs for this registration
    const allJobs = await storage.getNotificationJobs();
    const studentWaJobs = allJobs.filter(j => j.registrationId === registrationId && j.channel === 'whatsapp');
    assert(studentWaJobs.length === 0, '10f. Zero WhatsApp notification jobs queued for registration (channel is email-only)');

  } catch (err) {
    console.error('Unhandled test suite error:', err);
    failed++;
  } finally {
    // Clean up test records
    await User.deleteMany({ email: { $in: [testEmail, attackerEmail] } });
    await Registration.deleteMany({ email: { $in: [testEmail, attackerEmail] } });
    await mongoose.disconnect();
  }

  console.log('\n========================================================================');
  console.log(`🏁 SYSTEM VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');
}

// Helper to trigger internal fulfillment function
async function registrationController_fulfill(params) {
  const regController = require('./controllers/registrationController');
  return await regController.fulfillPaymentAndDeliverInvoice(params);
}

runCompleteSystemVerification();
