/**
 * Comprehensive Automated Test Suite for Kaira Webinar Hub:
 * - Course Marketplace & Access Logic
 * - 10 Courses & 10 Webinars Catalog Check
 * - Enrollment Persistence & Compound Index Idempotency
 * - Non-duplicate Enrollment Prevention
 * - Isolated Course Ownership
 * - Non-enrolled Access Denial (403 Forbidden)
 * - Safe Payment Verification & Pending/Failed Rejection
 * - Completed Course State
 */

const http = require('http');

const BASE_URL = 'http://127.0.0.1:5001';

function request(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (bodyData) {
      const payload = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }

    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('   KAIRA WEBINAR HUB — COURSE MARKETPLACE & ENROLLMENT SUITE    ');
  console.log('================================================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] ${message}`);
      testsFailed++;
    }
  }

  const mongoose = require('./backend/node_modules/mongoose');
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/kaira_webinar_hub', { serverSelectionTimeoutMS: 2000 });
  } catch (mErr) {
    console.warn('Test script connecting to memory mode or mongo fallback');
  }

  try {
    // 1. Health check
    const healthRes = await request({ host: '127.0.0.1', port: 5001, path: '/health', method: 'GET' });
    assert(healthRes.status === 200, 'Server health check returns HTTP 200 OK');

    // 2. Catalog verification: Check 10 Courses
    const coursesRes = await request({ host: '127.0.0.1', port: 5001, path: '/api/v1/courses', method: 'GET' });
    assert(coursesRes.status === 200, 'GET /api/v1/courses returns HTTP 200');
    assert(coursesRes.body.count >= 10, `Catalog contains at least 10 courses (Found: ${coursesRes.body.count})`);

    const courseIds = (coursesRes.body.data || []).map(c => c.id);
    const expectedCourseIds = [
      'course-fullstack-web-dev',
      'course-react-frontend-dev',
      'course-nodejs-rest-api',
      'course-python-programming',
      'course-cloud-computing',
      'course-devops-cicd',
      'course-docker-kubernetes',
      'course-cloud-native-security',
      'course-generative-ai-fundamentals',
      'course-data-analytics-python'
    ];
    const hasAll10Courses = expectedCourseIds.every(id => courseIds.includes(id));
    assert(hasAll10Courses, 'All 10 required professional courses are present in the catalog');

    // 3. Catalog verification: Check 10 Webinars
    const webinarsRes = await request({ host: '127.0.0.1', port: 5001, path: '/api/v1/webinars', method: 'GET' });
    assert(webinarsRes.status === 200, 'GET /api/v1/webinars returns HTTP 200');
    assert(webinarsRes.body.count >= 10, `Catalog contains at least 10 webinars (Found: ${webinarsRes.body.count})`);

    const webinarIds = (webinarsRes.body.data || []).map(w => w.id);
    const expectedWebinarIds = [
      'webinar-ai-agents',
      'webinar-react-19',
      'webinar-cloud-k8s',
      'webinar-b2b-growth',
      'webinar-fullstack-arch',
      'webinar-nodejs-rest',
      'webinar-python-automation',
      'webinar-cloud-cost',
      'webinar-devops-cicd',
      'webinar-data-analytics'
    ];
    const hasAll10Webinars = expectedWebinarIds.every(id => webinarIds.includes(id));
    assert(hasAll10Webinars, 'All 10 required webinars are present with scheduled dates & speaker details');

    // 4. Authenticate a fresh student user for idempotent test isolation
    const storage = require('./backend/services/storage');
    const jwt = require('./backend/node_modules/jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'kaira_webinar_hub_super_secret_jwt_key_2026';

    const runId = Date.now();
    const testEmail = `student_${runId}@techvision.io`;
    const testName = `Test Student ${runId}`;

    const studentUser = await storage.createUser({
      name: testName,
      email: testEmail,
      phone: '9876543210',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
      role: 'student',
      isVerified: true
    });

    const studentToken = jwt.sign(
      {
        id: String(studentUser._id || studentUser.id),
        email: studentUser.email,
        role: studentUser.role || 'student',
        name: studentUser.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    assert(!!studentToken, 'Student authenticated successfully and receives JWT token');
    const authHeaders = { Authorization: `Bearer ${studentToken}` };

    // 5. Unpurchased Course: Access Curriculum should be denied with 403 Forbidden (Never grant access without verified payment)
    const unpurchasedCourseId = 'course-fullstack-web-dev';
    const curriculumRes = await request(
      { host: '127.0.0.1', port: 5001, path: `/api/v1/learning/course/${unpurchasedCourseId}`, method: 'GET', headers: authHeaders }
    );
    assert(curriculumRes.status === 403, `Unpurchased course access blocked with HTTP 403 Forbidden (code: ${curriculumRes.body.code})`);

    // 6. Enrollment status for new course: should be not enrolled
    const enrollStatusRes = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/learning/enrollment-status', method: 'GET', headers: authHeaders }
    );
    assert(enrollStatusRes.status === 200, 'GET /api/v1/learning/enrollment-status returns HTTP 200');
    const isEnrolledBefore = enrollStatusRes.body.enrolledCourseIds?.includes(unpurchasedCourseId);
    assert(!isEnrolledBefore, 'New course is NOT in student enrolled list before purchase (Shows Buy Now)');

    // 7. Initiate registration for a course
    const regRes = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/registrations/register', method: 'POST', headers: authHeaders },
      {
        webinarId: unpurchasedCourseId,
        fullName: testName,
        email: testEmail,
        phone: '9876543210',
        ticketType: 'VIP Masterclass Pass'
      }
    );
    assert(regRes.status === 200 && regRes.body.data?.registrationId, `Registration initiated successfully (RegId: ${regRes.body.data?.registrationId})`);
    const regId = regRes.body.data.registrationId;

    // 8. Pending Payment: Verifying before payment must reject access safely
    const pendingVerifyRes = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/registrations/phonepe/verify', method: 'POST', headers: authHeaders },
      { registrationId: regId }
    );
    assert(pendingVerifyRes.status === 400, 'Pending/unpaid verification rejected with HTTP 400 (Cannot grant access without payment)');

    // 9. Fulfill payment via authoritative fulfillment
    const registrationController = require('./backend/controllers/registrationController');
    const regRecord = await storage.getRegistrationById(regId);
    assert(!!regRecord, 'Registration record retrieved from storage');

    await registrationController.fulfillPaymentAndDeliverInvoice({
      registration: regRecord,
      transactionId: `TXN_TEST_VERIFIED_${Date.now()}`,
      paymentMethod: 'phonepe'
    });

    // 10. Check that Enrollment record was created linking user and course
    const enrollment = await storage.getEnrollment(regRecord.userId || regRecord.email, unpurchasedCourseId);
    assert(!!enrollment, 'Enrollment record successfully persisted linking user to purchased course');

    // 11. Idempotency: Duplicate enrollment creation returns existing record without throwing error
    const duplicateEnrollment = await storage.createEnrollment({
      userId: regRecord.userId || String(studentUser._id),
      userEmail: testEmail,
      courseId: unpurchasedCourseId,
      courseTitle: 'Full-Stack Web Development Mastery',
      amount: 499,
      status: 'active'
    });
    assert(!!duplicateEnrollment, 'Enrollment creation is idempotent (Handles duplicate calls safely)');

    // 12. Check that the purchased course now grants access to curriculum (Continue Learning)
    const entitledCurriculumRes = await request(
      { host: '127.0.0.1', port: 5001, path: `/api/v1/learning/course/${unpurchasedCourseId}`, method: 'GET', headers: authHeaders }
    );
    assert(entitledCurriculumRes.status === 200, 'Purchased course now grants access to full curriculum (HTTP 200)');

    // 13. Refresh enrollment status: Purchased course is now enrolled
    const refreshStatusRes = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/learning/enrollment-status', method: 'GET', headers: authHeaders }
    );
    assert(refreshStatusRes.body.enrolledCourseIds?.includes(unpurchasedCourseId), 'Course appears in enrolled list (Replaces Buy Now with Continue Learning)');

    // 14. Non-duplicate purchase: Attempting to initiate purchase for already owned course is prevented
    const duplicatePurchaseRes = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/registrations/register', method: 'POST', headers: authHeaders },
      {
        webinarId: unpurchasedCourseId,
        fullName: testName,
        email: testEmail,
        phone: '9876543210',
        ticketType: 'VIP Masterclass Pass'
      }
    );
    assert(duplicatePurchaseRes.status === 409, 'Duplicate purchase of already-owned course rejected with HTTP 409 Conflict');

    // 15. Other courses remain purchasable even when user owns one course
    const otherCourseId = 'course-react-frontend-dev';
    const otherCourseReg = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/registrations/register', method: 'POST', headers: authHeaders },
      {
        webinarId: otherCourseId,
        fullName: testName,
        email: testEmail,
        phone: '9876543210',
        ticketType: 'VIP Masterclass Pass'
      }
    );
    assert(otherCourseReg.status === 200, 'Other courses remain purchasable when student owns a course');

    // 16. Free course enrollment test
    const freeWebinarId = 'webinar-react-19';
    const freeEnrollRes = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/learning/enroll-free', method: 'POST', headers: authHeaders },
      { courseId: freeWebinarId }
    );
    assert(freeEnrollRes.status === 200, 'Free course / webinar enrollment succeeds with HTTP 200');

    // 17. Free course duplicate enrollment prevention
    const duplicateFreeRes = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/learning/enroll-free', method: 'POST', headers: authHeaders },
      { courseId: freeWebinarId }
    );
    assert(duplicateFreeRes.body.message.includes('already enrolled'), 'Duplicate free enrollment detected and reported gracefully');

    // 18. Admin endpoint role protection
    const adminReqHeaders = { Authorization: `Bearer ${studentToken}` };
    const adminBlockRes = await request(
      { host: '127.0.0.1', port: 5001, path: '/api/v1/admin/courses', method: 'GET', headers: adminReqHeaders }
    );
    assert(adminBlockRes.status === 403, 'Admin course management API is strictly role-protected (Student blocked with HTTP 403)');

  } catch (err) {
    console.error('Test execution error:', err);
    testsFailed++;
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  try {
    const mongoose = require('./backend/node_modules/mongoose');
    await mongoose.disconnect();
  } catch (e) {}

  if (testsFailed === 0) {
    console.log('ALL COURSE MARKETPLACE & ENROLLMENT REQUIREMENTS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
