const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateNumber: { type: String, required: true, unique: true },
  verificationIdentifier: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  studentName: { type: String, required: true },
  courseId: { type: String, required: true, index: true },
  courseTitle: { type: String, required: true },
  instructorName: { type: String, default: 'Lead Specialist' },
  instructorRole: { type: String, default: 'Academic Director' },
  issueDate: { type: Date, default: Date.now },
  totalHours: { type: String, default: '3.5 Hours' },
  verificationUrl: { type: String, required: true },
  issuer: { type: String, default: 'Kaira Webinar Hub Certification Authority' },
  metadata: {
    totalLessons: { type: Number, default: 0 },
    totalSections: { type: Number, default: 0 },
    quizzesPassed: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
