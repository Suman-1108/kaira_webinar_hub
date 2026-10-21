const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  lessonTitle: { type: String, default: '' },
  timestampSeconds: { type: Number, default: 0 },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  lastPositionSeconds: { type: Number, default: 0 },
  durationSeconds: { type: Number, default: 0 },
  lastWatchedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { _id: false });

const studentCourseProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  courseId: { type: String, required: true },
  completedLessonIds: [{ type: String }],
  lessonProgress: [lessonProgressSchema],
  completedLessonCount: { type: Number, default: 0 },
  totalTrackableLessonCount: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  lastAccessedLessonId: { type: String, default: '' },
  lastAccessedAt: { type: Date, default: Date.now },
  courseCompletedAt: { type: Date },
  isArchived: { type: Boolean, default: false },
  isInMyList: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewComment: { type: String, default: '' },
  notes: [noteSchema],
  learningReminder: {
    enabled: { type: Boolean, default: false },
    time: { type: String, default: '12:00 PM' },
    days: [{ type: String, default: 'Mo Tu We Th Fr' }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure a single progress record per user per course
studentCourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
studentCourseProgressSchema.index({ userEmail: 1, courseId: 1 });

studentCourseProgressSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.StudentCourseProgress || mongoose.model('StudentCourseProgress', studentCourseProgressSchema);
