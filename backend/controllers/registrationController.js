const crypto = require('crypto');
const storage = require('../services/storage');
const emailService = require('../services/emailService');
const phonepeService = require('../services/phonepeService');

// Generate unique registration ID and invoice number
const generateRegistrationId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `KWH-2026-${num}`;
};

const generateInvoiceNumber = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `INV-2026-${num}`;
};

// Helper to schedule automated notification reminders
const scheduleReminders = async (registration, webinar) => {
  try {
    const regId = registration.registrationId;
    const now = new Date();

    // 1. Instant Confirmation Notification (Email via Gmail SMTP)
    await storage.createNotificationJob({
      jobId: `job_${regId}_confirm_email`,
      registrationId: regId,
      webinarId: webinar.id || webinar.slug,
      recipientEmail: registration.email,
      recipientName: registration.fullName,
      channel: 'email',
      templateId: 'registration_confirmation',
      scheduledAt: now,
      sentAt: now,
      status: 'sent',
      attemptCount: 1,
      idempotencyKey: `email_confirm_${regId}`,
      createdAt: now
    });

    // Send real Gmail SMTP confirmation email with Pass Verification Code
    emailService.sendRegistrationConfirmation({
      to: registration.email,
      fullName: registration.fullName,
      webinarTitle: webinar.title,
      date: webinar.date || 'Upcoming live session',
      time: webinar.time || '6:00 PM IST',
      ticketType: registration.ticketType || 'VIP Masterclass Pass',
      registrationId: regId,
      verificationCode: registration.verificationCode,
      joiningLink: registration.joiningLink || `https://meet.kairahub.live/w/${webinar.id}?pass=${regId}`,
      amount: registration.amount || 0
    }).catch(err => console.warn('[Registration Email] Background dispatch warning:', err.message));

    // 2. 24-Hour Event Reminder (Scheduled for upcoming event date via Email)
    const reminder24hTime = new Date(Date.now() + 3600000 * 24);
    await storage.createNotificationJob({
      jobId: `job_${regId}_reminder_24h`,
      registrationId: regId,
      webinarId: webinar.id || webinar.slug,
      recipientEmail: registration.email,
      recipientPhone: `${registration.countryCode}${registration.phone}`,
      recipientName: registration.fullName,
      channel: 'email',
      templateId: 'reminder_24h',
      scheduledAt: reminder24hTime,
      status: 'scheduled',
      attemptCount: 0,
      idempotencyKey: `reminder_24h_${regId}`,
      createdAt: now
    });

    // 4. 1-Hour Event Reminder
    const reminder1hTime = new Date(Date.now() + 3600000 * 47);
    await storage.createNotificationJob({
      jobId: `job_${regId}_reminder_1h`,
      registrationId: regId,
      webinarId: webinar.id || webinar.slug,
      recipientEmail: registration.email,
      recipientPhone: `${registration.countryCode}${registration.phone}`,
      recipientName: registration.fullName,
      channel: 'email',
      templateId: 'reminder_1h',
      scheduledAt: reminder1hTime,
      status: 'scheduled',
      attemptCount: 0,
      idempotencyKey: `reminder_1h_${regId}`,
      createdAt: now
    });
  } catch (err) {
    console.warn('[Scheduler Warning]: Could not queue persistent reminder jobs:', err.message);
  }
};

