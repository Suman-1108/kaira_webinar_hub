const assert = require('assert');
const dotenv = require('dotenv');
dotenv.config();

const storage = require('./services/storage');
const phonepeService = require('./services/phonepeService');
const registrationController = require('./controllers/registrationController');

async function runTestSuite() {
  console.log('====================================================');
  console.log('Starting PhonePe PG v2 Checkout & Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const test = async (name, fn) => {
    totalTests++;
    try {
      process.stdout.write(`TEST ${totalTests}: ${name} ... `);
      await fn();
      console.log('PASSED [OK]');
      passedTests++;
    } catch (err) {
      console.log('FAILED [X]');
      console.error('   Error:', err.message);
      if (err.stack) console.error(err.stack);
    }
  };

  // 1. SDK Configuration & Client Initialization
  await test('PhonePe SDK initializes with valid client credentials and environment', async () => {
    const config = phonepeService.getPhonePeConfig();
    assert.ok(config.clientId, 'PhonePe clientId must be present');
    assert.ok(config.clientSecret, 'PhonePe clientSecret must be present');
    assert.strictEqual(config.envStr, 'PRODUCTION', 'PHONEPE_ENV should be PRODUCTION');
    assert.strictEqual(config.clientVersion, 1, 'PhonePe clientVersion should be 1');

    const client = phonepeService.getClient();
    assert.ok(client, 'StandardCheckoutClient instance should be created');
  });

  // 2. Order ID Format and Uniqueness
  await test('Order ID satisfies PhonePe PG v2 format constraints (<= 36 chars, alphanumeric/underscore)', async () => {
    const orderIds = new Set();
    for (let i = 0; i < 5; i++) {
      const res = await phonepeService.initiatePhonePePayment({
        registrationId: `KWH-2026-${1000 + i}`,
        amount: 499,
        fullName: 'Test Scholar',
        email: 'scholar@example.com',
        phone: '9876543210',
        webinarTitle: 'AI Agents Masterclass'
      });
      assert.ok(res.merchantOrderId, 'merchantOrderId must be generated');
      assert.ok(res.merchantOrderId.length <= 36, `merchantOrderId length (${res.merchantOrderId.length}) exceeds 36 chars`);
      assert.match(res.merchantOrderId, /^ORD_[a-zA-Z0-9_]+$/, 'merchantOrderId must only contain alphanumeric characters and underscores');
      assert.ok(!orderIds.has(res.merchantOrderId), 'merchantOrderId must be globally unique');
      orderIds.add(res.merchantOrderId);
    }
  });

  // 3. Real Checkout Redirect URL Generation
  let liveOrderId = null;
  let liveMerchantOrderId = null;
  await test('Live PhonePe checkout creates pending order and returns valid redirectUrl', async () => {
    const res = await phonepeService.initiatePhonePePayment({
      registrationId: 'KWH-2026-LIVE-01',
      amount: 499,
      fullName: 'Pooja Sundaram',
      email: 'pooja.sundaram@techvision.io',
      phone: '9876543210',
      webinarTitle: 'Mastering Agentic AI & Autonomous LLM Systems'
    });

    assert.strictEqual(res.success, true, 'Payment initiation should succeed');
    assert.ok(res.paymentUrl, 'paymentUrl must be returned by PhonePe');
    assert.ok(res.paymentUrl.startsWith('https://'), 'paymentUrl must be a secure https link');
    assert.ok(res.orderId, 'orderId must be returned by PhonePe');
    assert.strictEqual(res.state, 'PENDING', 'Initial order state must be PENDING');

    liveOrderId = res.orderId;
    liveMerchantOrderId = res.merchantOrderId;
  });

  // 4. Order Status API Query (Pending Status)
  await test('checkPhonePeStatus queries PhonePe and accurately reflects PENDING state', async () => {
    assert.ok(liveMerchantOrderId, 'liveMerchantOrderId required from previous test');
    const statusRes = await phonepeService.checkPhonePeStatus(liveMerchantOrderId);
    assert.strictEqual(statusRes.state, 'PENDING', 'Order should be in PENDING state before customer payment');
    assert.strictEqual(statusRes.success, false, 'Uncompleted order must not be marked success');
    assert.strictEqual(statusRes.merchantOrderId, liveMerchantOrderId, 'merchantOrderId must match');
  });

  // 5. Course Access Guard: Rejected for Non-Completed Status
  await test('verifyPhonePePayment rejects uncompleted payment and denies course access', async () => {
    // Create a pending registration in storage
    const testReg = await storage.createRegistration({
      registrationId: 'KWH-TEST-GUARD-01',
      webinarId: 'webinar-ai-agents',
      webinarTitle: 'Mastering Agentic AI',
      fullName: 'Security Tester',
      email: 'security.tester@example.com',
      phone: '9876543210',
      amount: 499,
      currency: 'INR',
      paymentStatus: 'pending',
      paymentMethod: 'phonepe',
      phonepeMerchantTransactionId: liveMerchantOrderId,
      createdAt: new Date()
    });

    let responseStatus = null;
    let responseBody = null;
    const mockRes = {
      status(s) { responseStatus = s; return this; },
      json(b) { responseBody = b; return this; }
    };

    await registrationController.verifyPhonePePayment({
      body: { registrationId: testReg.registrationId, orderId: liveMerchantOrderId }
    }, mockRes);

    assert.strictEqual(responseStatus, 400, 'Uncompleted PhonePe payment must return HTTP 400');
    assert.strictEqual(responseBody.success, false, 'success flag must be false');
    assert.strictEqual(responseBody.state, 'PENDING', 'state should be PENDING');

    // Confirm registration record in database was NOT marked completed
    const updated = await storage.getRegistrationById(testReg.registrationId);
    assert.strictEqual(updated.paymentStatus, 'pending', 'Registration paymentStatus must remain pending');
  });

  // 6. Idempotent Payment Fulfillment & Invoice Dispatch
  let testFulfilledRegId = 'KWH-TEST-FULFILL-01';
  await test('fulfillPaymentAndDeliverInvoice completes payment, generates invoice, and is idempotent', async () => {
    const testReg = await storage.createRegistration({
      registrationId: testFulfilledRegId,
      webinarId: 'webinar-ai-agents',
      webinarTitle: 'Mastering Agentic AI',
      fullName: 'Verified Learner',
      email: 'verified.learner@example.com',
      phone: '9876543210',
      amount: 499,
      currency: 'INR',
      paymentStatus: 'pending',
      paymentMethod: 'phonepe',
      phonepeMerchantTransactionId: 'ORD_TEST_FULFILL_01',
      createdAt: new Date()
    });

    // Run first fulfillment
    const fulfilled = await registrationController.fulfillPaymentAndDeliverInvoice({
      registration: testReg,
      transactionId: 'TXN_TEST_FULFILL_PHONEPE_123',
      paymentMethod: 'phonepe'
    });

    assert.strictEqual(fulfilled.paymentStatus, 'completed', 'Status must be updated to completed');
    assert.ok(fulfilled.invoiceNumber, 'invoiceNumber must be assigned');

    // Verify duplicate fulfillment check via verify endpoint
    let duplicateRes = null;
    const mockRes = {
      json(b) { duplicateRes = b; return this; }
    };

    await registrationController.verifyPhonePePayment({
      body: { registrationId: testFulfilledRegId }
    }, mockRes);

    assert.strictEqual(duplicateRes.success, true, 'Duplicate check should return success: true');
    assert.strictEqual(duplicateRes.message, 'Payment already verified.', 'Duplicate check should recognize prior verification');
  });

  // 7. Webhook Handler with Base64 Payload & Idempotency
  await test('handlePhonePeWebhook processes valid base64 payload and skips duplicates idempotently', async () => {
    const webhookRegId = 'KWH-TEST-WEBHOOK-01';
    const webhookMerchantOrderId = 'ORD_TEST_WEBHOOK_01';

    await storage.createRegistration({
      registrationId: webhookRegId,
      webinarId: 'webinar-ai-agents',
      webinarTitle: 'Mastering Agentic AI',
      fullName: 'Webhook Learner',
      email: 'webhook.learner@example.com',
      phone: '9876543210',
      amount: 499,
      currency: 'INR',
      paymentStatus: 'pending',
      paymentMethod: 'phonepe',
      phonepeMerchantTransactionId: webhookMerchantOrderId,
      createdAt: new Date()
    });

    const payloadObj = {
      code: 'PAYMENT_SUCCESS',
      data: {
        merchantTransactionId: webhookMerchantOrderId,
        transactionId: 'TXN_PHONEPE_WH_001',
        amount: 49900,
        state: 'COMPLETED'
      }
    };
    const base64Response = Buffer.from(JSON.stringify(payloadObj)).toString('base64');

    let webhookResponse = null;
    const mockRes = {
      json(b) { webhookResponse = b; return this; },
      status(s) { return this; }
    };

    // 1st Webhook Delivery
    await registrationController.handlePhonePeWebhook({
      body: { response: base64Response }
    }, mockRes);

    assert.strictEqual(webhookResponse.status, 'SUCCESS', 'Webhook should process successfully');
    const updated = await storage.getRegistrationById(webhookRegId);
    assert.strictEqual(updated.paymentStatus, 'completed', 'Registration must be marked completed');

    // 2nd Webhook Delivery (Duplicate callback)
    let duplicateWebhookRes = null;
    const mockRes2 = {
      json(b) { duplicateWebhookRes = b; return this; },
      status(s) { return this; }
    };

    await registrationController.handlePhonePeWebhook({
      body: { response: base64Response }
    }, mockRes2);

    assert.strictEqual(duplicateWebhookRes.status, 'SUCCESS', 'Duplicate webhook must succeed');
    assert.strictEqual(duplicateWebhookRes.message, 'Already processed', 'Duplicate webhook must trigger idempotent skip');
  });

  // 8. Safe Logging & Security Guard
  await test('Error logs and responses never expose client secrets, tokens, or auth headers', async () => {
    const res = await phonepeService.initiatePhonePePayment({
      registrationId: 'KWH-ERR-TEST',
      amount: -10, // Invalid amount to trigger handled error
      fullName: 'Err Tester',
      email: 'err@example.com'
    });

    const str = JSON.stringify(res);
    assert.ok(!str.includes(process.env.PHONEPE_CLIENT_SECRET), 'clientSecret must never be exposed in result');
    assert.ok(!str.includes('Bearer'), 'Bearer tokens must never be exposed in result');
  });

  console.log('\n====================================================');
  console.log(`Test Results: ${passedTests} / ${totalTests} passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
