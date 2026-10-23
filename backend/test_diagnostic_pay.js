require('dotenv').config();
const { getClient, getPhonePeConfig } = require('./services/phonepeService');
const { StandardCheckoutPayRequest } = require('@phonepe-pg/pg-sdk-node');

async function testDiagnostic() {
  const config = getPhonePeConfig();
  console.log('--- PhonePe Config ---');
  console.log('Environment:', config.envStr);
  console.log('Client ID:', config.clientId ? config.clientId.slice(0, 8) + '...' : 'MISSING');
  console.log('Merchant ID:', config.merchantId);
  console.log('Frontend URL:', config.frontendUrl);

  const client = getClient();
  const merchantOrderId = `ORD_DIAG_${Date.now()}`;
  const amount = 49900; // 499 INR
  const redirectUrl = `${config.frontendUrl}/my-learning?payment=callback&orderId=${merchantOrderId}`;

  console.log('\n--- Diagnostics Pre-Pay ---');
  console.log('merchantOrderId:', merchantOrderId);
  console.log('amount (paise):', amount);
  console.log('redirectUrl present:', !!redirectUrl);

  const payRequest = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amount)
    .redirectUrl(redirectUrl)
    .message('Pass for Mastering Agentic AI')
    .build();

  console.log('\n--- Executing client.pay ---');
  try {
    const res = await client.pay(payRequest);
    console.log('[SDK Pay Success]');
    console.log('success: true');
    console.log('orderId:', res.orderId);
    console.log('state:', res.state);
    console.log('hasRedirectUrl:', !!res.redirectUrl);
    console.log('redirectUrl host:', res.redirectUrl ? new URL(res.redirectUrl).host : null);

    // Now test fetching the checkout page and inspecting its responses
    console.log('\n--- Fetching Checkout Page ---');
    const pageRes = await fetch(res.redirectUrl);
    console.log('Checkout page HTTP status:', pageRes.status);
    const html = await pageRes.text();
    console.log('HTML size:', html.length, 'bytes');

    // Extract token param
    const parsedUrl = new URL(res.redirectUrl);
    const token = parsedUrl.searchParams.get('token');
    console.log('Checkout token present in URL:', !!token);

    // Look for any embedded error or script in HTML
    if (html.includes('error') || html.includes('Error')) {
      console.log('Page mentions error keywords');
    }
  } catch (err) {
    console.error('[SDK Pay Failure]');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('HTTP Status:', err.httpStatusCode || err.status || err.response?.status);
    console.error('Provider Code:', err.code || err.errorCode || err.response?.data?.code);
    console.error('Provider Data:', err.response?.data);
  }
}

testDiagnostic().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
