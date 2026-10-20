const mongoose = require('mongoose');

const webinarSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  tagline: { type: String, required: true },
  speaker: {
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    bio: { type: String, required: true },
    avatar: { type: String, required: true }
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, default: 0 },
  originalPrice: { type: Number, default: 999 },
  seatsAvailable: { type: Number, default: 100 },
  maxSeats: { type: Number, default: 200 },
  isFeatured: { type: Boolean, default: false },
  promoVideoUrl: { type: String, default: '' },
  posterImage: { type: String, default: '' },
  outcomes: [{ type: String }],
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Webinar || mongoose.model('Webinar', webinarSchema);
