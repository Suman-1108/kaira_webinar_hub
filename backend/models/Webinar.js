const mongoose = require('mongoose');

const agendaItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String, default: '20 mins' },
  description: { type: String, default: '' },
  points: [{ type: String }]
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: String, default: 'Recently' },
  comment: { type: String, required: true },
  avatar: { type: String, default: '' }
}, { _id: false });

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

const announcementSchema = new mongoose.Schema({
  author: { type: String, default: 'Instructor' },
  avatar: { type: String, default: '' },
  date: { type: String, default: 'Recently' },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const webinarSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  categoryId: { type: String, default: '' },
  tagline: { type: String, required: true },
  summary: { type: String, default: '' },
  description: { type: String, required: true },
  speaker: {
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    bio: { type: String, required: true },
    avatar: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 1250 },
    studentCount: { type: Number, default: 24500 }
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  timeZone: { type: String, default: 'IST (UTC+05:30)' },
  duration: { type: String, required: true },
  startAt: { type: Date },
  endAt: { type: Date },
  price: { type: Number, default: 0 },
  originalPrice: { type: Number, default: 999 },
  currency: { type: String, default: 'INR' },
  seatsAvailable: { type: Number, default: 100 },
  maxSeats: { type: Number, default: 200 },
  isFeatured: { type: Boolean, default: false },
  promoVideoUrl: { type: String, default: '' },
  posterImage: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  outcomes: [{ type: String }],
  agenda: [agendaItemSchema],
  prerequisites: [{ type: String }],
  level: { type: String, default: 'All Levels' },
  language: { type: String, default: 'English' },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 184 },
  learnersCount: { type: Number, default: 3420 },
  reviews: [reviewSchema],
  curriculum: [sectionSchema],
  announcements: [announcementSchema],
  status: { type: String, enum: ['published', 'draft', 'cancelled', 'completed'], default: 'published' },
  createdAt: { type: Date, default: Date.now }
});

// Auto-populate slug if missing
webinarSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.id || this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.models.Webinar || mongoose.model('Webinar', webinarSchema);
