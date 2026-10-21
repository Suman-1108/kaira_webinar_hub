const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  // Server-side only: never returned in student test payload
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
  order: { type: Number, default: 1 }
}, { _id: false });

const sectionQuizSchema = new mongoose.Schema({
  quizId: { type: String, required: true, unique: true },
  courseId: { type: String, required: true, index: true },
  sectionId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: 'Demonstrate comprehension to complete this section and unlock the next phase.' },
  passingScore: { type: Number, default: 80, min: 1, max: 100 },
  retryLimit: { type: Number, default: 10 },
  questions: [questionSchema],
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

sectionQuizSchema.index({ courseId: 1, sectionId: 1 }, { unique: true });

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  courseId: { type: String, required: true, index: true },
  sectionId: { type: String, required: true, index: true },
  quizId: { type: String, required: true },
  answers: [{
    questionId: { type: String, required: true },
    selectedOption: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  totalQuestions: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  passed: { type: Boolean, required: true },
  attemptNumber: { type: Number, default: 1 },
  submittedAt: { type: Date, default: Date.now }
});

quizAttemptSchema.index({ userId: 1, courseId: 1, sectionId: 1 });

const SectionQuiz = mongoose.models.SectionQuiz || mongoose.model('SectionQuiz', sectionQuizSchema);
const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = {
  SectionQuiz,
  QuizAttempt
};
