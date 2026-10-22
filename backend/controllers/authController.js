const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const storage = require('../services/storage');
const emailService = require('../services/emailService');
const { validatePassword } = require('../utils/passwordValidator');

const JWT_SECRET = process.env.JWT_SECRET || 'kaira_webinar_hub_super_secret_jwt_key_2026';

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role || 'user',
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper to hash OTP with SHA-256
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

// Generate 6-digit cryptographically secure OTP
const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Initiate Registration:
 * 1. Validate name, email, password
 * 2. Enforce strict password rules
 * 3. Check for existing verified account
 * 4. Generate cryptographically secure 6-digit OTP
 * 5. Store pending verification record with SHA-256 hashed OTP
 * 6. Send OTP via Gmail SMTP
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // Password validation against policy
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: pwdValidation.message
      });
    }

    // 1. Check whether active verified account already exists in MongoDB
    const existing = await storage.findUserByEmail(cleanEmail);
    if (existing && existing.emailVerified !== false) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: 'This email address is already registered. Please log in or reset your password.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Check pending registration rate limiting (60s cooldown)
    const existingPending = await storage.findEmailVerification(cleanEmail, 'registration');
    if (existingPending && existingPending.lastSentAt) {
      const elapsedMs = Date.now() - new Date(existingPending.lastSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          requiresVerification: true,
          email: cleanEmail,
          message: `A verification code was recently sent to your email. Please check your inbox or wait ${remainingSec} seconds.`
        });
      }
    }

    // Generate 6-digit cryptographically secure OTP & hash it
    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Dispatch OTP via SMTP before storing pending verification
    const emailResult = await emailService.sendVerificationOtpEmail({
      to: cleanEmail,
      fullName: cleanName,
      otp,
      expiresMinutes: 10
    });

    if (!emailResult.success) {
      console.error('[Auth] Failed to dispatch registration OTP email to:', cleanEmail, emailResult.error);
      return res.status(500).json({
        success: false,
        message: "We couldn't send your verification email. Please try again shortly."
      });
    }

    // 4. Store in pending verification collection with student role (strictly enforce student)
    await storage.saveEmailVerification({
      email: cleanEmail,
      name: cleanName,
      passwordHash,
      phone: phone ? phone.trim() : '',
      role: 'student',
      otpHash,
      expiresAt,
      purpose: 'registration'
    });

    return res.status(200).json({
      success: true,
      message: existing
        ? "Your account is pending verification. A new verification code has been sent to your email."
        : "We've sent a verification code to your email.",
      email: cleanEmail,
      requiresVerification: true
    });
  } catch (err) {
    if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: 'This email address is already registered. Please log in or reset your password.'
      });
    }
    console.error('Register error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your registration. Please try again.'
    });
  }
};

