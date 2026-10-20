const Webinar = require('../models/Webinar');
const Registration = require('../models/Registration');
const seedWebinars = require('../data/seedWebinars');
const mongoose = require('mongoose');

// In-memory resilient cache
let memWebinars = [...seedWebinars];
let memRegistrations = [
  {
    registrationId: "KWH-2026-8941",
    webinarId: "webinar-ai-agents",
    webinarTitle: "Mastering Agentic AI & Autonomous LLM Systems",
    fullName: "Pooja Sundaram",
    email: "pooja.sundaram@techvision.io",
    phone: "9876543210",
    countryCode: "+91",
    ticketType: "VIP Masterclass Pass",
    amount: 499,
    currency: "INR",
    paymentStatus: "completed",
    paymentMethod: "razorpay",
    razorpayOrderId: "order_KWH_seed_01",
    razorpayPaymentId: "pay_KWH_seed_01",
    verifiedAt: new Date(Date.now() - 3600000 * 24),
    whatsappOptIn: true,
    emailNotificationSent: true,
    whatsappNotificationSent: true,
    joiningLink: "https://meet.kairahub.live/w/ai-agents?pass=KWH-2026-8941",
    invoiceNumber: "INV-2026-008941",
    createdAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    registrationId: "KWH-2026-8942",
    webinarId: "webinar-react-19",
    webinarTitle: "Modern React 19, Server Components & Micro-Frontends",
    fullName: "Karthik Raja",
    email: "karthik.raja@codecraft.org",
    phone: "9841234567",
    countryCode: "+91",
    ticketType: "Free Pass",
    amount: 0,
    currency: "INR",
    paymentStatus: "completed",
    paymentMethod: "free",
    verifiedAt: new Date(Date.now() - 3600000 * 12),
    whatsappOptIn: true,
    emailNotificationSent: true,
    whatsappNotificationSent: true,
    joiningLink: "https://meet.kairahub.live/w/react-19?pass=KWH-2026-8942",
    invoiceNumber: "INV-2026-008942",
    createdAt: new Date(Date.now() - 3600000 * 12)
  }
];

const isDbActive = () => mongoose.connection.readyState === 1;

const storage = {
  async getWebinars() {
    if (isDbActive()) {
      try {
        const count = await Webinar.countDocuments();
        if (count === 0) {
          await Webinar.insertMany(seedWebinars);
        }
        return await Webinar.find({}).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn('DB read error, using memory fallback:', e.message);
      }
    }
    return memWebinars;
  },

  async getWebinarById(id) {
    if (isDbActive()) {
      try {
        const found = await Webinar.findOne({ id }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memWebinars.find(w => w.id === id) || null;
  },

  async createWebinar(data) {
    const id = data.id || `webinar-${Date.now()}`;
    const newWebinar = { ...data, id, createdAt: new Date() };
    if (isDbActive()) {
      try {
        const doc = await Webinar.create(newWebinar);
        return doc;
      } catch (e) {}
    }
    memWebinars.unshift(newWebinar);
    return newWebinar;
  },

  async updateWebinar(id, updateData) {
    if (isDbActive()) {
      try {
        const updated = await Webinar.findOneAndUpdate({ id }, updateData, { new: true });
        if (updated) return updated;
      } catch (e) {}
    }
    const idx = memWebinars.findIndex(w => w.id === id);
    if (idx !== -1) {
      memWebinars[idx] = { ...memWebinars[idx], ...updateData };
      return memWebinars[idx];
    }
    return null;
  },

  async deleteWebinar(id) {
    if (isDbActive()) {
      try {
        await Webinar.deleteOne({ id });
      } catch (e) {}
    }
    memWebinars = memWebinars.filter(w => w.id !== id);
    return true;
  },

  // Registrations
  async createRegistration(regData) {
    if (isDbActive()) {
      try {
        const doc = await Registration.create(regData);
        return doc;
      } catch (e) {
        console.warn('DB create reg error, fallback to memory:', e.message);
      }
    }
    memRegistrations.unshift(regData);
    return regData;
  },

  async getRegistrationById(registrationId) {
    if (isDbActive()) {
      try {
        const found = await Registration.findOne({ registrationId }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memRegistrations.find(r => r.registrationId === registrationId) || null;
  },

  async updateRegistrationStatus(registrationId, updateFields) {
    if (isDbActive()) {
      try {
        const updated = await Registration.findOneAndUpdate({ registrationId }, updateFields, { new: true });
        if (updated) return updated;
      } catch (e) {}
    }
    const idx = memRegistrations.findIndex(r => r.registrationId === registrationId);
    if (idx !== -1) {
      memRegistrations[idx] = { ...memRegistrations[idx], ...updateFields };
      return memRegistrations[idx];
    }
    return null;
  },

  async getAllRegistrations() {
    if (isDbActive()) {
      try {
        return await Registration.find({}).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }
    return memRegistrations;
  }
};

module.exports = storage;
