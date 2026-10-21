const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  registrationId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  studentName: { type: String, required: true },
  studentPhone: { type: String, default: '' },
  courseId: { type: String, required: true, index: true },
  courseTitle: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentProvider: { type: String, default: 'phonepe' },
  merchantOrderId: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'completed' },
  paidAt: { type: Date, default: Date.now },
  emailDelivered: { type: Boolean, default: false },
  emailDeliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