// Initiate Registration - Supports both authenticated users and initial registration with OTP
exports.initiateRegistration = async (req, res) => {
  try {
    const user = req.user;
    const { webinarId, fullName, email, phone, countryCode = '+91', ticketType, whatsappOptIn = true, password } = req.body;

    const userEmail = (user ? (user.email || email) : email || '').trim().toLowerCase();
    const userName = (fullName || (user && user.name) || '').trim();

    if (!webinarId || !userName || !userEmail || !phone) {
      return res.status(400).json({ success: false, message: 'All required fields (webinarId, fullName, email, phone) must be provided.' });
    }

    // If user is not authenticated:
    if (!user) {
      // 1. Check if user already exists in DB and is verified
      const existing = await storage.findUserByEmail(userEmail);
      if (existing && existing.emailVerified !== false) {
        return res.status(409).json({
          success: false,
          requiresLogin: true,
          email: userEmail,
          message: 'An account with this email already exists. Please log in with your password to complete registration.'
        });
      }

      // 2. If password provided, handle account creation and OTP verification flow
      if (password) {
        const { validatePassword } = require('../utils/passwordValidator');
        const pwdValidation = validatePassword(password);
        if (!pwdValidation.isValid) {
          return res.status(400).json({ success: false, message: pwdValidation.message });
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await storage.saveEmailVerification({
          email: userEmail,
          name: userName,
          passwordHash,
          phone: phone ? phone.trim() : '',
          otpHash,
          expiresAt
        });

        await emailService.sendVerificationOtpEmail({
          to: userEmail,
          fullName: userName,
          otp,
          expiresMinutes: 10
        });

        return res.status(200).json({
          success: true,
          requiresVerification: true,
          email: userEmail,
          message: "We've sent a 6-digit verification code to your email. Please verify to activate your account and complete registration."
        });
      }

      // If unauthenticated and no password provided, prompt user to register or sign in
      return res.status(401).json({
        success: false,
        requiresAuth: true,
        email: userEmail,
        message: 'Please provide a password to create your student account, or log in if you already have one.'
      });
    }

    const webinar = await storage.getWebinarById(webinarId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Selected webinar not found.' });
    }

    // Determine price based on ticket type
    let amount = webinar.price;
    if (ticketType === 'Free Pass') amount = 0;
    else if (ticketType === 'VIP Masterclass Pass') amount = webinar.price || 499;
    else if (ticketType === 'Corporate Team Pass') amount = (webinar.price ? webinar.price * 3 : 1499);

    const registrationId = generateRegistrationId();
    const invoiceNumber = generateInvoiceNumber();
    const verificationCode = `VERIFY-${Math.floor(100000 + Math.random() * 900000)}`;
    const isFree = amount === 0;

    const newRegistration = {
      registrationId,
      userId: user.id || null,
      webinarId: webinar.id,
      webinarTitle: webinar.title,
      fullName: userName,
      email: userEmail,
      phone: phone.trim(),
      countryCode,
      ticketType: ticketType || (isFree ? 'Free Pass' : 'VIP Masterclass Pass'),
      amount,
      currency: 'INR',
      paymentStatus: isFree ? 'completed' : 'pending',
      paymentMethod: isFree ? 'free' : 'phonepe',
      phonepeMerchantTransactionId: '',
      phonepeTransactionId: '',
      verificationCode,
      isEmailVerified: true,
      verifiedAt: isFree ? new Date() : null,
      whatsappOptIn: false,
      emailNotificationSent: isFree,
      whatsappNotificationSent: false,
      joiningLink: `https://meet.kairahub.live/w/${webinar.id || webinar.slug}?pass=${registrationId}`,
      invoiceNumber,
      createdAt: new Date()
    };

    const saved = await storage.createRegistration(newRegistration);

    if (isFree) {
      await scheduleReminders(saved, webinar);
    }

    res.json({
      success: true,
      data: {
        registrationId: saved.registrationId,
        invoiceNumber: saved.invoiceNumber,
        verificationCode: saved.verificationCode,
        webinarTitle: webinar.title,
        amount: saved.amount,
        currency: saved.currency,
        isFree,
        paymentStatus: saved.paymentStatus,
        paymentMethod: saved.paymentMethod,
        phonepeConfig: {
          enabled: true,
          merchantId: process.env.PHONEPE_MERCHANT_ID || 'M234DRGMCCPWC',
          clientId: process.env.PHONEPE_CLIENT_ID || 'SU2604151549453655316895'
        },
        joiningLink: saved.joiningLink
      }
    });
  } catch (error) {
    console.error('initiateRegistration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Razorpay Payment Verification - Disabled in favor of PhonePe PG v2
exports.verifyPayment = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Razorpay payment verification has been disabled. PhonePe PG v2 is the active payment gateway.'
  });
};

// Get single registration receipt
exports.getRegistrationReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await storage.getRegistrationById(id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const webinar = await storage.getWebinarById(reg.webinarId);
    const regObj = (typeof reg.toObject === 'function') ? reg.toObject() : reg;

    res.json({
      success: true,
      data: {
        ...regObj,
        webinar: webinar || {
          title: reg.webinarTitle,
          date: 'TBD',
          time: 'TBD',
          speaker: { name: 'Expert Instructor', company: 'Kaira Hub' }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving receipt' });
  }
};

// Get registrations for logged-in user
exports.getUserRegistrations = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ success: false, message: 'Authentication required to view student registrations.' });
    }

    const email = req.user.email.trim().toLowerCase();
    const registrations = await storage.getRegistrationsByEmail(email);
    const webinars = await storage.getWebinars();
    const webinarMap = {};
    webinars.forEach(w => { webinarMap[w.id] = w; });

    const enriched = registrations.map(r => {
      const w = webinarMap[r.webinarId];
      return {
        ...((typeof r.toObject === 'function') ? r.toObject() : r),
        webinar: w || { title: r.webinarTitle, date: 'TBD', time: 'TBD' }
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve registrations' });
  }
};

// Razorpay Webhook Handler - Disabled
exports.handleRazorpayWebhook = async (req, res) => {
  return res.status(410).json({
    status: 'disabled',
    message: 'Razorpay webhook has been disabled. It cannot grant access or mark payments successful.'
  });
};

// WhatsApp Webhook Handlers - Disabled
exports.verifyWhatsAppWebhook = (req, res) => {
  return res.status(410).send('WhatsApp webhook integration has been disabled.');
};

exports.handleWhatsAppWebhookEvent = (req, res) => {
  return res.status(410).send('WhatsApp webhook integration has been disabled.');
};

// PhonePe Create Order Endpoint (Standard PG v2 Checkout)
exports.createPhonePeOrder = async (req, res) => {
  try {
    const { registrationId } = req.body;
    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'registrationId is required.' });
    }

    const reg = await storage.getRegistrationById(registrationId);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration record not found.' });
    }

    if (reg.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'This registration is already paid and confirmed.' });
    }

    // Validate registration ownership
    if (req.user) {
      const isOwner = (reg.userId && String(reg.userId) === String(req.user.id)) ||
                      (reg.email && reg.email.toLowerCase() === req.user.email?.toLowerCase());
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied: You do not have permission to pay for this registration.' });
      }
    }

    // Retrieve webinar from storage
    const webinar = await storage.getWebinarById(reg.webinarId);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Associated webinar not found.' });
    }

    // Derive payable amount strictly from database registration record
    const officialPrice = Number(reg.amount !== undefined ? reg.amount : webinar.price);
    if (officialPrice <= 0) {
      return res.status(400).json({ success: false, message: 'This registration has zero payable amount and does not require payment.' });
    }

    console.log(`[PhonePe Order] Initiating PG v2 checkout for reg: ${reg.registrationId}, amount: ₹${officialPrice}`);

    const phonepeData = await phonepeService.initiatePhonePePayment({
      registrationId: reg.registrationId,
      amount: officialPrice,
      fullName: reg.fullName,
      email: reg.email,
      phone: reg.phone,
      webinarTitle: webinar.title
    });

    if (phonepeData.merchantTransactionId || phonepeData.merchantOrderId) {
      await storage.updateRegistrationStatus(reg.registrationId, {
        phonepeMerchantTransactionId: phonepeData.merchantOrderId || phonepeData.merchantTransactionId
      });
    }

    if (!phonepeData.success || !phonepeData.paymentUrl) {
      console.error(`[PhonePe Order Failed for ${reg.registrationId}]: code=${phonepeData.errorCode || 'N/A'}, message=${phonepeData.message || 'Payment initiation rejected'}`);
      return res.status(400).json({
        success: false,
        errorCode: phonepeData.errorCode || 'PAYMENT_INITIATION_FAILED',
        message: phonepeData.message || 'Could not initiate PhonePe payment checkout. Please try again.'
      });
    }

    return res.json({
      success: true,
      redirectUrl: phonepeData.paymentUrl,
      orderId: phonepeData.orderId,
      merchantOrderId: phonepeData.merchantOrderId || phonepeData.merchantTransactionId,
      mode: phonepeData.mode
    });
  } catch (error) {
    console.error('[createPhonePeOrder error]:', error.message);
    res.status(500).json({ success: false, message: 'An internal error occurred while creating PhonePe order. Please try again.' });
  }
};

