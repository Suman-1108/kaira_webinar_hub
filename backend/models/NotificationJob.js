const mongoose = require('mongoose');

const notificationJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  registrationId: { type: String, required: true },
  webinarId: { type: String, required: true },
  recipientEmail: { type: String },
  recipientPhone: { type: String },
  recipientName: { type: String },
  channel: { type: String, enum: ['email', 'whatsapp'], required: true },
  templateId: { type: String, required: true }, // e.g. 'registration_confirmation', 'reminder_24h', 'reminder_1h'
  scheduledAt: { type: Date, required: true },
  sentAt: { type: Date },
  status: { type: String, enum: ['scheduled', 'processing', 'sent', 'failed', 'cancelled'], default: 'scheduled' },
  attemptCount: { type: Number, default: 0 },
  providerMessageId: { type: String, default: '' },
  lastError: { type: String, default: '' },
  idempotencyKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.NotificationJob || mongoose.model('NotificationJob', notificationJobSchema);
