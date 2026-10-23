const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  courseId: { type: String, required: true, index: true },
  courseTitle: { type: String, required: true },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  paymentStatus: { 
    type: String, 
    enum: ['completed', 'free', 'pending', 'refunded'], 
    default: 'completed' 
  },
  paymentMethod: { type: String, default: 'phonepe' },
  merchantOrderId: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  registrationId: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'completed'], 
    default: 'active' 
  },
  enrolledAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Enforce unique compound index: A user can only be enrolled in a specific course once
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userEmail: 1, courseId: 1 });

enrollmentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
