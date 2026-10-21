const nodemailer = require('nodemailer');

// Configure Gmail SMTP Transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: (process.env.SMTP_PASS || '').replace(/\s+/g, '')
  }
});

/**
 * Verify SMTP connection on startup
 */
transporter.verify((error, success) => {
  if (error) {
    console.warn('[Email Service] Gmail SMTP verification warning:', error.message);
  } else {
    console.log('[Email Service] Gmail SMTP Connected & Ready (hellosuman29@gmail.com)');
  }
});

/**
 * Send Webinar Registration & Verified Pass Email
 */
async function sendRegistrationConfirmation({
  to,
  fullName,
  webinarTitle,
  date,
  time,
  ticketType,
  registrationId,
  verificationCode,
  joiningLink,
  amount
}) {
  const sender = process.env.EMAIL_FROM || 'Kaira Webinar Hub <hellosuman29@gmail.com>';
  const passPin = verificationCode || `KWH-${Math.floor(100000 + Math.random() * 900000)}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF5F7; margin: 0; padding: 24px; color: #1C1D1F; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #F1D3DE; box-shadow: 0 4px 20px rgba(151,7,71,0.08); }
        .header { background: linear-gradient(135deg, #18000A 0%, #350317 40%, #750435 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0 0; color: #FBCFE8; font-size: 13px; }
        .badge { display: inline-block; background: #970747; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; letter-spacing: 1px; }
        .verified-badge { display: inline-block; background: #15803D; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 4px; margin-left: 8px; }
        .body { padding: 32px 30px; }
        .pass-card { background: #FDF6F8; border: 1px solid #F1D3DE; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .pass-header { display: flex; justify-content: space-between; border-bottom: 1px dashed #F1D3DE; padding-bottom: 12px; margin-bottom: 12px; }
        .pass-id { font-family: monospace; font-size: 16px; font-weight: bold; color: #970747; }
        .pin-box { background: #FFFFFF; border: 2px dashed #970747; border-radius: 8px; padding: 12px; text-align: center; margin: 16px 0; }
        .pin-num { font-size: 22px; font-weight: 800; letter-spacing: 4px; color: #970747; font-family: monospace; }
        .btn { display: inline-block; background: linear-gradient(135deg, #970747 0%, #750435 100%); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 8px; margin: 16px 0; box-shadow: 0 4px 14px rgba(151,7,71,0.3); text-align: center; }
        .footer { background: #FAF5F7; padding: 20px 30px; text-align: center; font-size: 12px; color: #71717A; border-top: 1px solid #F1D3DE; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">Registration Confirmed</div>
          <h1>Verified Student Access Pass</h1>
          <p>Kaira Webinar Hub • Digital Learning Platform</p>
        </div>
        <div class="body">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Your course registration is confirmed and verified in our student database <span class="verified-badge">&#10003; VERIFIED STUDENT</span>.</p>
          
          <div class="pass-card">
            <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: bold;">Verified Entry Pass</div>
            <div class="pass-id">${registrationId}</div>
            
            <h3 style="margin: 12px 0 6px 0; color: #1C1D1F; font-size: 17px;">${webinarTitle}</h3>
            <p style="margin: 0; font-size: 13px; color: #52525B;">
              📅 <strong>Session Date:</strong> ${date}<br>
              ⏰ <strong>Broadcast Time:</strong> ${time}<br>
              🎟️ <strong>Ticket Tier:</strong> ${ticketType} (${amount === 0 ? 'Free Pass' : '₹' + amount})
            </p>

            <div class="pin-box">
              <div style="font-size: 10px; font-weight: 700; color: #52525B; text-transform: uppercase; margin-bottom: 4px;">Single-Sign-On Pass Security PIN</div>
              <div class="pin-num">${passPin}</div>
              <div style="font-size: 11px; color: #71717A; margin-top: 4px;">Use this code to verify your attendance or claim your certificate of completion</div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${joiningLink}" class="btn">Access Masterclass Stream & Room →</a>
            <p style="font-size: 12px; color: #71717A; margin-top: 4px;">Pass Link: ${joiningLink}</p>
          </div>

          <p style="font-size: 13px; color: #52525B; line-height: 1.5; margin-top: 24px;">
            <strong>Important Instructions:</strong><br>
            • This pass is bound to your registered student account (<strong>${to}</strong>).<br>
            • Please join 5 minutes before scheduled start time.<br>
            • Session recordings and materials will be automatically linked to your <em>My Learning</em> dashboard.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Kaira Webinar Hub. All rights reserved.<br>
          Bengaluru, Karnataka, India • Support: hellosuman29@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject: `[Pass Confirmed] ${webinarTitle} • Pass #${registrationId}`,
      html: htmlContent
    });
    console.log(`[Email Service] Registration email sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send registration email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Password Reset Link Email
 */
async function sendPasswordResetEmail({ to, resetLink }) {
  const sender = process.env.EMAIL_FROM || 'Kaira Webinar Hub <hellosuman29@gmail.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF5F7; margin: 0; padding: 24px; color: #1C1D1F; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #F1D3DE; }
        .header { background: #970747; padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
        .body { padding: 30px 24px; }
        .btn { display: inline-block; background: #970747; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 8px; margin: 16px 0; }
        .footer { background: #FAF5F7; padding: 16px 24px; text-align: center; font-size: 11px; color: #71717A; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kaira Webinar Hub</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #FBCFE8;">Password Recovery</p>
        </div>
        <div class="body">
          <p>We received a request to reset the password for your Kaira account (<strong>${to}</strong>).</p>
          <p>Click the button below to choose a new password. This link is valid for 1 hour:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="btn">Reset My Password →</a>
          </div>
          <p style="font-size: 12px; color: #71717A; margin-top: 20px;">
            If you did not make this request, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Kaira Webinar Hub. Secured with 256-bit encryption.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject: `Reset Your Kaira Webinar Hub Password`,
      html: htmlContent
    });
    console.log(`[Email Service] Password reset email sent to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Password reset email failure to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Contact Enquiry Notification to Admin and Acknowledgment to Sender
 */
async function sendEnquiryEmails({ fullName, email, phone, subject, message }) {
  const sender = process.env.EMAIL_FROM || 'Kaira Webinar Hub <hellosuman29@gmail.com>';
  const adminEmail = process.env.SMTP_USER || 'hellosuman29@gmail.com';

  // 1. Notify Admin
  try {
    await transporter.sendMail({
      from: sender,
      to: adminEmail,
      subject: `[New Enquiry] ${subject} - from ${fullName}`,
      html: `
        <h3>New Webinar Marketplace Enquiry Received</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #FDF6F8; border-left: 3px solid #970747; padding: 10px 16px;">
          ${message}
        </blockquote>
      `
    });
  } catch (e) {
    console.warn('[Email Service] Admin enquiry alert warning:', e.message);
  }

  // 2. Acknowledge User
  try {
    await transporter.sendMail({
      from: sender,
      to: email,
      subject: `We have received your enquiry: ${subject} • Kaira Webinar Hub`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1C1D1F;">
          <h2 style="color: #970747;">Thank You for Reaching Out</h2>
          <p>Hello ${fullName},</p>
          <p>We have received your message regarding "<strong>${subject}</strong>". An academic coordinator from Kaira Webinar Hub will get back to you within 24 business hours.</p>
          <p style="font-size: 12px; color: #71717A;">Kaira Webinar Hub Support Desk</p>
        </div>
      `
    });
  } catch (e) {
    console.warn('[Email Service] User enquiry receipt warning:', e.message);
  }
}

/**
 * Send 6-Digit Email Verification OTP
 */
async function sendVerificationOtpEmail({ to, fullName, otp, expiresMinutes = 10 }) {
  const sender = process.env.EMAIL_FROM || 'Kaira Webinar Hub <hellosuman29@gmail.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF5F7; margin: 0; padding: 24px; color: #1C1D1F; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #F1D3DE; box-shadow: 0 4px 20px rgba(151,7,71,0.08); }
        .header { background: linear-gradient(135deg, #18000A 0%, #350317 40%, #750435 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; color: #FBCFE8; font-size: 13px; }
        .badge { display: inline-block; background: #970747; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px; letter-spacing: 1px; }
        .body { padding: 32px 28px; }
        .otp-box { background: #FDF6F8; border: 2px dashed #970747; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 11px; font-weight: 700; color: #71717A; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
        .otp-code { font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #970747; font-family: 'Courier New', Courier, monospace; margin: 8px 0; }
        .otp-expiry { font-size: 12px; color: #831843; font-weight: 600; }
        .warning-box { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-size: 12px; color: #92400E; line-height: 1.5; }
        .footer { background: #FAF5F7; padding: 20px 24px; text-align: center; font-size: 11px; color: #71717A; border-top: 1px solid #F1D3DE; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">Security Verification</div>
          <h1>Verify Your Email Address</h1>
          <p>Kaira Webinar Hub • Digital Learning Platform</p>
        </div>
        <div class="body">
          <p style="font-size: 15px; margin-top: 0;">Hello <strong>${fullName || 'Learner'}</strong>,</p>
          <p style="font-size: 14px; color: #52525B; line-height: 1.5;">
            Thank you for registering on <strong>Kaira Webinar Hub</strong>. Please use the verification code below to confirm your email and activate your student account.
          </p>
          
          <div class="otp-box">
            <div class="otp-label">Your One-Time Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏳ Valid for ${expiresMinutes} minutes only</div>
          </div>

          <div class="warning-box">
            <strong>Security Notice:</strong> Never share this code with anyone. Kaira Webinar Hub representatives will never ask for your verification code or password.
          </div>

          <p style="font-size: 13px; color: #52525B; line-height: 1.5;">
            If this code expires, you can request a new code from the verification screen.<br>
            If you did not request this registration, please ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Kaira Webinar Hub. All rights reserved.<br>
          Bengaluru, Karnataka, India • Support: hellosuman29@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject: `${otp} is your Kaira Webinar Hub verification code`,
      text: `Your Kaira Webinar Hub email verification code is: ${otp}. This code is valid for ${expiresMinutes} minutes. Never share this code with anyone.\n\nSupport: hellosuman29@gmail.com`,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': `kaira-otp-${Date.now()}`
      }
    });
    console.log(`[Email Service] Verification OTP email successfully dispatched to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send verification OTP email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  transporter,
  sendRegistrationConfirmation,
  sendVerificationOtpEmail,
  sendPasswordResetEmail,
  sendEnquiryEmails
};