// Centralized Payment Fulfillment & PDF Invoice Delivery
const fulfillPaymentAndDeliverInvoice = async ({ registration, transactionId, paymentMethod = 'phonepe' }) => {
  const regId = registration.registrationId;
  const webinar = await storage.getWebinarById(registration.webinarId);
  const courseTitle = webinar?.title || registration.webinarTitle;
  const amount = Number(registration.amount || 0);
  const currency = registration.currency || 'INR';
  const invoiceNumber = registration.invoiceNumber || generateInvoiceNumber();

  // 1. Update registration status in storage / DB
  const updatedReg = await storage.updateRegistrationStatus(regId, {
    paymentStatus: 'completed',
    paymentMethod,
    phonepeTransactionId: transactionId || registration.phonepeTransactionId || '',
    verifiedAt: new Date(),
    invoiceNumber,
    emailNotificationSent: true
  });

  // 2. Persistent Invoice record with idempotency
  let invoiceDoc = null;
  try {
    const Invoice = require('../models/Invoice');
    invoiceDoc = await Invoice.findOne({ registrationId: regId });
    if (!invoiceDoc) {
      invoiceDoc = await Invoice.create({
        invoiceNumber,
        registrationId: regId,
        userId: registration.userId || null,
        userEmail: registration.email.toLowerCase().trim(),
        studentName: registration.fullName,
        studentPhone: registration.phone || '',
        courseId: webinar?.id || registration.webinarId,
        courseTitle,
        amount,
        currency,
        paymentProvider: paymentMethod,
        merchantOrderId: registration.phonepeMerchantTransactionId || registration.registrationId || '',
        transactionId: transactionId || '',
        paymentStatus: 'completed',
        paidAt: new Date(),
        emailDelivered: false
      });
    }
  } catch (invErr) {
    console.warn('[Invoice Storage Warning]:', invErr.message);
  }

  // 3. Generate Invoice PDF and send email (if not already sent)
  const isEmailDelivered = invoiceDoc?.emailDelivered;
  if (!isEmailDelivered && amount > 0) {
    try {
      const pdfService = require('../services/pdfService');
      const invoicePdf = await pdfService.generateInvoicePdf({
        invoiceNumber,
        studentName: registration.fullName,
        studentEmail: registration.email,
        studentPhone: registration.phone,
        courseTitle,
        amount,
        currency,
        paymentMethod,
        transactionId: transactionId || registration.phonepeMerchantTransactionId || '',
        orderId: regId,
        paidAt: new Date()
      });

      const emailRes = await emailService.sendPaymentSuccessInvoiceEmail({
        to: registration.email,
        fullName: registration.fullName,
        courseTitle,
        amount,
        currency,
        invoiceNumber,
        transactionId: transactionId || registration.phonepeMerchantTransactionId || '',
        paymentMethod,
        paidAt: new Date(),
        invoicePdfBuffer: invoicePdf
      });

      if (emailRes.success && invoiceDoc) {
        invoiceDoc.emailDelivered = true;
        invoiceDoc.emailDeliveredAt = new Date();
        await invoiceDoc.save();
      }
    } catch (mailErr) {
      console.error('[Invoice Email Delivery Error]:', mailErr.message);
    }
  }

  // 4. Establish initial progress in StudentCourseProgress for this student
  try {
    const StudentCourseProgress = require('../models/StudentCourseProgress');
    const curriculumService = require('../services/curriculumService');
    if (webinar) {
      const curriculum = curriculumService.buildCurriculumForWebinar(webinar);
      const trackable = curriculumService.getTrackableLessons(curriculum);
      const existingProg = await StudentCourseProgress.findOne({
        $or: [
          { userId: String(registration.userId), courseId: webinar.id },
          { userEmail: registration.email.toLowerCase().trim(), courseId: webinar.id }
        ]
      });
      if (!existingProg) {
        await StudentCourseProgress.create({
          userId: String(registration.userId || `usr_${Date.now()}`),
          userEmail: registration.email.toLowerCase().trim(),
          courseId: webinar.id,
          completedLessonIds: [],
          passedSectionIds: [],
          sectionQuizResults: [],
          lessonProgress: [],
          completedLessonCount: 0,
          totalTrackableLessonCount: trackable.length,
          completionPercentage: 0,
          isCourseCompleted: false,
          lastAccessedLessonId: trackable[0]?.lessonId || ''
        });
      }
    }
  } catch (progErr) {
    console.warn('[Progress Init Warning]:', progErr.message);
  }

  if (webinar) {
    await scheduleReminders(updatedReg || registration, webinar);
  }

  return updatedReg || registration;
};

