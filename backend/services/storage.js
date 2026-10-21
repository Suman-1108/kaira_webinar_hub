const Webinar = require('../models/Webinar');
const Registration = require('../models/Registration');
const User = require('../models/User');
const NotificationJob = require('../models/NotificationJob');
const EmailVerification = require('../models/EmailVerification');
const seedWebinars = require('../data/seedWebinars');
const mongoose = require('mongoose');

let memEmailVerifications = [];

// In-memory resilient cache with seed data
let memWebinars = [...seedWebinars];
let memUsers = [
  {
    _id: "usr_admin_001",
    id: "usr_admin_001",
    name: "Admin User",
    email: "admin@kairawebinarhub.com",
    // bcrypt hash of 'admin123'
    passwordHash: "$2b$10$wT7ssLf3HHgR6yxDzS9TM.XYP2lzydZLm.GChhcegeHBf7vCUAZtS",
    role: "admin",
    headline: "Chief Academic Officer & Platform Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    emailVerified: true,
    notificationPreferences: { email: true, whatsapp: true },
    createdAt: new Date()
  },
  {
    _id: "usr_demo_002",
    id: "usr_demo_002",
    name: "Pooja Sundaram",
    email: "pooja.sundaram@techvision.io",
    // bcrypt hash of 'student123'
    passwordHash: "$2b$10$1jmzQE/vr.nGGoZ3DqauuurriDhPN0VJ4kWWI7YmE7C1c94vaw2WG",
    role: "user",
    headline: "Senior Software Engineer @ TechVision",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    phone: "9876543210",
    emailVerified: true,
    notificationPreferences: { email: true, whatsapp: true },
    createdAt: new Date()
  }
];

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

let memNotificationJobs = [
  {
    jobId: "job-rem-001",
    registrationId: "KWH-2026-8941",
    webinarId: "webinar-ai-agents",
    recipientEmail: "pooja.sundaram@techvision.io",
    recipientPhone: "9876543210",
    recipientName: "Pooja Sundaram",
    channel: "whatsapp",
    templateId: "reminder_24h",
    scheduledAt: new Date(Date.now() + 3600000 * 24),
    status: "scheduled",
    attemptCount: 0,
    idempotencyKey: "job_KWH-2026-8941_whatsapp_24h",
    createdAt: new Date()
  },
  {
    jobId: "job-rem-002",
    registrationId: "KWH-2026-8941",
    webinarId: "webinar-ai-agents",
    recipientEmail: "pooja.sundaram@techvision.io",
    recipientPhone: "9876543210",
    recipientName: "Pooja Sundaram",
    channel: "email",
    templateId: "registration_confirmation",
    scheduledAt: new Date(Date.now() - 3600000 * 24),
    sentAt: new Date(Date.now() - 3600000 * 24),
    status: "sent",
    attemptCount: 1,
    idempotencyKey: "job_KWH-2026-8941_email_confirm",
    createdAt: new Date(Date.now() - 3600000 * 24)
  }
];

const isDbActive = () => mongoose.connection.readyState === 1;

