const storage = require('../services/storage');

exports.getDashboardStats = async (req, res) => {
  try {
    const [webinars, registrations] = await Promise.all([
      storage.getWebinars(),
      storage.getAllRegistrations()
    ]);

    const completedRegs = registrations.filter(r => r.paymentStatus === 'completed');
    const totalRevenue = completedRegs.reduce((sum, r) => sum + (r.amount || 0), 0);
    const freeAttendees = completedRegs.filter(r => r.amount === 0).length;
    const paidAttendees = completedRegs.filter(r => r.amount > 0).length;

    // Category distribution
    const categoryCounts = {};
    webinars.forEach(w => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });

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
        recentRegistrations: registrations.slice(0, 10)
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

exports.exportAttendeesCsv = async (req, res) => {
  try {
    const list = await storage.getAllRegistrations();
    
    // Build CSV
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
      'WhatsApp Opt-in',
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
      r.whatsappOptIn ? 'YES' : 'NO',
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

// Promotional video & template settings in memory
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
  },
  whatsappTemplate: {
    name: "kaira_webinar_reminder_v1",
    body: "🌟 *Kaira Webinar Hub* - Hi {{fullName}}! Your workshop *{{webinarTitle}}* starts soon. Tap here to join live: {{joiningLink}} | Pass: {{registrationId}}"
  }
};

exports.getSystemConfig = (req, res) => {
  res.json({ success: true, data: systemConfig });
};

exports.updateSystemConfig = (req, res) => {
  systemConfig = { ...systemConfig, ...req.body };
  res.json({ success: true, message: 'Settings saved', data: systemConfig });
};
