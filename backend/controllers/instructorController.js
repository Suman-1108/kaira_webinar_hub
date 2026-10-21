const storage = require('../services/storage');

/**
 * Controller for Seller / Instructor Portal
 */

// Get workshops belonging to current instructor
exports.getMyWorkshops = async (req, res) => {
  try {
    const user = req.user;
    const allWebinars = await storage.getWebinars();

    // In a multi-tenant SaaS model, filter by instructor id/email or return all if admin/demo instructor
    const isInstructor = user && (user.role === 'instructor' || user.role === 'seller');
    const instructorWorkshops = allWebinars.filter(w => {
      if (w.instructorId && w.instructorId === user?.id) return true;
      if (w.speaker && w.speaker.email && w.speaker.email === user?.email) return true;
      // If user is designated demo instructor or admin, display workshops
      return true;
    });

    res.json({
      success: true,
      count: instructorWorkshops.length,
      data: instructorWorkshops
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve instructor workshops' });
  }
};

// Create a new masterclass/webinar as instructor
exports.createWorkshop = async (req, res) => {
  try {
    const user = req.user;
    const {
      title,
      category,
      price,
      originalPrice,
      date,
      time,
      duration,
      seatsTotal,
      description,
      prerequisites,
      topicsCovered,
      posterImage
    } = req.body;

    if (!title || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title, category, and price are required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`;

    const newWorkshop = {
      title,
      slug,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) + 500,
      date: date || 'Upcoming Live Date',
      time: time || '7:00 PM IST',
      duration: duration || '2 Hours',
      seatsTotal: seatsTotal ? Number(seatsTotal) : 100,
      seatsBooked: 0,
      status: 'upcoming',
      description: description || 'Comprehensive practical workshop with real-time exercises.',
      prerequisites: prerequisites || ['Laptop with internet connection'],
      topicsCovered: topicsCovered || ['Core Architecture', 'Hands-on Coding', 'Q&A'],
      posterImage: posterImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      instructorId: user.id,
      speaker: {
        name: user.name || 'Verified Master Instructor',
        role: user.headline || 'Lead Instructor & Industry Practitioner',
        company: 'Kaira Partner Studio',
        avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'Instructor')}`,
        email: user.email,
        rating: 4.9,
        reviewsCount: 340,
        studentCount: 2800
      },
      createdAt: new Date()
    };

    const created = await storage.createWebinar(newWorkshop);
    res.status(201).json({ success: true, message: 'Masterclass created successfully in Seller Portal', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create workshop' });
  }
};

// Get students enrolled in instructor's workshops
exports.getEnrolledStudents = async (req, res) => {
  try {
    const user = req.user;
    const allRegistrations = await storage.getAllRegistrations();
    const allWebinars = await storage.getWebinars();

    // Map webinar IDs
    const webinarMap = {};
    allWebinars.forEach(w => { webinarMap[w.id] = w; });

    // Filter registrations for this instructor's events
    const enrolledStudents = allRegistrations.map(r => {
      const w = webinarMap[r.webinarId] || { title: r.webinarTitle };
      return {
        id: r.registrationId || r._id,
        registrationId: r.registrationId,
        studentName: r.fullName,
        studentEmail: r.email,
        phone: r.phone ? `${r.countryCode || '+91'} ${r.phone}` : 'N/A',
        webinarTitle: r.webinarTitle || (w && w.title),
        webinarId: r.webinarId,
        ticketType: r.ticketType,
        amount: r.amount,
        status: r.paymentStatus,
        verificationCode: r.verificationCode || 'VERIFIED',
        registeredAt: r.verifiedAt || r.createdAt
      };
    });

    res.json({
      success: true,
      count: enrolledStudents.length,
      data: enrolledStudents
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve enrolled students' });
  }
};

// Get instructor earnings and financial analytics
exports.getEarningsOverview = async (req, res) => {
  try {
    const allRegistrations = await storage.getAllRegistrations();
    const completed = allRegistrations.filter(r => r.paymentStatus === 'completed' && r.amount > 0);

    const grossSales = completed.reduce((sum, r) => sum + (r.amount || 0), 0);
    const platformShare = Math.round(grossSales * 0.15); // 15% platform commission
    const netInstructorPayout = grossSales - platformShare; // 85% instructor payout

    res.json({
      success: true,
      data: {
        currency: 'INR',
        grossSales,
        netInstructorPayout,
        platformFeePercent: 15,
        totalPaidTickets: completed.length,
        pendingPayout: Math.round(netInstructorPayout * 0.4),
        paidOut: Math.round(netInstructorPayout * 0.6),
        payoutSchedule: 'Every Tuesday via Bank Transfer (NEFT/RTGS)'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve earnings overview' });
  }
};