// PhonePe Payment Verification (Synchronous / Callback)
exports.verifyPhonePePayment = async (req, res) => {
  try {
    const { registrationId, merchantTransactionId, orderId } = req.body;
    if (!registrationId && !merchantTransactionId && !orderId) {
      return res.status(400).json({ success: false, message: 'registrationId or orderId is required.' });
    }

    let reg = null;
    if (registrationId) {
      reg = await storage.getRegistrationById(registrationId);
    }
    
    if (!reg && (merchantTransactionId || orderId)) {
      const all = await storage.getAllRegistrations();
      const targetId = orderId || merchantTransactionId;
      reg = all.find(r => r.phonepeMerchantTransactionId === targetId || r.registrationId === targetId);
    }

    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    // Duplicate check: if already completed, return success immediately
    if (reg.paymentStatus === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already verified.',
        data: {
          registrationId: reg.registrationId,
          status: 'completed',
          paymentMethod: 'phonepe',
          phonepeTransactionId: reg.phonepeTransactionId,
          joiningLink: reg.joiningLink,
          invoiceNumber: reg.invoiceNumber
        }
      });
    }

    const txnId = orderId || merchantTransactionId || reg.phonepeMerchantTransactionId;
    if (!txnId) {
      return res.status(400).json({ success: false, message: 'No valid PhonePe merchant order ID found for verification.' });
    }

    // Strictly check status with PhonePe PG v2 SDK
    const statusRes = await phonepeService.checkPhonePeStatus(txnId);
    const isSuccess = statusRes.success || statusRes.state === 'COMPLETED' || statusRes.state === 'SUCCESS';

    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        message: `PhonePe payment status is ${statusRes.state || 'PENDING'}. Please complete checkout or retry.`,
        state: statusRes.state || 'FAILED'
      });
    }

    const phonepeTransactionId = statusRes.orderId || txnId;
    const fulfilled = await fulfillPaymentAndDeliverInvoice({
      registration: reg,
      transactionId: phonepeTransactionId,
      paymentMethod: 'phonepe'
    });

    return res.json({
      success: true,
      message: 'PhonePe payment verified successfully and invoice dispatched.',
      data: {
        registrationId: fulfilled.registrationId,
        status: fulfilled.paymentStatus,
        paymentMethod: 'phonepe',
        phonepeTransactionId,
        joiningLink: fulfilled.joiningLink,
        invoiceNumber: fulfilled.invoiceNumber
      }
    });
  } catch (error) {
    console.error('verifyPhonePePayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PhonePe Server-to-Server Webhook with Duplicate Protection
exports.handlePhonePeWebhook = async (req, res) => {
  try {
    const { response } = req.body;
    console.log('[PhonePe Webhook Received]');

    let merchantOrderId = null;
    let phonepeTxnId = null;
    let isSuccess = false;

    if (response) {
      try {
        const decoded = JSON.parse(Buffer.from(response, 'base64').toString('utf8'));
        if (decoded.code === 'PAYMENT_SUCCESS' || decoded.state === 'COMPLETED') {
          merchantOrderId = decoded.data?.merchantTransactionId || decoded.data?.merchantOrderId;
          phonepeTxnId = decoded.data?.transactionId || decoded.data?.orderId || merchantOrderId;
          isSuccess = true;
        }
      } catch (parseErr) {
        console.warn('[PhonePe Webhook] Base64 decode note:', parseErr.message);
      }
    } else if (req.body && (req.body.merchantOrderId || req.body.orderId)) {
      merchantOrderId = req.body.merchantOrderId || req.body.orderId;
      isSuccess = req.body.state === 'COMPLETED' || req.body.status === 'SUCCESS';
      phonepeTxnId = req.body.orderId || merchantOrderId;
    }

    if (merchantOrderId && isSuccess) {
      const all = await storage.getAllRegistrations();
      const match = all.find(r => r.phonepeMerchantTransactionId === merchantOrderId || r.registrationId === merchantOrderId);
      
      if (match) {
        if (match.paymentStatus === 'completed') {
          console.log(`[PhonePe Webhook] Order ${merchantOrderId} already completed. Idempotent skip.`);
          return res.json({ status: 'SUCCESS', message: 'Already processed' });
        }

        // Confirm true completed status via PhonePe SDK before fulfilling access
        const statusRes = await phonepeService.checkPhonePeStatus(merchantOrderId);
        const isOfficiallyCompleted = statusRes.success || statusRes.state === 'COMPLETED' || statusRes.state === 'SUCCESS';

        if (!isOfficiallyCompleted) {
          console.warn(`[PhonePe Webhook] Verification for order ${merchantOrderId} returned state: ${statusRes.state || 'UNKNOWN'}. Skipping fulfillment.`);
          return res.status(400).json({ status: 'FAILED', message: `Order status is ${statusRes.state || 'PENDING'}` });
        }

        await fulfillPaymentAndDeliverInvoice({
          registration: match,
          transactionId: statusRes.orderId || phonepeTxnId || merchantOrderId,
          paymentMethod: 'phonepe'
        });
        console.log(`[PhonePe Webhook] Successfully fulfilled registration ${match.registrationId} (verified via PhonePe SDK).`);
      }
    }

    res.json({ status: 'SUCCESS' });
  } catch (e) {
    console.error('PhonePe webhook error:', e);
    res.status(500).json({ status: 'FAILED' });
  }
};

exports.fulfillPaymentAndDeliverInvoice = fulfillPaymentAndDeliverInvoice;

