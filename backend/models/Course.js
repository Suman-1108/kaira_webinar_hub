const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: String, default: '15 mins' },
  durationSeconds: { type: Number, default: 900 },
  videoUrl: { type: String, default: '' },
  order: { type: Number, default: 1 },
  resources: [{
    title: { type: String },
    url: { type: String },
    type: { type: String, default: 'file' }
  }]
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  sectionId: { type: String, required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 1 },
  duration: { type: String, default: '' },
  lessons: [lessonSchema]
}, { _id: false });

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  categoryId: { type: String, default: '' },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  posterImage: { type: String, default: '' },
  instructor: {
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    bio: { type: String, required: true },
    avatar: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 420 },
    studentCount: { type: Number, default: 3500 }
  },
  duration: { type: String, required: true },
  level: { type: String, default: 'All Levels' },
  language: { type: String, default: 'English' },
  price: { type: Number, default: 499 },
  originalPrice: { type: Number, default: 1999 },
  currency: { type: String, default: 'INR' },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 215 },
  learnersCount: { type: Number, default: 1840 },
  outcomes: [{ type: String }],
  prerequisites: [{ type: String }],
  curriculum: [sectionSchema],
  status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published' },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.id || this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);
