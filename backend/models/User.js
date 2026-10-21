const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'instructor'], default: 'user' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' },
  timeZone: { type: String, default: 'Asia/Kolkata' },
  emailVerified: { type: Boolean, default: true },
  emailVerifiedAt: { type: Date, default: Date.now },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true }
  },
  consentRecords: [{
    channel: { type: String },
    grantedAt: { type: Date, default: Date.now },
    purpose: { type: String, default: 'webinar_reminders' }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