const storage = {
  // Webinars
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

  async getWebinarById(identifier) {
    if (isDbActive()) {
      try {
        const found = await Webinar.findOne({
          $or: [{ id: identifier }, { slug: identifier }]
        }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memWebinars.find(w => w.id === identifier || w.slug === identifier) || null;
  },

  async createWebinar(data) {
    const id = data.id || `webinar-${Date.now()}`;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newWebinar = { ...data, id, slug, createdAt: new Date() };
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
        const updated = await Webinar.findOneAndUpdate(
          { $or: [{ id }, { slug: id }] },
          updateData,
          { new: true }
        );
        if (updated) return updated;
      } catch (e) {}
    }
    const idx = memWebinars.findIndex(w => w.id === id || w.slug === id);
    if (idx !== -1) {
      memWebinars[idx] = { ...memWebinars[idx], ...updateData };
      return memWebinars[idx];
    }
    return null;
  },

  async deleteWebinar(id) {
    if (isDbActive()) {
      try {
        await Webinar.deleteOne({ $or: [{ id }, { slug: id }] });
      } catch (e) {}
    }
    memWebinars = memWebinars.filter(w => w.id !== id && w.slug !== id);
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

  async getRegistrationsByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        return await Registration.find({ email: cleanEmail }).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }
    return memRegistrations.filter(r => (r.email || '').toLowerCase() === cleanEmail);
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
        const count = await Registration.countDocuments();
        if (count === 0) {
          await Registration.insertMany(memRegistrations);
        }
        return await Registration.find({}).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }
    return memRegistrations;
  },

  // Users
  async findUserByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        const found = await User.findOne({ email: cleanEmail }).lean();
        if (found) return found;

        // Auto-seed standard accounts if queried and not yet in database
        const seedUser = memUsers.find(u => u.email.toLowerCase() === cleanEmail);
        if (seedUser) {
          try {
            const created = await User.create(seedUser);
            return created.toObject ? created.toObject() : created;
          } catch (createErr) {
            return seedUser;
          }
        }
      } catch (e) {}
    }
    return memUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id) {
    if (isDbActive()) {
      try {
        const found = await User.findById(id).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memUsers.find(u => u._id === id || u.id === id) || null;
  },

  async createUser(userData) {
    const cleanEmail = userData.email.trim().toLowerCase();
    const newUser = {
      _id: `usr_${Date.now()}`,
      id: `usr_${Date.now()}`,
      ...userData,
      email: cleanEmail,
      createdAt: new Date()
    };
    if (isDbActive()) {
      try {
        const doc = await User.create(newUser);
        return doc;
      } catch (e) {}
    }
    memUsers.unshift(newUser);
    return newUser;
  },

  async updateUser(id, updateData) {
    if (isDbActive()) {
      try {
        const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if (updated) return updated;
      } catch (e) {}
    }
    const idx = memUsers.findIndex(u => u._id === id || u.id === id);
    if (idx !== -1) {
      memUsers[idx] = { ...memUsers[idx], ...updateData };
      return memUsers[idx];
    }
    return null;
  },

  // Notification Jobs
  async createNotificationJob(jobData) {
    if (isDbActive()) {
      try {
        return await NotificationJob.create(jobData);
      } catch (e) {}
    }
    memNotificationJobs.unshift(jobData);
    return jobData;
  },

  async getNotificationJobs() {
    if (isDbActive()) {
      try {
        return await NotificationJob.find({}).sort({ scheduledAt: -1 }).lean();
      } catch (e) {}
    }
    return memNotificationJobs;
  },

  async updateNotificationJobStatus(jobId, status, extra = {}) {
    if (isDbActive()) {
      try {
        return await NotificationJob.findOneAndUpdate(
          { jobId },
          { status, ...extra },
          { new: true }
        );
      } catch (e) {}
    }
    const idx = memNotificationJobs.findIndex(j => j.jobId === jobId);
    if (idx !== -1) {
      memNotificationJobs[idx] = { ...memNotificationJobs[idx], status, ...extra };
      return memNotificationJobs[idx];
    }
    return null;
  },

  // Email Verification (Pending Registrations & OTPs)
  async saveEmailVerification(data) {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const payload = {
      ...data,
      email: cleanEmail,
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: data.expiresAt || new Date(Date.now() + 10 * 60 * 1000)
    };

    if (isDbActive()) {
      try {
        return await EmailVerification.findOneAndUpdate(
          { email: cleanEmail },
          payload,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        console.warn('DB saveEmailVerification error, fallback to memory:', e.message);
      }
    }

    const idx = memEmailVerifications.findIndex(v => v.email === cleanEmail);
    if (idx !== -1) {
      memEmailVerifications[idx] = { ...memEmailVerifications[idx], ...payload };
      return memEmailVerifications[idx];
    }
    memEmailVerifications.push(payload);
    return payload;
  },

  async findEmailVerification(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        const found = await EmailVerification.findOne({ email: cleanEmail }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memEmailVerifications.find(v => v.email === cleanEmail) || null;
  },

  async incrementVerificationAttempts(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        return await EmailVerification.findOneAndUpdate(
          { email: cleanEmail },
          { $inc: { attempts: 1 } },
          { new: true }
        );
      } catch (e) {}
    }
    const record = memEmailVerifications.find(v => v.email === cleanEmail);
    if (record) {
      record.attempts = (record.attempts || 0) + 1;
      return record;
    }
    return null;
  },

  async updateEmailVerificationOtp(email, otpHash, expiresAt) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const update = {
      otpHash,
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt
    };
    if (isDbActive()) {
      try {
        return await EmailVerification.findOneAndUpdate(
          { email: cleanEmail },
          { $set: update },
          { new: true }
        );
      } catch (e) {}
    }
    const record = memEmailVerifications.find(v => v.email === cleanEmail);
    if (record) {
      Object.assign(record, update);
      return record;
    }
    return null;
  },

  async deleteEmailVerification(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        await EmailVerification.deleteOne({ email: cleanEmail });
      } catch (e) {}
    }
    memEmailVerifications = memEmailVerifications.filter(v => v.email !== cleanEmail);
    return true;
  }
};

module.exports = storage;
