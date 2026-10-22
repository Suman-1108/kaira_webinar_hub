const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'password_reset'],
    default: 'registration',
    index: true
  },
  name: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    default: 'student'
  },
  passwordHash: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  otpHash: {
    type: String,
    required: true
  },
  resetTokenHash: {
    type: String,
    default: ''
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // MongoDB TTL index to auto-remove expired documents
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

emailVerificationSchema.index({ email: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.models.EmailVerification || mongoose.model('EmailVerification', emailVerificationSchema);
