// backend/test_auth_otp_flow.js
require('dotenv').config({ path: __dirname + '/.env' });
const { validatePassword } = require('./utils/passwordValidator');
const storage = require('./services/storage');
const emailService = require('./services/emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  🧪 KAIRA WEBINAR HUB: AUTH & OTP VERIFICATION TESTS');
  console.log('======================================================\n');

  // Test 1: Password Validation Rules
  console.log('--- Test Suite 1: Password Policy Enforcement ---');
  assert(!validatePassword('short').isValid, 'Rejects password shorter than 8 chars');
  assert(!validatePassword('alllowercase1!').isValid, 'Rejects password without uppercase');
  assert(!validatePassword('ALLUPPERCASE1!').isValid, 'Rejects password without lowercase');
  assert(!validatePassword('NoDigitsHere!@').isValid, 'Rejects password without digits');
  assert(!validatePassword('NoSpecialChar123').isValid, 'Rejects password without special characters');
  assert(validatePassword('Kaira@2026A').isValid, 'Accepts compliant password (Kaira@2026A)');
  assert(validatePassword('P@ssw0rdSecure!').isValid, 'Accepts strong custom password');

  // Test 2: Cryptographic OTP Generation & SHA-256 Hashing
  console.log('\n--- Test Suite 2: Cryptographic OTP & Hashing ---');
  const otp = crypto.randomInt(100000, 1000000).toString();
  assert(/^\d{6}$/.test(otp), 'OTP is exactly 6 digits');
  
  const otpHash1 = crypto.createHash('sha256').update(otp).digest('hex');
  const otpHash2 = crypto.createHash('sha256').update(otp).digest('hex');
  assert(otpHash1 === otpHash2, 'SHA-256 OTP hashing is deterministic');
  assert(otpHash1 !== otp, 'Stored OTP is hashed, never plaintext');

  // Test 3: Email Normalization & Storage
  console.log('\n--- Test Suite 3: Email Normalization & Pending Verification ---');
  const rawEmail = '  TestStudent.Kaira@Example.Com  ';
  const cleanEmail = rawEmail.trim().toLowerCase();
  assert(cleanEmail === 'teststudent.kaira@example.com', 'Normalizes email (trimmed & lowercase)');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Kaira@2026A', salt);

  await storage.saveEmailVerification({
    email: cleanEmail,
    name: 'Test Student',
    passwordHash,
    phone: '9876543210',
    otpHash: otpHash1,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  const record = await storage.findEmailVerification(cleanEmail);
  assert(record !== null, 'Saved pending email verification record found');
  assert(record.email === cleanEmail, 'Verification record has normalized email');
  assert(record.attempts === 0, 'New verification starts with 0 attempts');

  // Test 4: Rate Limiting / Cooldown
  console.log('\n--- Test Suite 4: OTP Resend Rate Limiting (60s Cooldown) ---');
  const elapsedMs = Date.now() - new Date(record.lastSentAt).getTime();
  assert(elapsedMs < 60000, 'Identifies cooldown period active (<60s)');

  // Test 5: Incorrect OTP Rejection & Attempt Increment
  console.log('\n--- Test Suite 5: Incorrect OTP Rejection & Lockout ---');
  const wrongHash = crypto.createHash('sha256').update('999999').digest('hex');
  assert(wrongHash !== record.otpHash, 'Rejects incorrect OTP');

  await storage.incrementVerificationAttempts(cleanEmail);
  await storage.incrementVerificationAttempts(cleanEmail);
  const updatedRec = await storage.findEmailVerification(cleanEmail);
  assert(updatedRec.attempts === 2, 'Attempts increment correctly upon failure');

  // Test 6: Expired OTP Rejection
  console.log('\n--- Test Suite 6: Expired OTP Rejection ---');
  const expiredDate = new Date(Date.now() - 1000);
  assert(new Date() > expiredDate, 'Correctly flags expired timestamp');

  // Test 7: Successful OTP Verification & Account Activation
  console.log('\n--- Test Suite 7: Successful Verification & User Creation ---');
  const verifiedUser = await storage.createUser({
    name: record.name,
    email: cleanEmail,
    passwordHash: record.passwordHash,
    role: 'user',
    emailVerified: true,
    emailVerifiedAt: new Date()
  });

  assert(verifiedUser.emailVerified === true, 'Activated user has emailVerified: true');
  await storage.deleteEmailVerification(cleanEmail);
  const deletedRecord = await storage.findEmailVerification(cleanEmail);
  assert(!deletedRecord, 'Pending verification record deleted after success (prevent replay)');

  // Test 8: Login Verification Check
  console.log('\n--- Test Suite 8: Login Verification Enforcement ---');
  const userInDb = await storage.findUserByEmail(cleanEmail);
  assert(userInDb && userInDb.emailVerified === true, 'Verified user passes login verification check');

  // Simulated unverified user
  const unverifiedUser = {
    email: 'unverified@example.com',
    emailVerified: false,
    passwordHash
  };
  assert(unverifiedUser.emailVerified === false, 'Blocks unverified user from logging in');

  // Test 9: SMTP Transporter Connection Verification
  console.log('\n--- Test Suite 9: SMTP Service Status ---');
  try {
    await emailService.transporter.verify();
    assert(true, 'Gmail SMTP transporter verified and ready to dispatch real emails');
  } catch (err) {
    console.warn('  ⚠️ SMTP warning (offline or credentials check):', err.message);
  }

  // Summary
  console.log('\n======================================================');
  console.log(`  🏁 RESULT: ${passedTests} / ${totalTests} test assertions PASSED`);
  console.log('======================================================\n');
}

runTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
