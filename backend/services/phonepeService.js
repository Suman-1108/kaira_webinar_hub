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
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5174',
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
  
  // Format merchant order ID (alphanumeric + underscore, limit <= 36 chars)
  const cleanRegId = String(registrationId).replace(/[^a-zA-Z0-9]/g, '').slice(-12);
  const merchantOrderId = `ORD_${cleanRegId}_${Date.now()}`.slice(0, 36);
  const amountInPaise = Math.round(Number(amount) * 100);

  const redirectUrl = `${config.frontendUrl}/my-learning?payment=success&regId=${encodeURIComponent(registrationId)}&orderId=${encodeURIComponent(merchantOrderId)}`;

  try {
    const client = getClient();
    const payRequestBuilder = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl);

    if (webinarTitle) {
      payRequestBuilder.message(`Pass for ${webinarTitle.slice(0, 50)}`);
    }

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
    console.error(`[PhonePe SDK Error] Pay initiation failed: ${err.message}`);
    return {
      success: false,
      merchantTransactionId: merchantOrderId,
      merchantOrderId,
      message: err.message || 'PhonePe payment could not be initiated.'
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
    console.error('[PhonePe Status Check Error]:', err.message);
    return {
      success: false,
      state: 'FAILED',
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
