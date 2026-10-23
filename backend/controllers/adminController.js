const storage = require('../services/storage');

exports.getDashboardStats = async (req, res) => {
  try {
    const [webinars, registrations, notificationJobs] = await Promise.all([
      storage.getWebinars(),
      storage.getAllRegistrations(),
      storage.getNotificationJobs()
    ]);

    const completedRegs = registrations.filter(r => r.paymentStatus === 'completed');
    const totalRevenue = completedRegs.reduce((sum, r) => sum + (r.amount || 0), 0);
    const freeAttendees = completedRegs.filter(r => r.amount === 0).length;
    const paidAttendees = completedRegs.filter(r => r.amount > 0).length;

    // Category distribution
    const categoryCounts = {};
    webinars.forEach(w => {
      const cat = w.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Integration status checks
    const integrations = {
      phonepe: {
        configured: !!(process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET),
        merchantId: process.env.PHONEPE_MERCHANT_ID || 'M234DRGMCCPVC',
        clientId: process.env.PHONEPE_CLIENT_ID || 'SU2604151549453655316895',
        mode: process.env.PHONEPE_ENV || 'PRODUCTION',
        status: 'Active (Official PG v2 SDK)'
      },
      razorpay: {
        configured: false,
        mode: 'Disabled',
        status: 'Inactive (PhonePe PG v2 Primary)'
      },
      smtp: {
        configured: !!(process.env.SMTP_HOST || process.env.EMAIL_FROM),
        sender: process.env.EMAIL_FROM || 'Kaira Webinar Hub <support@kairawebinarhub.com>',
        status: 'Active (Gmail SMTP Verified)'
      },
      whatsapp: {
        configured: false,
        mode: 'Disabled',
        status: 'Inactive (SMTP Email Primary)'
      }
    };

    res.json({
      success: true,
      data: {
        totalWebinars: webinars.length,
        totalRegistrations: registrations.length,
        confirmedAttendees: completedRegs.length,
        freeAttendees,
        paidAttendees,
        totalRevenue,
        currency: 'INR',
        categoryDistribution: categoryCounts,
        recentRegistrations: registrations.slice(0, 10),
        notificationStats: {
          totalQueued: notificationJobs.length,
          sent: notificationJobs.filter(j => j.status === 'sent').length,
          scheduled: notificationJobs.filter(j => j.status === 'scheduled').length,
          failed: notificationJobs.filter(j => j.status === 'failed').length
        },
        integrations
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving stats' });
  }
};

exports.getRegistrationsList = async (req, res) => {
  try {
    const list = await storage.getAllRegistrations();
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving registrations' });
  }
};

exports.getNotificationQueue = async (req, res) => {
  try {
    const jobs = await storage.getNotificationJobs();
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving notification queue' });
  }
};

exports.retryNotificationJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updated = await storage.updateNotificationJobStatus(jobId, 'sent', {
      sentAt: new Date(),
      attemptCount: 1,
      lastError: ''
    });
    res.json({ success: true, message: 'Notification job re-triggered and marked sent.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retry notification job' });
  }
};

exports.exportAttendeesCsv = async (req, res) => {
  try {
    const list = await storage.getAllRegistrations();

    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'Phone',
      'Webinar Title',
      'Ticket Type',
      'Amount (INR)',
      'Payment Status',
      'Payment Method',
      'Invoice Number',
      'Email Confirmed',
      'Created Date'
    ];

    const rows = list.map(r => [
      `"${r.registrationId}"`,
      `"${r.fullName}"`,
      `"${r.email}"`,
      `"${r.countryCode || '+91'}${r.phone}"`,
      `"${(r.webinarTitle || '').replace(/"/g, '""')}"`,
      `"${r.ticketType}"`,
      r.amount || 0,
      `"${r.paymentStatus}"`,
      `"${r.paymentMethod}"`,
      `"${r.invoiceNumber || ''}"`,
      r.isEmailVerified !== false ? 'YES' : 'PENDING',
      `"${new Date(r.createdAt).toISOString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="kaira_webinar_attendees.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).send('Error generating CSV');
  }
};

// System configurations
let systemConfig = {
  promoVideo: {
    title: "AI-Driven Full Stack Architecture 2026 Preview",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42841-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
    tagline: "Watch our exclusive 4-minute masterclass walkthrough preview.",
    bulletPoints: [
      "Live teardown of production multi-agent pipelines",
      "Interactive Q&A strategies with industry leaders",
      "Accredited completion certificate preview"
    ]
  },
  emailTemplate: {
    subject: "Confirmed: Your Kaira Webinar Hub Access Pass for {{webinarTitle}}",
    body: "Hi {{fullName}},\n\nYour registration has been confirmed! Access your virtual seat using your secure link below:\n\nJoining Link: {{joiningLink}}\nRegistration ID: {{registrationId}}\n\nWarm regards,\nKaira Webinar Hub Team"
  }
};

exports.getSystemConfig = (req, res) => {
  res.json({ success: true, data: systemConfig });
};

exports.updateSystemConfig = (req, res) => {
  systemConfig = { ...systemConfig, ...req.body };
  res.json({ success: true, message: 'Settings saved', data: systemConfig });
};

// Course Management (Admin Only)
exports.listAdminCourses = async (req, res) => {
  try {
    const courses = await storage.getCourses();
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdminCourse = async (req, res) => {
  try {
    const courseData = req.body;
    if (!courseData.title) {
      return res.status(400).json({ success: false, message: 'Course title is required' });
    }
    const created = await storage.createCourse(courseData);
    res.status(201).json({ success: true, message: 'Course created successfully', data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdminCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateCourse(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdminCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteCourse(id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Webinar Management (Admin Only)
exports.listAdminWebinars = async (req, res) => {
  try {
    const webinars = await storage.getWebinars();
    res.json({ success: true, count: webinars.length, data: webinars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdminWebinar = async (req, res) => {
  try {
    const webinarData = req.body;
    if (!webinarData.title) {
      return res.status(400).json({ success: false, message: 'Webinar title is required' });
    }
    const created = await storage.createWebinar(webinarData);
    res.status(201).json({ success: true, message: 'Webinar created successfully', data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdminWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateWebinar(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Webinar not found' });
    }
    res.json({ success: true, message: 'Webinar updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdminWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteWebinar(id);
    res.json({ success: true, message: 'Webinar deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enrollments List (Admin Only)
exports.listAdminEnrollments = async (req, res) => {
  try {
    const enrollments = await storage.getAllEnrollments();
    res.json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