/**
 * Verify OTP:
 * 1. Validate inputs
 * 2. Look up pending verification record
 * 3. Enforce max 5 attempts and 10-minute expiry
 * 4. Verify SHA-256 hash
 * 5. Activate user account in database
 * 6. Invalidate OTP / remove pending record
 * 7. Return authenticated session with JWT
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit verification code.'
      });
    }

    const verificationRecord = await storage.findEmailVerification(cleanEmail, 'registration');
    if (!verificationRecord) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification found for this email. Please register again.'
      });
    }

    // Check maximum attempts (max 5)
    if (verificationRecord.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed verification attempts. Please request a new code.'
      });
    }

    // Check expiration
    if (new Date() > new Date(verificationRecord.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'This verification code has expired. Request a new code.'
      });
    }

    // Compare hash
    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== verificationRecord.otpHash) {
      await storage.incrementVerificationAttempts(cleanEmail, 'registration');
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    // Correct OTP: Activate or create user account in MongoDB
    let user = await storage.findUserByEmail(cleanEmail);
    if (user) {
      user = await storage.updateUser(user._id || user.id, {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        accountStatus: 'active',
        passwordHash: verificationRecord.passwordHash,
        name: verificationRecord.name || user.name,
        phone: verificationRecord.phone || user.phone
      });
    } else {
      try {
        user = await storage.createUser({
          name: verificationRecord.name,
          email: cleanEmail,
          passwordHash: verificationRecord.passwordHash,
          phone: verificationRecord.phone || '',
          role: 'student',
          emailVerified: true,
          emailVerifiedAt: new Date(),
          accountStatus: 'active',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(verificationRecord.name)}`
        });
      } catch (createErr) {
        if (createErr.code === 11000 || (createErr.message && createErr.message.includes('E11000'))) {
          user = await storage.findUserByEmail(cleanEmail);
          if (user) {
            user = await storage.updateUser(user._id || user.id, {
              emailVerified: true,
              emailVerifiedAt: new Date(),
              accountStatus: 'active'
            });
          }
        } else {
          throw createErr;
        }
      }
    }

    // Delete verification record to prevent reuse
    await storage.deleteEmailVerification(cleanEmail, 'registration');

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to Kaira Webinar Hub.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        emailVerified: true
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify code. Please try again.'
    });
  }
};

/**
 * Resend OTP:
 * Enforces 60-second rate limiting cooldown
 */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verificationRecord = await storage.findEmailVerification(cleanEmail, 'registration');

    if (!verificationRecord) {
      // Check if user exists and is unverified
      const existingUser = await storage.findUserByEmail(cleanEmail);
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: 'No pending registration found for this email. Please register first.'
        });
      }
      if (existingUser.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'This account is already verified. Please log in.'
        });
      }
    }

    // Cooldown check (60 seconds)
    if (verificationRecord && verificationRecord.lastSentAt) {
      const elapsedMs = Date.now() - new Date(verificationRecord.lastSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} seconds before requesting a new code.`
        });
      }
    }

    const newOtp = generateSecureOtp();
    const newOtpHash = hashOtp(newOtp);
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (verificationRecord) {
      await storage.updateEmailVerificationOtp(cleanEmail, newOtpHash, newExpiresAt, 'registration');
    } else {
      const existingUser = await storage.findUserByEmail(cleanEmail);
      await storage.saveEmailVerification({
        email: cleanEmail,
        name: existingUser.name,
        passwordHash: existingUser.passwordHash,
        phone: existingUser.phone || '',
        role: 'student',
        otpHash: newOtpHash,
        expiresAt: newExpiresAt,
        purpose: 'registration'
      });
    }

    const recipientName = verificationRecord ? verificationRecord.name : 'Learner';
    const emailResult = await emailService.sendVerificationOtpEmail({
      to: cleanEmail,
      fullName: recipientName,
      otp: newOtp,
      expiresMinutes: 10
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "We couldn't send your verification email. Please try again shortly."
      });
    }

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.'
    });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification code. Please try again later.'
    });
  }
};

/**
 * Login:
 * 1. Validate email and password presence
 * 2. Authenticate credentials via strict bcrypt
 * 3. Guard against unverified or suspended accounts
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log(`[Auth] Login attempt received for: "${cleanEmail}"`);

    // 1. Find user in database
    const user = await storage.findUserByEmail(cleanEmail);
    if (!user) {
      console.log(`[Auth] User not found for email: "${cleanEmail}".`);
      const pending = await storage.findEmailVerification(cleanEmail, 'registration');
      if (pending) {
        return res.status(403).json({
          success: false,
          requiresVerification: true,
          email: cleanEmail,
          message: 'Your email address is pending verification. Please enter the verification code sent to your inbox to activate your account.'
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 2. Check if account is suspended
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support at support@kairawebinarhub.com.'
      });
    }

    // 3. Authenticate password - strictly bcrypt comparison
    if (!user.passwordHash) {
      console.log(`[Auth] User "${cleanEmail}" has missing password hash.`);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log(`[Auth] Password mismatch for: "${cleanEmail}".`);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    console.log(`[Auth] Login successful for: "${cleanEmail}" (${user.role}).`);

    // 4. Check email verification status
    if (user.emailVerified === false) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Your email address is not verified. Please verify your email to log in.'
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        headline: user.headline,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authentication token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await storage.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found or session expired.' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        headline: user.headline,
        timeZone: user.timeZone,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Update profile & preferences
exports.updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { name, phone, headline, bio, timeZone, notificationPreferences } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (headline !== undefined) updateData.headline = headline;
    if (bio !== undefined) updateData.bio = bio;
    if (timeZone) updateData.timeZone = timeZone;
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;

    const updated = await storage.updateUser(decoded.id, updateData);
    return res.json({ success: true, message: 'Profile updated.', user: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/**
 * 4. Forgot Password (Initiate Password Reset with 6-digit OTP):
 * - Generic response to prevent email enumeration
 * - Generates 6-digit OTP, hashed with SHA-256
 * - 10-minute expiry, 60s resend cooldown
 * - Dispatches email via Gmail SMTP
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const genericSuccess = {
      success: true,
      message: 'If an account exists with that email, a verification code has been sent.'
    };

    // Find user in database
    const user = await storage.findUserByEmail(cleanEmail);
    if (!user) {
      // Generic response to avoid email enumeration
      return res.status(200).json(genericSuccess);
    }

    // Check rate limit / resend cooldown (60 seconds)
    const existingReset = await storage.findEmailVerification(cleanEmail, 'password_reset');
    if (existingReset && existingReset.lastSentAt) {
      const elapsedMs = Date.now() - new Date(existingReset.lastSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} seconds before requesting a new code.`
        });
      }
    }

    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send email via Gmail SMTP first
    const emailResult = await emailService.sendPasswordResetOtpEmail({
      to: cleanEmail,
      fullName: user.name,
      otp,
      expiresMinutes: 10
    });

    if (!emailResult.success) {
      console.error('[Auth] Failed to send password reset OTP to:', cleanEmail, {
        code: emailResult.code,
        error: emailResult.error
      });
      // Invalidate/remove any pending OTP record so unauthorized reset cannot occur
      await storage.deleteEmailVerification(cleanEmail, 'password_reset');
      return res.status(500).json({
        success: false,
        message: "We couldn't deliver the verification code to your email. Please try again shortly."
      });
    }

    // Save verification record only after confirmed email dispatch
    await storage.saveEmailVerification({
      email: cleanEmail,
      name: user.name,
      otpHash,
      expiresAt,
      purpose: 'password_reset'
    });

    return res.status(200).json(genericSuccess);
  } catch (err) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ success: false, message: 'Error processing password reset.' });
  }
};

