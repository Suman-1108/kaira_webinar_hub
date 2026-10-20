const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationId: { type: String, required: true, unique: true },
  webinarId: { type: String, required: true },
  webinarTitle: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  countryCode: { type: String, default: '+91' },
  ticketType: { type: String, enum: ['Free Pass', 'VIP Masterclass Pass', 'Corporate Team Pass'], default: 'Free Pass' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, default: 'free' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  verifiedAt: { type: Date },
  whatsappOptIn: { type: Boolean, default: true },
  emailNotificationSent: { type: Boolean, default: false },
  whatsappNotificationSent: { type: Boolean, default: false },
  joiningLink: { type: String, default: 'https://meet.kairahub.live/w/' },
  invoiceNumber: { type: String },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
