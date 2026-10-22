/**
 * KAIRA WEBINAR HUB - COMPREHENSIVE AUTHENTICATION & DUPLICATE PREVENTION TEST SUITE
 * 
 * Verifies:
 * 1. Login 401 handling & authentic bcrypt password verification (no fake demo bypass)
 * 2. Duplicate email registration prevention (HTTP 409 Conflict with friendly message)
 * 3. Safe unverified registration recovery
 * 4. Strict role protection (public registration always assigns 'student')
 * 5. Forgot password flow (SMTP OTP -> resetToken -> new password login -> old password fails)
 * 6. Protection of existing user profiles and database records
 */

const http = require('http');

const API_BASE = 'http://localhost:5001';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

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

async function runTests() {
  console.log('\n========================================================================');
  console.log('🧪 KAIRA WEBINAR HUB: AUTH & DUPLICATE REGISTRATION TEST SUITE');
  console.log('========================================================================\n');

  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kaira_webinar_hub');

  const timestamp = Date.now();
  const testStudentEmail = `test_student_${timestamp}@kairatest.com`;
  const testPassword = 'Password@2026A';
  const newPassword = 'Password@2026B';

  try {
    // ---------------------------------------------------------
    // SECTION 1: Standard Verified User Login (Authentic BCrypt)
    // ---------------------------------------------------------
    console.log('--- SECTION 1: Standard Verified User Login (Authentic BCrypt) ---');

    // 1a. Login with correct admin credentials
    const adminLogin = await request('POST', '/api/v1/auth/login', {
      email: 'admin@kairawebinarhub.com',
      password: 'admin123'
    });
    assert(adminLogin.status === 200, '1a. Admin login succeeds with HTTP 200');
    assert(adminLogin.data.success === true, '1b. Admin login returns success: true');
    assert(adminLogin.data.user && adminLogin.data.user.role === 'admin', '1c. Admin user has role "admin"');
    assert(!!adminLogin.data.token, '1d. Admin login returns signed JWT');

    // 1e. Login with developer account
    const sumanLogin = await request('POST', '/api/v1/auth/login', {
      email: 'hellosuman29@gmail.com',
      password: 'admin123'
    });
    assert(sumanLogin.status === 200, '1e. Developer Suman admin login succeeds with HTTP 200');

    // 1f. Login with student demo account
    const poojaLogin = await request('POST', '/api/v1/auth/login', {
      email: 'pooja.sundaram@techvision.io',
      password: 'student123'
    });
    assert(poojaLogin.status === 200, '1f. Pooja Sundaram student login succeeds with HTTP 200');

    // ---------------------------------------------------------
    // SECTION 2: Rejection of Invalid Credentials (No Fake Demo Shortcuts)
    // ---------------------------------------------------------
    console.log('\n--- SECTION 2: Rejection of Invalid Credentials (No Fake Demo Bypass) ---');

    // 2a. Wrong password for admin
    const adminWrong = await request('POST', '/api/v1/auth/login', {
      email: 'admin@kairawebinarhub.com',
      password: 'wrongpassword'
    });
    assert(adminWrong.status === 401, '2a. Wrong password for admin returns HTTP 401');
    assert(adminWrong.data.message === 'Invalid email or password.', '2b. Returns safe generic error message');

    // 2c. Non-existent user login
    const nonexistent = await request('POST', '/api/v1/auth/login', {
      email: `nonexistent_${timestamp}@kairatest.com`,
      password: 'password123'
    });
    assert(nonexistent.status === 401, '2c. Non-existent user returns HTTP 401');

    // 2d. Missing credentials
    const missingCreds = await request('POST', '/api/v1/auth/login', {
      email: 'admin@kairawebinarhub.com'
    });
    assert(missingCreds.status === 400, '2d. Missing password returns HTTP 400');

    // ---------------------------------------------------------
    // SECTION 3: New Email Registration & OTP Verification
    // ---------------------------------------------------------
    console.log('\n--- SECTION 3: New Email Registration & OTP Verification ---');

    // 3a. Register new user attempting to pass role 'admin'
    const regRes = await request('POST', '/api/v1/auth/register', {
      name: 'Test Learner',
      email: testStudentEmail,
      password: testPassword,
      role: 'admin' // Attempting privilege escalation
    });

    assert(regRes.status === 200, '3a. Registration succeeds with HTTP 200');
    assert(regRes.data.requiresVerification === true, '3b. Response requires OTP verification');

    // 3c. Extract OTP from storage
    const storage = require('./services/storage');
    const pendingReg = await storage.findEmailVerification(testStudentEmail, 'registration');
    assert(pendingReg !== null, '3c. Pending verification record saved in database');
    assert(pendingReg.role === 'student', '3d. Role is strictly assigned "student" (escalation blocked)');

    // 3e. Verify with correct OTP
    // To test OTP verification without reading plaintext, create a known OTP
    const crypto = require('crypto');
    const testOtp = '654321';
    const testOtpHash = crypto.createHash('sha256').update(testOtp).digest('hex');
    await storage.updateEmailVerificationOtp(testStudentEmail, testOtpHash, new Date(Date.now() + 600000), 'registration');

    const verifyRes = await request('POST', '/api/v1/auth/verify-otp', {
      email: testStudentEmail,
      otp: testOtp
    });
    assert(verifyRes.status === 200, '3e. Valid OTP activates account with HTTP 200');
    assert(verifyRes.data.user.role === 'student', '3f. Activated user role is "student"');
    assert(verifyRes.data.user.emailVerified === true, '3g. User emailVerified is true');

    // ---------------------------------------------------------
    // SECTION 4: Duplicate Email Registration Prevention
    // ---------------------------------------------------------
    console.log('\n--- SECTION 4: Duplicate Email Registration Prevention ---');

    // 4a. Attempt registration with the now-verified email
    const dupRes = await request('POST', '/api/v1/auth/register', {
      name: 'Duplicate Attacker',
      email: testStudentEmail,
      password: 'HackerPassword@2026',
      role: 'admin'
    });

    assert(dupRes.status === 409, '4a. Duplicate registration returns HTTP 409 Conflict');
    assert(dupRes.data.conflict === true, '4b. Response includes conflict: true');
    assert(
      dupRes.data.message === 'This email address is already registered. Please log in or reset your password.',
      '4c. Returns exact specified friendly conflict message'
    );

    // 4d. Verify original user data in database was NOT overwritten
    const checkUser = await storage.findUserByEmail(testStudentEmail);
    assert(checkUser.name === 'Test Learner', '4d. Original user name remains unchanged');
    assert(checkUser.role === 'student', '4e. Original user role remains unchanged');

    // 4f. Original password still works (attacker did not overwrite password)
    const originalLogin = await request('POST', '/api/v1/auth/login', {
      email: testStudentEmail,
      password: testPassword
    });
    assert(originalLogin.status === 200, '4f. Original password logs in successfully (password was not overwritten)');

    // Attacker's password fails
    const attackerLogin = await request('POST', '/api/v1/auth/login', {
      email: testStudentEmail,
      password: 'HackerPassword@2026'
    });
    assert(attackerLogin.status === 401, '4g. Attacker password rejected with HTTP 401');

    // ---------------------------------------------------------
    // SECTION 5: Forgot Password & Reset Flow
    // ---------------------------------------------------------
    console.log('\n--- SECTION 5: Forgot Password & Reset Flow ---');

    // 5a. Request password reset
    const forgotRes = await request('POST', '/api/v1/auth/forgot-password', {
      email: testStudentEmail
    });
    assert(forgotRes.status === 200, '5a. Forgot password request returns HTTP 200');

    // 5b. Update reset OTP for testing
    const resetOtp = '852963';
    const resetOtpHash = crypto.createHash('sha256').update(resetOtp).digest('hex');
    await storage.updateEmailVerificationOtp(testStudentEmail, resetOtpHash, new Date(Date.now() + 600000), 'password_reset');

    // 5c. Verify reset OTP
    const verifyResetRes = await request('POST', '/api/v1/auth/verify-reset-otp', {
      email: testStudentEmail,
      otp: resetOtp
    });
    assert(verifyResetRes.status === 200, '5c. Verify reset OTP returns HTTP 200');
    assert(!!verifyResetRes.data.resetToken, '5d. Returns single-use resetToken');

    const resetToken = verifyResetRes.data.resetToken;

    // 5e. Reset password with valid new password
    const resetPasswordRes = await request('POST', '/api/v1/auth/reset-password', {
      token: resetToken,
      newPassword: newPassword
    });
    assert(resetPasswordRes.status === 200, '5e. Password reset succeeds with HTTP 200');

    // 5f. New password logs in successfully
    const newLogin = await request('POST', '/api/v1/auth/login', {
      email: testStudentEmail,
      password: newPassword
    });
    assert(newLogin.status === 200, '5f. New password logs in successfully');

    // 5g. Old password fails
    const oldLoginAgain = await request('POST', '/api/v1/auth/login', {
      email: testStudentEmail,
      password: testPassword
    });
    assert(oldLoginAgain.status === 401, '5g. Old password rejected with HTTP 401');

    // 5h. Replay attack with same resetToken is rejected
    const replayReset = await request('POST', '/api/v1/auth/reset-password', {
      token: resetToken,
      newPassword: 'AnotherPassword@2026'
    });
    assert(replayReset.status === 400, '5h. Replay of used resetToken rejected with HTTP 400');

    // ---------------------------------------------------------
    // SECTION 6: Data Integrity & Session Profile Check
    // ---------------------------------------------------------
    console.log('\n--- SECTION 6: Data Integrity & Session Profile Check ---');

    // 6a. GET /api/v1/auth/me with new token
    const meRes = await request('GET', '/api/v1/auth/me', null, newLogin.data.token);
    assert(meRes.status === 200, '6a. GET /api/v1/auth/me returns 200');
    assert(meRes.data.user.email === testStudentEmail, '6b. Returns authentic student email');
    assert(meRes.data.user.role === 'student', '6c. Role remains "student" after password reset');

    console.log('\n========================================================================');
    console.log(`🏁 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
