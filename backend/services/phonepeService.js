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
  webinarTitle,
  clientOrigin
}) => {
  const config = getPhonePeConfig();
  
  // Format merchant order ID (alphanumeric + underscore only, limit <= 36 chars)
  const cleanRegId = String(registrationId || 'KWH').replace(/[^a-zA-Z0-9]/g, '').slice(-10);
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const merchantOrderId = `ORD_${cleanRegId}_${Date.now()}_${randomSuffix}`.slice(0, 36);
  const amountInPaise = Math.round(Number(amount) * 100);

  // Validate or adapt frontend redirect URL using client origin if provided
  let baseFrontendUrl = config.frontendUrl;
  if (clientOrigin && (clientOrigin.startsWith('http://localhost') || clientOrigin.startsWith('http://127.0.0.1') || clientOrigin.includes('kairahub'))) {
    baseFrontendUrl = clientOrigin.replace(/\/+$/, '');
  }

  // Never pre-declare payment=success on redirect: actual verification is mandatory upon callback
  const redirectUrl = `${baseFrontendUrl}/my-learning?payment=callback&regId=${encodeURIComponent(registrationId)}&orderId=${encodeURIComponent(merchantOrderId)}`;

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

    // 1. Diagnostic pre-call logging (safe: no secrets, credentials, or tokens)
    console.log('[PhonePe SDK Diagnostics: Pre-Pay Request]', {
      merchantOrderId,
      configuredEnvironment: config.envStr,
      clientVersion: config.clientVersion,
      amountInPaise,
      hasRedirectUrl: !!redirectUrl
    });

    let response;
    try {
      response = await client.pay(payRequest);
      // Explicit log after client.pay() resolves
      console.log('[PhonePe SDK Diagnostics: client.pay() RESOLVED]', {
        success: true,
        merchantOrderId,
        orderId: response.orderId,
        code: response.code || 'SUCCESS',
        message: response.message || 'Pay order created successfully',
        state: response.state || 'PENDING',
        hasRedirectUrl: !!response.redirectUrl,
        redirectHost: response.redirectUrl ? new URL(response.redirectUrl).host : null
      });
    } catch (payError) {
      // Explicit log after client.pay() rejects (sanitized: no tokens, headers, or secrets)
      const errStatus = payError.httpStatusCode || payError.status || payError.response?.status || 'UNKNOWN';
      const errCode = payError.code || payError.errorCode || payError.response?.data?.code || 'SDK_ERROR';
      const errMsg = payError.message || payError.response?.data?.message || 'Payment initiation failed';
      const safeStack = payError.stack ? payError.stack.split('\n').slice(0, 3).join('\n') : 'N/A';

      console.error('[PhonePe SDK Diagnostics: client.pay() REJECTED]', {
        errorName: payError.name || 'Error',
        merchantOrderId,
        httpStatus: errStatus,
        providerCode: errCode,
        providerMessage: errMsg,
        stackSnippet: safeStack
      });

      throw payError;
    }

    return {
      success: true,
      merchantTransactionId: merchantOrderId,
      merchantOrderId,
      paymentUrl: response.redirectUrl,
      orderId: response.orderId,
      state: response.state || 'PENDING',
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
    
    const rawState = (statusResponse.state || '').toUpperCase();
    const isSuccess = rawState === 'COMPLETED' || rawState === 'SUCCESS';
    const isPending = rawState === 'PENDING';
    const normalizedState = isSuccess ? 'COMPLETED' : (isPending ? 'PENDING' : 'FAILED');

    // Extract error/failure reasons from attempt history if available
    let failureReason = null;
    if (Array.isArray(statusResponse.paymentDetails) && statusResponse.paymentDetails.length > 0) {
      const latestAttempt = statusResponse.paymentDetails[statusResponse.paymentDetails.length - 1];
      if (latestAttempt?.error) {
        failureReason = latestAttempt.error.errorMessage || latestAttempt.error.errorCode || null;
      }
    }

    return {
      success: isSuccess,
      state: normalizedState,
      orderId: statusResponse.orderId,
      merchantOrderId: statusResponse.merchantOrderId || merchantOrderId,
      amount: statusResponse.amount,
      currency: statusResponse.currency || 'INR',
      failureReason,
      raw: statusResponse
    };
  } catch (err) {
    const httpStatus = err.httpStatusCode || err.status || err.response?.status || 'UNKNOWN';
    const providerCode = err.code || err.errorCode || err.response?.data?.code || 'N/A';
    const providerMessage = err.message || err.response?.data?.message || 'Status query failed';
    
    // Safely log error without printing secrets, auth headers, or raw tokens
    console.error(`[PhonePe Status Check Error] Status query failed [orderId: ${merchantOrderId}, status: ${httpStatus}, code: ${providerCode}]: ${providerMessage}`);
    
    return {
      success: false,
      state: 'FAILED',
      httpStatus,
      errorCode: providerCode,
      message: providerMessage
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
