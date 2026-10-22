require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const { getClient, checkPhonePeStatus } = require('./services/phonepeService');
const storage = require('./services/storage');

const API_BASE = 'http://localhost:5001/api';

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kaira_webinar_hub');
  console.log('================================================================');
  console.log('🧪 RUNNING COMPLETE PHONEPE PG V2 STANDARD CHECKOUT TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Authenticate with verified user
    console.log('--- TEST 1: Authenticate Student User ---');
    const loginRes = await axios.post(`${API_BASE}/v1/auth/login`, {
      email: 'pooja.sundaram@techvision.io',
      password: 'student123'
    });

    assert(loginRes.data.success === true && loginRes.data.token, 'Student logged in successfully');
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Initiate Paid Registration
    console.log('\n--- TEST 2: Reserve VIP Masterclass Pass ---');
    const webinars = await storage.getWebinars();
    const targetWebinar = webinars[0];
    const regRes = await axios.post(`${API_BASE}/registration/initiate`, {
      webinarId: targetWebinar.id,
      fullName: 'Pooja Sundaram',
      email: 'pooja.sundaram@techvision.io',
      phone: '9876543210',
      ticketType: 'VIP Masterclass Pass',
      paymentProvider: 'phonepe'
    }, { headers: authHeaders });

    assert(regRes.data.success === true, 'Registration reserved successfully');
    assert(regRes.data.data.paymentStatus === 'pending', 'Initial paymentStatus is pending');
    assert(regRes.data.data.amount > 0, `Payable amount is ₹${regRes.data.data.amount}`);
    const regId = regRes.data.data.registrationId;
    console.log(`    Registration ID: ${regId}, Amount: ₹${regRes.data.data.amount}`);

    // 3. Create PhonePe PG v2 Standard Checkout Order
    console.log('\n--- TEST 3: Create PhonePe PG v2 Order via Official SDK ---');
    const orderRes = await axios.post(`${API_BASE}/payments/phonepe/create-order`, {
      registrationId: regId
    }, { headers: authHeaders });

    assert(orderRes.data.success === true, 'PhonePe create-order endpoint returned success: true');
    assert(typeof orderRes.data.redirectUrl === 'string' && orderRes.data.redirectUrl.startsWith('https://mercury'), 'Returned official SDK redirectUrl starting with https://mercury');
    assert(orderRes.data.redirectUrl.includes('token='), 'Redirect URL contains secure transaction token');
    assert(typeof orderRes.data.orderId === 'string' && orderRes.data.orderId.length > 5, `Received PhonePe orderId: ${orderRes.data.orderId}`);
    assert(typeof orderRes.data.merchantOrderId === 'string', `Received merchantOrderId: ${orderRes.data.merchantOrderId}`);
    console.log(`    PhonePe Order ID: ${orderRes.data.orderId}`);
    console.log(`    Merchant Order ID: ${orderRes.data.merchantOrderId}`);
    console.log(`    Redirect URL: ${orderRes.data.redirectUrl.slice(0, 80)}...`);

    // 4. Verify checkout page loads with HTTP 200 without ppe:// deep-link requirements
    console.log('\n--- TEST 4: Inspect Actual Checkout Page Response ---');
    const pageFetch = await fetch(orderRes.data.redirectUrl);
    assert(pageFetch.status === 200, `PhonePe checkout URL loaded successfully with HTTP ${pageFetch.status}`);
    const pageHtml = await pageFetch.text();
    assert(pageHtml.includes('PhonePe'), 'Checkout page HTML includes official PhonePe branding');

    // 5. Verify Payment Status Query via PhonePe PG v2 SDK
    console.log('\n--- TEST 5: Query Live Order Status via PhonePe SDK (Uncompleted/Pending) ---');
    const statusQuery = await checkPhonePeStatus(orderRes.data.merchantOrderId);
    assert(statusQuery.state === 'PENDING', `PhonePe SDK reports live state: ${statusQuery.state}`);
    assert(statusQuery.success === false, 'Pending transaction correctly reports success: false');

    // 6. Verify /api/payments/phonepe/verify rejects uncompleted payment
    console.log('\n--- TEST 6: Verify Payment Endpoint Security (No Simulated Success) ---');
    try {
      await axios.post(`${API_BASE}/payments/phonepe/verify`, {
        registrationId: regId,
        orderId: orderRes.data.merchantOrderId
      }, { headers: authHeaders });
      assert(false, 'Expected verify endpoint to reject pending payment');
    } catch (err) {
      assert(err.response?.status === 400, `Verify endpoint correctly returned HTTP 400 for pending payment: "${err.response?.data?.message}"`);
      assert(err.response?.data?.state === 'PENDING', 'Verify response contains state: PENDING');
    }

    // 7. Verify Registration Remains Pending and Not Unlocked
    console.log('\n--- TEST 7: Verify Course Access Remains Strictly Denied ---');
    const checkReg = await storage.getRegistrationById(regId);
    assert(checkReg.paymentStatus === 'pending', `Registration status in DB is still: ${checkReg.paymentStatus}`);

    // 8. Test Webhook with Unverified/Fake Completion (Security Verification)
    console.log('\n--- TEST 8: Webhook Security (Rejects Unconfirmed Fake Completion) ---');
    const fakeWebhookRes = await axios.post(`${API_BASE}/payments/phonepe/webhook`, {
      merchantOrderId: orderRes.data.merchantOrderId,
      state: 'COMPLETED' // Claiming completed without official PhonePe confirmation
    }, { validateStatus: () => true });

    assert(fakeWebhookRes.status === 400, `Webhook rejected unconfirmed fake completion with HTTP ${fakeWebhookRes.status}`);
    const checkRegAfterWebhook = await storage.getRegistrationById(regId);
    assert(checkRegAfterWebhook.paymentStatus === 'pending', 'Course remained strictly locked after fake webhook attempt');

    // 9. Test Nonexistent / Cancelled Order Handling
    console.log('\n--- TEST 9: Verify Nonexistent / Cancelled Order Handling ---');
    try {
      await axios.post(`${API_BASE}/payments/phonepe/verify`, {
        registrationId: 'KWH-NONEXISTENT-9999',
        orderId: 'ORD_INVALID_12345'
      }, { headers: authHeaders });
      assert(false, 'Expected 404 for invalid registration');
    } catch (err) {
      assert(err.response?.status === 404, 'Nonexistent registration returned HTTP 404');
    }

    // 10. Test Ownership Security
    console.log('\n--- TEST 10: Attacker Access Denied on Other Learner Order ---');
    const adminLogin = await axios.post(`${API_BASE}/v1/auth/login`, {
      email: 'admin@kairawebinarhub.com',
      password: 'admin123'
    });
    // Another student/user
    const student2Res = await axios.post(`${API_BASE}/v1/auth/login`, {
      email: 'hellosuman29@gmail.com',
      password: 'admin123'
    });
    const s2Token = student2Res.data.token;
    
    // Attacker (pooja) attempts to call create-order on admin's registration or another user
    const otherReg = await axios.post(`${API_BASE}/registration/initiate`, {
      webinarId: targetWebinar.id,
      fullName: 'Suman Admin',
      email: 'hellosuman29@gmail.com',
      phone: '9876543210',
      ticketType: 'VIP Masterclass Pass',
      paymentProvider: 'phonepe'
    }, { headers: { Authorization: `Bearer ${s2Token}` } });

    try {
      await axios.post(`${API_BASE}/payments/phonepe/create-order`, {
        registrationId: otherReg.data.data.registrationId
      }, { headers: authHeaders }); // using pooja's token
      assert(false, 'Expected 403 Forbidden for unauthorized order creation');
    } catch (err) {
      assert(err.response?.status === 403, `Attacker forbidden with HTTP ${err.response?.status}: "${err.response?.data?.message}"`);
    }

    console.log('\n================================================================');
    console.log(`🎉 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (outerErr) {
    console.error('Unexpected test error:', outerErr.response?.data || outerErr.message);
    process.exit(1);
  }
}

runTests();
