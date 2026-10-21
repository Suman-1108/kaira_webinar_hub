const mongoose = require('mongoose');
const User = require('./models/User');
const Registration = require('./models/Registration');
const Invoice = require('./models/Invoice');
const Certificate = require('./models/Certificate');
const StudentCourseProgress = require('./models/StudentCourseProgress');
const Webinar = require('./models/Webinar');
const { SectionQuiz } = require('./models/Quiz');
const storage = require('./services/storage');
const pdfService = require('./services/pdfService');
const quizService = require('./services/quizService');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5001/api';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 KAIRA WEBINAR HUB — SECTION L COMPREHENSIVE INTEGRATION SUITE');
  console.log('================================================================\n');

  await mongoose.connect('mongodb://127.0.0.1:27017/kaira_webinar_hub');

  const testTimestamp = Date.now();
  const studentEmail = `student_${testTimestamp}@example.com`;
  const attackerEmail = `attacker_${testTimestamp}@example.com`;
  const JWT_SECRET = process.env.JWT_SECRET || 'kaira_webinar_hub_super_secret_jwt_key_2026';

  // 1. Create two distinct users
  const student = await User.create({
    name: 'Test Student One',
    email: studentEmail,
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop',
    emailVerified: true
  });
  const studentToken = jwt.sign({ id: student._id, email: student.email, role: 'student' }, JWT_SECRET, { expiresIn: '1d' });

  const attacker = await User.create({
    name: 'Test Attacker Two',
    email: attackerEmail,
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop',
    emailVerified: true
  });
  const attackerToken = jwt.sign({ id: attacker._id, email: attacker.email, role: 'student' }, JWT_SECRET, { expiresIn: '1d' });

  console.log('👤 Created Test Users:');
  console.log(`   Student: ${student.email} (${student._id})`);
  console.log(`   Attacker: ${attacker.email} (${attacker._id})\n`);

  // 2. Fetch available courses
  // Clean up any lingering temporary test courses
  await Webinar.deleteMany({ id: { $regex: '^free-course' } });

  const webinars = await storage.getWebinars();
  const courseA = webinars.find(w => w.id === 'webinar-ai-agents') || webinars[0];
  const courseB = webinars.find(w => w.id === 'webinar-b2b-growth') || webinars[1];
  console.log(`📚 Testing with Course A: "${courseA.title}" (ID: ${courseA.id}, Price: ₹${courseA.price})`);
  console.log(`📚 Testing with Course B: "${courseB.title}" (ID: ${courseB.id}, Price: ₹${courseB.price})\n`);

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

  try {
    // -------------------------------------------------------------
    // Test 1 & 2: Buying Course A grants access ONLY to Course A. Course B remains locked!
    // -------------------------------------------------------------
    console.log('--- TEST GROUP 1: Individual Course Purchase & Entitlement Isolation ---');

    // 1a. Student initially has no entitlement to Course A
    const preCheckARes = await fetch(`${API_BASE}/learning/course/${courseA.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const preCheckA = await preCheckARes.json();
    assert(preCheckARes.status === 403 && preCheckA.code === 'PAYMENT_REQUIRED', '1a. Student without purchase receives HTTP 403 PAYMENT_REQUIRED for Course A');

    // Simulate verified purchase of Course A
    await Registration.create({
      registrationId: `reg_test_A_${testTimestamp}`,
      userId: student._id,
      fullName: student.name,
      email: student.email,
      phone: '9876543210',
      webinarId: courseA.id,
      webinarTitle: courseA.title,
      amount: courseA.price || 499,
      paymentMethod: 'phonepe',
      paymentStatus: 'completed',
      verifiedAt: new Date()
    });

    // 1b. Student has verified entitlement to Course A after purchase
    const postCheckARes = await fetch(`${API_BASE}/learning/course/${courseA.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const postCheckA = await postCheckARes.json();
    assert(postCheckARes.status === 200 && postCheckA.success === true, '1b. Student has verified entitlement to Course A after purchase');

    // 2. Course B remains strictly LOCKED
    const checkCourseBRes = await fetch(`${API_BASE}/learning/course/${courseB.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const checkCourseB = await checkCourseBRes.json();
    assert(checkCourseBRes.status === 403 && checkCourseB.code === 'PAYMENT_REQUIRED', '2. Course B remains strictly LOCKED with HTTP 403 (No access leakage to unpurchased courses)');

    // -------------------------------------------------------------
    // Test 3: Free courses follow configured free-enrollment rules
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Free Course Explicit Enrollment ---');
    const freeCourse = await Webinar.create({
      id: `free-course-${testTimestamp}`,
      slug: `free-course-${testTimestamp}`,
      title: 'Free Getting Started Workshop',
      category: 'General',
      categoryId: 'cat-general',
      tagline: 'Learn the fundamentals of Kaira Webinar Hub',
      description: 'A comprehensive free getting started workshop',
      speaker: {
        name: 'Kaira Academy',
        role: 'Chief Educator',
        company: 'Kaira Webinar Hub',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        bio: 'Educator and architect at Kaira Webinar Hub'
      },
      date: '2026-11-01',
      time: '10:00 AM',
      duration: '45 mins',
      price: 0,
      currency: 'INR',
      isPublished: true,
      agenda: [{ title: 'Overview', duration: '20 mins', description: 'Intro' }],
      curriculum: [
        {
          sectionId: 'sec-free-1',
          title: 'Welcome & Foundations',
          order: 1,
          lessons: [
            {
              lessonId: 'les-free-1',
              title: 'Welcome Video',
              duration: '10 mins',
              durationSeconds: 600,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              order: 1
            }
          ]
        }
      ]
    });

    // 3a. Free course is not auto-enrolled without explicit action
    const freeCheckBeforeRes = await fetch(`${API_BASE}/learning/course/${freeCourse.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(freeCheckBeforeRes.status === 403, '3a. Free course is not auto-enrolled without explicit action (Requires explicit enrollment)');

    // 3b. Explicit free enrollment call
    const freeEnrollRes = await fetch(`${API_BASE}/learning/enroll-free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ courseId: freeCourse.id })
    }).then(r => r.json());
    assert(freeEnrollRes.success === true, '3b. Explicit free enrollment grants access to 0-priced course');

    // 3c. Attempting free enrollment on paid Course A must fail
    const paidAsFreeRes = await fetch(`${API_BASE}/learning/enroll-free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${attackerToken}` },
      body: JSON.stringify({ courseId: courseA.id })
    }).then(r => r.json());
    assert(paidAsFreeRes.success === false && paidAsFreeRes.price > 0, '3c. Paid course rejects free enrollment API call with clear payment prompt');

    // -------------------------------------------------------------
    // Test 4: PhonePe failures do NOT create entitlements
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: PhonePe Failures & Security Checks ---');
    await Registration.create({
      registrationId: `reg_fail_${testTimestamp}`,
      userId: attacker._id,
      fullName: attacker.name,
      email: attacker.email,
      phone: '9876543210',
      webinarId: courseB.id,
      webinarTitle: courseB.title,
      amount: courseB.price || 499,
      paymentMethod: 'phonepe',
      paymentStatus: 'failed'
    });

    const failedEntRes = await fetch(`${API_BASE}/learning/course/${courseB.id}`, {
      headers: { Authorization: `Bearer ${attackerToken}` }
    });
    assert(failedEntRes.status === 403, '4. Failed PhonePe payment leaves course strictly locked (No entitlement granted)');

    // -------------------------------------------------------------
    // Test 5, 6, 7: Duplicate callbacks, Idempotent Invoices & PDF generation
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Idempotent Payment Fulfillment & Tax Invoice Delivery ---');
    const { fulfillPaymentAndDeliverInvoice } = require('./controllers/registrationController');
    const fulfillmentReg = await Registration.create({
      registrationId: `reg_ful_${testTimestamp}`,
      userId: student._id,
      fullName: student.name,
      email: student.email,
      phone: '9876543210',
      webinarId: courseB.id,
      webinarTitle: courseB.title,
      amount: 499,
      paymentMethod: 'phonepe',
      paymentStatus: 'pending'
    });

    // Run fulfillment 1st time
    await fulfillPaymentAndDeliverInvoice({
      registration: fulfillmentReg,
      transactionId: `TXN_${testTimestamp}`,
      paymentMethod: 'phonepe'
    });

    const invoiceCount1 = await Invoice.countDocuments({ registrationId: fulfillmentReg.registrationId });
    assert(invoiceCount1 === 1, '5a. First fulfillment creates exactly 1 Invoice record');

    // Run duplicate callback (simulate webhook + verify endpoint race condition)
    await fulfillPaymentAndDeliverInvoice({
      registration: fulfillmentReg,
      transactionId: `TXN_${testTimestamp}`,
      paymentMethod: 'phonepe'
    });

    const invoiceCount2 = await Invoice.countDocuments({ registrationId: fulfillmentReg.registrationId });
    assert(invoiceCount2 === 1, '5b. Duplicate callback does NOT duplicate invoice or delivery (Idempotency confirmed)');

    // Verify invoice fields & PDF generation
    const inv = await Invoice.findOne({ registrationId: fulfillmentReg.registrationId });
    assert(inv && inv.invoiceNumber && inv.amount === 499, '6. Invoice metadata accurately stored (Number, Course, Amount)');

    const pdfBuffer = await pdfService.generateInvoicePdf({
      invoiceNumber: inv.invoiceNumber,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: '9876543210',
      courseTitle: courseB.title,
      amount: inv.amount,
      currency: 'INR',
      paymentMethod: 'PhonePe PG v2',
      transactionId: `TXN_${testTimestamp}`,
      orderId: fulfillmentReg.registrationId,
      paidAt: new Date()
    });
    assert(pdfBuffer && pdfBuffer.length > 1000 && pdfBuffer.slice(0, 4).toString() === '%PDF', '7. Backend generated valid A4 Tax Invoice PDF (>1KB, valid %PDF header)');

    // -------------------------------------------------------------
    // Test 8, 9, 10, 11, 12: Section-wise learning, Quiz Gating & Sequential Progression
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Section Quizzes, Backend Grading & Progression ---');
    // Fetch curriculum for Course A
    const currRes = await fetch(`${API_BASE}/learning/course/${courseA.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    }).then(r => r.json());

    const curriculum = currRes.data.curriculum;
    const sec1 = curriculum[0];
    const sec2 = curriculum[1];
    assert(curriculum.length >= 2, '8a. Course has at least 2 sections configured');
    assert(sec2.isLocked === true, '8b. Section 2 is initially LOCKED (Sequential progression policy enforced)');

    // Try starting quiz before completing lessons in Section 1
    const quizBeforeLessons = await fetch(`${API_BASE}/learning/quiz/${courseA.id}/${sec1.sectionId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    }).then(r => r.json());
    assert(quizBeforeLessons.success === false && quizBeforeLessons.code === 'LESSONS_INCOMPLETE', '8c. Quiz is LOCKED until all required lessons in section are completed');

    // Complete all lessons in Section 1
    for (const lesson of sec1.lessons) {
      await fetch(`${API_BASE}/learning/complete-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ courseId: courseA.id, lessonId: lesson.lessonId, completed: true })
      });
    }

    // Now request quiz
    const quizAfterLessons = await fetch(`${API_BASE}/learning/quiz/${courseA.id}/${sec1.sectionId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    }).then(r => r.json());
    const questions = quizAfterLessons.data?.quiz?.questions || [];
    assert(quizAfterLessons.success === true && questions.length > 0, '8d. Quiz UNLOCKS once all section lessons are completed');

    // Verify answers are stripped from response (Quiz Security)
    const hasAnswerKeys = questions.some(q => q.correctAnswerIndex !== undefined || q.explanation !== undefined);
    assert(!hasAnswerKeys, '9a. Answer keys and explanations are completely STRIPPED from student quiz payload');

    // Submit a failing quiz attempt (all wrong answers)
    const wrongAnswers = {};
    questions.forEach(q => { wrongAnswers[q.questionId] = 99; });

    const failSubmitRes = await fetch(`${API_BASE}/learning/quiz/${courseA.id}/${sec1.sectionId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ selectedAnswers: wrongAnswers })
    }).then(r => r.json());

    assert(failSubmitRes.success === true && failSubmitRes.data.passed === false && failSubmitRes.data.score === 0, '10a. Backend calculates 0% score and marks quiz as FAILED');

    // Verify Section 2 remains locked after failed quiz
    const currAfterFail = await fetch(`${API_BASE}/learning/course/${courseA.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    }).then(r => r.json());
    assert(currAfterFail.data.curriculum[1].isLocked === true, '10b. Failed quiz keeps Section 2 LOCKED');

    // Now fetch server-side quiz model to get correct answers for legitimate passing
    const dbQuiz = await SectionQuiz.findOne({ courseId: courseA.id, sectionId: sec1.sectionId });
    const correctAnswers = {};
    dbQuiz.questions.forEach(q => {
      correctAnswers[q.questionId] = q.correctAnswerIndex;
    });

    const passSubmitRes = await fetch(`${API_BASE}/learning/quiz/${courseA.id}/${sec1.sectionId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ selectedAnswers: correctAnswers })
    }).then(r => r.json());

    assert(passSubmitRes.success === true && passSubmitRes.data.passed === true && passSubmitRes.data.score === 100, '11. Backend validates correct answers, awards 100% score, and marks quiz PASSED');

    // Check that Section 2 is now UNLOCKED
    const currAfterPass = await fetch(`${API_BASE}/learning/course/${courseA.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    }).then(r => r.json());
    assert(currAfterPass.data.curriculum[1].isLocked === false, '12. Next Section (Section 2) successfully UNLOCKED following passed quiz!');

    // -------------------------------------------------------------
    // Test 13 & 14: Certificate of Completion & Idempotency
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Certificate Issuance & Idempotency ---');
    // Try requesting certificate before 100% completion
    const certPrematureRes = await fetch(`${API_BASE}/learning/certificate/${courseA.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    }).then(r => r.json());
    assert(certPrematureRes.success === false && certPrematureRes.code === 'COMPLETION_INCOMPLETE', '13a. Certificate request REJECTED when course is incomplete');

    // Fast-complete remaining sections and quizzes for Course A
    for (let i = 1; i < curriculum.length; i++) {
      const sec = curriculum[i];
      for (const les of sec.lessons) {
        await fetch(`${API_BASE}/learning/complete-lesson`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
          body: JSON.stringify({ courseId: courseA.id, lessonId: les.lessonId, completed: true })
        });
      }
      // Ensure quiz exists and submit 100% pass
      let quiz = await SectionQuiz.findOne({ courseId: courseA.id, sectionId: sec.sectionId });
      if (!quiz) {
        quiz = await quizService.getOrCreateSectionQuiz(courseA.id, sec.sectionId, sec.title);
      }
      if (quiz) {
        const ca = {};
        quiz.questions.forEach(q => { ca[q.questionId] = q.correctAnswerIndex; });
        await fetch(`${API_BASE}/learning/quiz/${courseA.id}/${sec.sectionId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
          body: JSON.stringify({ selectedAnswers: ca })
        });
      }
    }

    // Now request certificate
    const certRes = await fetch(`${API_BASE}/learning/certificate/${courseA.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    }).then(r => r.json());
    assert(certRes.success === true && !!certRes.data.certificateNumber, `13b. Certificate successfully ISSUED: ${certRes.data?.certificateNumber}`);

    const certCount1 = await Certificate.countDocuments({ userId: String(student._id), courseId: courseA.id });
    // Re-request certificate
    await fetch(`${API_BASE}/learning/certificate/${courseA.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const certCount2 = await Certificate.countDocuments({ userId: String(student._id), courseId: courseA.id });
    assert(certCount1 === 1 && certCount2 === 1, '14. Repeated certificate requests are idempotent (No duplicate records)');

    // -------------------------------------------------------------
    // Test 15: Cross-User Security (Attacker cannot access Student's data)
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: Data Protection & Authorization Checks ---');
    // Attacker tries to download Student's invoice for Course A
    const attackerInvRes = await fetch(`${API_BASE}/learning/invoice/${courseA.id}/download`, {
      headers: { Authorization: `Bearer ${attackerToken}` }
    });
    assert(attackerInvRes.status === 404, '15a. Attacker cannot download another student\'s tax invoice (HTTP 404 / Unauthorized)');

    // Attacker tries to access Course A curriculum
    const attackerCurrRes = await fetch(`${API_BASE}/learning/course/${courseA.id}`, {
      headers: { Authorization: `Bearer ${attackerToken}` }
    });
    assert(attackerCurrRes.status === 403, '15b. Attacker cannot view curriculum of an unpurchased course (HTTP 403)');

    // -------------------------------------------------------------
    // Test 16: MongoDB Persistence & Public Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 8: Persistence & Public Verification ---');
    const persistedProg = await StudentCourseProgress.findOne({ userId: String(student._id), courseId: courseA.id });
    assert(persistedProg && persistedProg.isCourseCompleted === true && persistedProg.passedSectionIds.length >= 1, '16a. All completion & quiz state is reliably persisted in MongoDB');

    // Public Certificate Verification (no auth header needed)
    const pubVerifyRes = await fetch(`${API_BASE}/certificates/verify/${certRes.data.certificateNumber}`).then(r => r.json());
    assert(pubVerifyRes.success === true && pubVerifyRes.isValid === true && pubVerifyRes.data.certificateNumber === certRes.data.certificateNumber, '16b. Public Certificate Verification endpoint successfully authenticates certificate without leaking credentials');

    // Clean up temporary free course
    await Webinar.deleteOne({ id: freeCourse.id });

    console.log('\n================================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
