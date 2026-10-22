const { StandardCheckoutClient, StandardCheckoutPayRequest, Env } = require('@phonepe-pg/pg-sdk-node');

/**
 * PhonePe Payment Gateway Service (PG v2 Standard Checkout)
 * Uses official @phonepe-pg/pg-sdk-node SDK
 */
const getPhonePeConfig = () => {
  const envStr = (process.env.PHONEPE_ENV || 'SANDBOX').trim().toUpperCase();
  const isProduction = envStr === 'PRODUCTION';
  const env = isProduction ? Env.PRODUCTION : Env.SANDBOX;

  return {
    clientId: process.env.PHONEPE_CLIENT_ID || '',
    clientSecret: process.env.PHONEPE_CLIENT_SECRET || '',
    clientVersion: parseInt(process.env.PHONEPE_CLIENT_VERSION || '1', 10),
    merchantId: process.env.PHONEPE_MERCHANT_ID || '',
    env,
    envStr,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:5001'
  };
};



let cachedClient = null;

const getClient = () => {
  const config = getPhonePeConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error('PhonePe Client ID and Client Secret must be configured in environment (.env).');
  }

  try {
    cachedClient = StandardCheckoutClient.getInstance(
      config.clientId,
      config.clientSecret,
      config.clientVersion,
      config.env
    );
    return cachedClient;
  } catch (err) {
    // If instance already created or SHA matches, return existing
    if (cachedClient) return cachedClient;
    throw err;
  }
};

/**
 * Initiate a PhonePe Standard Checkout payment order
 */
const initiatePhonePePayment = async ({
  registrationId,
  amount,
  fullName,
  email,
  phone,
  webinarTitle
}) => {
  const config = getPhonePeConfig();
  
  // Format merchant order ID (alphanumeric + underscore only, limit <= 36 chars)
  const cleanRegId = String(registrationId || 'KWH').replace(/[^a-zA-Z0-9]/g, '').slice(-10);
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const merchantOrderId = `ORD_${cleanRegId}_${Date.now()}_${randomSuffix}`.slice(0, 36);
  const amountInPaise = Math.round(Number(amount) * 100);

  // Never pre-declare payment=success on redirect: actual verification is mandatory upon callback
  const redirectUrl = `${config.frontendUrl}/my-learning?payment=callback&regId=${encodeURIComponent(registrationId)}&orderId=${encodeURIComponent(merchantOrderId)}`;

  try {
    const client = getClient();
    const payRequestBuilder = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl);

    if (webinarTitle) {
      payRequestBuilder.message(`Pass for ${String(webinarTitle).slice(0, 45)}`);
    }

    // Standard PG v2 Checkout: do not attach prefillUserLoginDetails so PhonePe renders
    // the universal web checkout UI (QR, UPI apps, Cards, NetBanking) cleanly without
    // attempting deep-linking or custom scheme launches (e.g. ppe://linkinstruments).
    const payRequest = payRequestBuilder.build();
    console.log(`[PhonePe SDK] Initiating standard pay request for order: ${merchantOrderId} (${config.envStr} mode)`);
    
    const response = await client.pay(payRequest);

    return {
      success: true,
      merchantTransactionId: merchantOrderId,
      merchantOrderId,
      paymentUrl: response.redirectUrl,
      orderId: response.orderId,
      state: response.state,
      provider: 'phonepe',
      mode: config.envStr.toLowerCase()
    };
  } catch (err) {
    const httpStatus = err.httpStatusCode || err.status || err.response?.status || 'UNKNOWN';
    const providerCode = err.code || err.errorCode || err.response?.data?.code || 'N/A';
    const providerMessage = err.message || err.response?.data?.message || 'Payment initiation failed';
    
    // Safely log error without printing secrets, auth headers, or raw tokens
    console.error(`[PhonePe SDK Error] Pay initiation failed [orderId: ${merchantOrderId}, status: ${httpStatus}, code: ${providerCode}]: ${providerMessage}`);
    
    return {
      success: false,
      merchantTransactionId: merchantOrderId,
      merchantOrderId,
      httpStatus,
      errorCode: providerCode,
      message: providerMessage || 'PhonePe payment checkout could not be initiated.'
    };
  }
};

/**
 * Check PhonePe transaction / order status
 */
const checkPhonePeStatus = async (merchantOrderId) => {
  try {
    const client = getClient();
    const statusResponse = await client.getOrderStatus(merchantOrderId, true);
    
    const isSuccess = statusResponse.state === 'COMPLETED' || statusResponse.state === 'SUCCESS';
    return {
      success: isSuccess,
      state: statusResponse.state,
      orderId: statusResponse.orderId,
      merchantOrderId: statusResponse.merchantOrderId || merchantOrderId,
      amount: statusResponse.amount,
      raw: statusResponse
    };
  } catch (err) {
    const httpStatus = err.httpStatusCode || err.status || err.response?.status || 'UNKNOWN';
    const providerCode = err.code || err.errorCode || err.response?.data?.code || 'N/A';
    console.error(`[PhonePe Status Check Error] Status query failed [orderId: ${merchantOrderId}, status: ${httpStatus}, code: ${providerCode}]: ${err.message}`);
    
    return {
      success: false,
      state: 'FAILED',
      httpStatus,
      errorCode: providerCode,
      message: err.message
    };
  }
};

/**
 * Validate webhook notification callback
 */
const validateCallback = (username, password, authorization, body) => {
  try {
    const client = getClient();
    return client.validateCallback(username, password, authorization, body);
  } catch (err) {
    console.error('[PhonePe Webhook Validation Error]:', err.message);
    return null;
  }
};

module.exports = {
  getPhonePeConfig,
  getClient,
  initiatePhonePePayment,
  checkPhonePeStatus,
  validateCallback
};
