const Webinar = require('../models/Webinar');
const Registration = require('../models/Registration');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const NotificationJob = require('../models/NotificationJob');
const EmailVerification = require('../models/EmailVerification');
const seedWebinars = require('../data/seedWebinars');
const seedCourses = require('../data/seedCourses');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let memEmailVerifications = [];
let memCourses = [...seedCourses];
let memEnrollments = [];

const DEFAULT_ADMIN_HASH = bcrypt.hashSync('admin123', 10);
const DEFAULT_STUDENT_HASH = bcrypt.hashSync('student123', 10);

// In-memory resilient cache with seed data
let memWebinars = [...seedWebinars];
let memUsers = [
  {
    _id: "usr_admin_001",
    id: "usr_admin_001",
    name: "Admin User",
    email: "admin@kairawebinarhub.com",
    passwordHash: DEFAULT_ADMIN_HASH,
    role: "admin",
    headline: "Chief Academic Officer & Platform Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    emailVerified: true,
    accountStatus: "active",
    notificationPreferences: { email: true },
    createdAt: new Date()
  },
  {
    _id: "usr_admin_002",
    id: "usr_admin_002",
    name: "Suman",
    email: "hellosuman29@gmail.com",
    passwordHash: DEFAULT_ADMIN_HASH,
    role: "admin",
    headline: "Platform Administrator & Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    phone: "9876543210",
    emailVerified: true,
    accountStatus: "active",
    notificationPreferences: { email: true },
    createdAt: new Date()
  },
  {
    _id: "usr_demo_002",
    id: "usr_demo_002",
    name: "Pooja Sundaram",
    email: "pooja.sundaram@techvision.io",
    passwordHash: DEFAULT_STUDENT_HASH,
    role: "student",
    headline: "Senior Software Engineer @ TechVision",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    phone: "9876543210",
    emailVerified: true,
    accountStatus: "active",
    notificationPreferences: { email: true },
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
    paymentMethod: "phonepe",
    phonepeMerchantTransactionId: "ORD_KWH_seed_01",
    phonepeTransactionId: "TXN_KWH_seed_01",
    verifiedAt: new Date(Date.now() - 3600000 * 24),
    whatsappOptIn: false,
    emailNotificationSent: true,
    whatsappNotificationSent: false,
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
    whatsappOptIn: false,
    emailNotificationSent: true,
    whatsappNotificationSent: false,
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
    channel: "email",
    templateId: "reminder_24h",
    scheduledAt: new Date(Date.now() + 3600000 * 24),
    status: "scheduled",
    attemptCount: 0,
    idempotencyKey: "job_KWH-2026-8941_email_24h",
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
        if (count < seedWebinars.length) {
          for (const sw of seedWebinars) {
            await Webinar.findOneAndUpdate(
              { id: sw.id },
              { $setOnInsert: sw },
              { upsert: true }
            );
          }
        }
        return await Webinar.find({}).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn('DB read error, using memory fallback:', e.message);
      }
    }
    return memWebinars;
  },

  async getWebinarById(identifier) {
    if (!identifier) return null;
    if (isDbActive()) {
      try {
        const found = await Webinar.findOne({
          $or: [{ id: identifier }, { slug: identifier }]
        }).lean();
        if (found) return found;

        const foundCourse = await Course.findOne({
          $or: [{ id: identifier }, { slug: identifier }]
        }).lean();
        if (foundCourse) return foundCourse;
      } catch (e) {}
    }
    const foundMem = memWebinars.find(w => w.id === identifier || w.slug === identifier);
    if (foundMem) return foundMem;

    // Graceful fallback to course catalog if called with a course identifier
    return this.getCourseById ? await this.getCourseById(identifier) : null;
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

  // Courses
  async getCourses() {
    if (isDbActive()) {
      try {
        const count = await Course.countDocuments();
        if (count < seedCourses.length) {
          for (const sc of seedCourses) {
            await Course.findOneAndUpdate(
              { id: sc.id },
              { $setOnInsert: sc },
              { upsert: true }
            );
          }
        }
        return await Course.find({}).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn('DB read courses error, using memory fallback:', e.message);
      }
    }
    return memCourses;
  },

  async getCourseById(identifier) {
    if (!identifier) return null;
    if (isDbActive()) {
      try {
        const found = await Course.findOne({
          $or: [{ id: identifier }, { slug: identifier }]
        }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memCourses.find(c => c.id === identifier || c.slug === identifier) || null;
  },

  async createCourse(data) {
    const id = data.id || `course-${Date.now()}`;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCourse = { ...data, id, slug, createdAt: new Date() };
    if (isDbActive()) {
      try {
        const doc = await Course.create(newCourse);
        return doc.toObject ? doc.toObject() : doc;
      } catch (e) {}
    }
    memCourses.unshift(newCourse);
    return newCourse;
  },

  async updateCourse(id, updateData) {
    if (isDbActive()) {
      try {
        const updated = await Course.findOneAndUpdate(
          { $or: [{ id }, { slug: id }] },
          updateData,
          { new: true }
        ).lean();
        if (updated) return updated;
      } catch (e) {}
    }
    const idx = memCourses.findIndex(c => c.id === id || c.slug === id);
    if (idx !== -1) {
      memCourses[idx] = { ...memCourses[idx], ...updateData };
      return memCourses[idx];
    }
    return null;
  },

  async deleteCourse(id) {
    if (isDbActive()) {
      try {
        await Course.deleteOne({ $or: [{ id }, { slug: id }] });
      } catch (e) {}
    }
    memCourses = memCourses.filter(c => c.id !== id && c.slug !== id);
    return true;
  },

  // Enrollments
  async createEnrollment(data) {
    const enrollmentPayload = {
      ...data,
      userId: String(data.userId),
      userEmail: (data.userEmail || '').toLowerCase().trim(),
      courseId: String(data.courseId),
      enrolledAt: data.enrolledAt || new Date(),
      status: data.status || 'active'
    };

    if (isDbActive()) {
      try {
        const doc = await Enrollment.findOneAndUpdate(
          { userId: enrollmentPayload.userId, courseId: enrollmentPayload.courseId },
          { $setOnInsert: enrollmentPayload },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return doc.toObject ? doc.toObject() : doc;
      } catch (e) {
        if (e.code === 11000) {
          return await Enrollment.findOne({ userId: enrollmentPayload.userId, courseId: enrollmentPayload.courseId }).lean();
        }
        console.warn('DB create enrollment error, fallback to memory:', e.message);
      }
    }

    const existing = memEnrollments.find(e => 
      (e.userId === enrollmentPayload.userId || e.userEmail === enrollmentPayload.userEmail) && 
      e.courseId === enrollmentPayload.courseId
    );
    if (existing) return existing;

    memEnrollments.unshift(enrollmentPayload);
    return enrollmentPayload;
  },

  async getEnrollment(userId, courseId) {
    const uid = String(userId || '');
    const cid = String(courseId || '');
    if (isDbActive()) {
      try {
        const found = await Enrollment.findOne({
          $or: [
            { userId: uid, courseId: cid },
            { userEmail: uid.toLowerCase(), courseId: cid }
          ],
          status: 'active'
        }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memEnrollments.find(e => 
      (e.userId === uid || e.userEmail === uid.toLowerCase()) && 
      e.courseId === cid && 
      e.status === 'active'
    ) || null;
  },

  async getEnrollmentsByUser(userId, email) {
    const uid = userId ? String(userId) : null;
    const cleanEmail = email ? email.toLowerCase().trim() : null;

    if (isDbActive()) {
      try {
        const query = [];
        if (uid) query.push({ userId: uid });
        if (cleanEmail) query.push({ userEmail: cleanEmail });
        if (query.length > 0) {
          return await Enrollment.find({ $or: query, status: 'active' }).sort({ enrolledAt: -1 }).lean();
        }
      } catch (e) {}
    }

    return memEnrollments.filter(e => 
      ((uid && e.userId === uid) || (cleanEmail && e.userEmail === cleanEmail)) && 
      e.status === 'active'
    );
  },

  async getAllEnrollments() {
    if (isDbActive()) {
      try {
        return await Enrollment.find({}).sort({ enrolledAt: -1 }).lean();
      } catch (e) {}
    }
    return memEnrollments;
  },

  async getItemById(identifier) {
    if (!identifier) return null;
    const course = await this.getCourseById(identifier);
    if (course) return { ...course, itemType: 'course' };
    const webinar = await this.getWebinarById(identifier);
    if (webinar) return { ...webinar, itemType: 'webinar' };
    return null;
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

  async getRegistrationByMerchantOrderId(merchantOrderId) {
    if (!merchantOrderId) return null;
    if (isDbActive()) {
      try {
        const found = await Registration.findOne({ phonepeMerchantTransactionId: merchantOrderId }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memRegistrations.find(r => r.phonepeMerchantTransactionId === merchantOrderId) || null;
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
            const { _id, id, ...cleanSeed } = seedUser;
            const created = await User.create(cleanSeed);
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
    if (!id) return null;
    if (isDbActive()) {
      try {
        if (mongoose.Types.ObjectId.isValid(String(id))) {
          const found = await User.findById(id).lean();
          if (found) return found;
        }
      } catch (e) {}
    }
    return memUsers.find(u => String(u._id) === String(id) || String(u.id) === String(id)) || null;
  },

  async createUser(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const newUser = {
      ...userData,
      email: cleanEmail,
      createdAt: new Date()
    };
    if (isDbActive()) {
      try {
        // Strip custom string _id if present so Mongoose generates a valid ObjectId
        const { _id, id, ...cleanData } = newUser;
        const doc = await User.create(cleanData);
        return doc.toObject ? doc.toObject() : doc;
      } catch (e) {
        console.error('[storage.createUser DB Error]:', e.message);
      }
    }
    const memUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      id: new mongoose.Types.ObjectId().toString(),
      ...newUser
    };
    memUsers.unshift(memUser);
    return memUser;
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

  // Email Verification (Pending Registrations & Password Reset OTPs)
  async saveEmailVerification(data) {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const purpose = data.purpose || 'registration';
    const payload = {
      ...data,
      email: cleanEmail,
      purpose,
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: data.expiresAt || new Date(Date.now() + 10 * 60 * 1000)
    };

    if (isDbActive()) {
      try {
        return await EmailVerification.findOneAndUpdate(
          { email: cleanEmail, purpose },
          payload,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        console.warn('DB saveEmailVerification error, fallback to memory:', e.message);
      }
    }

    const idx = memEmailVerifications.findIndex(v => v.email === cleanEmail && (v.purpose || 'registration') === purpose);
    if (idx !== -1) {
      memEmailVerifications[idx] = { ...memEmailVerifications[idx], ...payload };
      return memEmailVerifications[idx];
    }
    memEmailVerifications.push(payload);
    return payload;
  },

  async findEmailVerification(email, purpose = 'registration') {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        const found = await EmailVerification.findOne({ email: cleanEmail, purpose }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return memEmailVerifications.find(v => v.email === cleanEmail && (v.purpose || 'registration') === purpose) || null;
  },

  async incrementVerificationAttempts(email, purpose = 'registration') {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        return await EmailVerification.findOneAndUpdate(
          { email: cleanEmail, purpose },
          { $inc: { attempts: 1 } },
          { new: true }
        );
      } catch (e) {}
    }
    const record = memEmailVerifications.find(v => v.email === cleanEmail && (v.purpose || 'registration') === purpose);
    if (record) {
      record.attempts = (record.attempts || 0) + 1;
      return record;
    }
    return null;
  },

  async updateEmailVerificationOtp(email, otpHash, expiresAt, purpose = 'registration') {
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
          { email: cleanEmail, purpose },
          { $set: update },
          { new: true }
        );
      } catch (e) {}
    }
    const record = memEmailVerifications.find(v => v.email === cleanEmail && (v.purpose || 'registration') === purpose);
    if (record) {
      Object.assign(record, update);
      return record;
    }
    return null;
  },

  async setResetTokenHash(email, resetTokenHash) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        return await EmailVerification.findOneAndUpdate(
          { email: cleanEmail, purpose: 'password_reset' },
          { $set: { resetTokenHash } },
          { new: true }
        );
      } catch (e) {}
    }
    const record = memEmailVerifications.find(v => v.email === cleanEmail && v.purpose === 'password_reset');
    if (record) {
      record.resetTokenHash = resetTokenHash;
      return record;
    }
    return null;
  },

  async deleteEmailVerification(email, purpose = 'registration') {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbActive()) {
      try {
        await EmailVerification.deleteOne({ email: cleanEmail, purpose });
      } catch (e) {}
    }
    memEmailVerifications = memEmailVerifications.filter(v => !(v.email === cleanEmail && (v.purpose || 'registration') === purpose));
    return true;
  }
};

module.exports = storage;