/**
 * Resend Password Reset OTP:
 * Enforces 60-second rate limiting cooldown
 */
exports.resendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await storage.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a verification code has been sent.'
      });
    }

    const existingReset = await storage.findEmailVerification(cleanEmail, 'password_reset');
    if (existingReset && existingReset.lastSentAt) {
      const elapsedMs = Date.now() - new Date(existingReset.lastSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} seconds before requesting a new code.`
        });
      }
    }

    const newOtp = generateSecureOtp();
    const newOtpHash = hashOtp(newOtp);
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const emailResult = await emailService.sendPasswordResetOtpEmail({
      to: cleanEmail,
      fullName: user.name,
      otp: newOtp,
      expiresMinutes: 10
    });

    if (!emailResult.success) {
      console.error('[Auth] Failed to resend password reset OTP to:', cleanEmail, {
        code: emailResult.code,
        error: emailResult.error
      });
      return res.status(500).json({
        success: false,
        message: "We couldn't deliver the verification code to your email. Please try again shortly."
      });
    }

    if (existingReset) {
      await storage.updateEmailVerificationOtp(cleanEmail, newOtpHash, newExpiresAt, 'password_reset');
    } else {
      await storage.saveEmailVerification({
        email: cleanEmail,
        name: user.name,
        otpHash: newOtpHash,
        expiresAt: newExpiresAt,
        purpose: 'password_reset'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'A new password reset code has been sent to your email.'
    });
  } catch (err) {
    console.error('Resend reset OTP error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend reset code. Please try again.'
    });
  }
};

/**
 * 5. Verify Password Reset OTP:
 * - Validates 6-digit OTP
 * - Checks max 5 attempts and 10-minute expiry
 * - Verifies SHA-256 hash
 * - Issues a single-use signed resetToken (valid 15 minutes)
 */
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit verification code.'
      });
    }

    const resetRecord = await storage.findEmailVerification(cleanEmail, 'password_reset');
    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'No pending password reset request found for this email. Please request a new code.'
      });
    }

    // Check max attempts
    if (resetRecord.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed verification attempts. Please request a new code.'
      });
    }

    // Check expiration
    if (new Date() > new Date(resetRecord.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'This verification code has expired. Please request a new code.'
      });
    }

    // Compare hash
    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== resetRecord.otpHash) {
      await storage.incrementVerificationAttempts(cleanEmail, 'password_reset');
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    // Generate single-use reset authorization token
    const nonce = crypto.randomBytes(16).toString('hex');
    const resetToken = jwt.sign(
      { email: cleanEmail, purpose: 'pwd_reset', nonce },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store resetTokenHash to ensure single-use
    await storage.setResetTokenHash(cleanEmail, resetTokenHash);

    return res.status(200).json({
      success: true,
      message: 'Verification code confirmed. You can now set a new password.',
      resetToken
    });
  } catch (err) {
    console.error('Verify reset OTP error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify reset code. Please try again.'
    });
  }
};

/**
 * 6. Reset Password:
 * - Validates single-use reset token and password policy
 * - Updates existing user's passwordHash using bcrypt
 * - Preserves existing user ID, role, and profile data
 * - Invalidates reset token and OTP immediately
 * - Never creates a second user
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, resetToken, newPassword } = req.body;
    const tokenToUse = resetToken || token;

    if (!tokenToUse || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset authorization token and new password are required.'
      });
    }

    // Validate new password with policy
    const pwdValidation = validatePassword(newPassword);
    if (!pwdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: pwdValidation.message
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(tokenToUse, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset authorization. Please request a new code.'
      });
    }

    const cleanEmail = (decoded.email || '').trim().toLowerCase();
    if (!cleanEmail && !decoded.id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset authorization token.'
      });
    }

    // Validate single-use token against record
    const resetRecord = cleanEmail ? await storage.findEmailVerification(cleanEmail, 'password_reset') : null;
    const incomingTokenHash = crypto.createHash('sha256').update(tokenToUse).digest('hex');

    if (!resetRecord || !resetRecord.resetTokenHash || resetRecord.resetTokenHash !== incomingTokenHash) {
      return res.status(400).json({
        success: false,
        message: 'This password reset authorization has already been used or has expired. Please request a new code.'
      });
    }

    // Find the existing user in database (preserve ID and role)
    const user = (cleanEmail ? await storage.findUserByEmail(cleanEmail) : null) || (decoded.id ? await storage.findUserById(decoded.id) : null);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // Hash new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update existing user without altering user ID or role
    await storage.updateUser(user._id || user.id, {
      passwordHash
    });

    // Invalidate reset record immediately
    if (cleanEmail) {
      await storage.deleteEmailVerification(cleanEmail, 'password_reset');
    }

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
};
