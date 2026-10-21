const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { getDBStatus, switchDatabaseMode } = require('./config/db');
const storage = require('./services/storage');
const emailService = require('./services/emailService');

const authRoutes = require('./routes/authRoutes');
const webinarRoutes = require('./routes/webinarRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const learningRoutes = require('./routes/learningRoutes');
const adminRoutes = require('./routes/adminRoutes');
const instructorRoutes = require('./routes/instructorRoutes');

const app = express();

// Trust reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature']
}));

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Resilient DB connection on startup
connectDB();

// Health Check
app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'OK',
    service: 'Kaira Webinar Hub API',
    theme: 'Udemy-Inspired Royal Purple (#A435F0)',
    version: '1.2.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes (supporting both legacy /api and versioned /api/v1)
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

app.use('/api/webinars', webinarRoutes);
app.use('/api/v1/webinars', webinarRoutes);

app.use('/api/registration', registrationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/v1/registrations', registrationRoutes);

// Dedicated PhonePe Payment Gateway Routes
app.use(['/api/payments/phonepe', '/api/v1/payments/phonepe'], paymentRoutes);

// Udemy-Style Learning & Course Player Routes
app.use(['/api/learning', '/api/v1/learning'], learningRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use('/api/instructor', instructorRoutes);
app.use('/api/v1/instructor', instructorRoutes);

// Invoices / Receipts endpoint
app.get(['/api/invoices/:docNumber', '/api/v1/invoices/:docNumber'], async (req, res) => {
  try {
    const { docNumber } = req.params;
    const all = await storage.getAllRegistrations();
    const match = all.find(r => r.invoiceNumber === docNumber || r.registrationId === docNumber);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Invoice document not found' });
    }

    const webinar = await storage.getWebinarById(match.webinarId);

    res.json({
      success: true,
      data: {
        documentNumber: match.invoiceNumber || `INV-2026-${match.registrationId}`,
        registrationId: match.registrationId,
        issuedAt: match.verifiedAt || match.createdAt,
        billingDetails: {
          name: match.fullName,
          email: match.email,
          phone: `${match.countryCode || '+91'} ${match.phone}`
        },
        item: {
          title: match.webinarTitle,
          ticketType: match.ticketType,
          webinarDate: webinar ? webinar.date : 'TBD',
          speaker: webinar && webinar.speaker ? webinar.speaker.name : 'Lead Specialist',
          amount: match.amount,
          currency: match.currency || 'INR'
        },
        payment: {
          method: match.paymentMethod,
          status: match.paymentStatus,
          orderId: match.razorpayOrderId,
          paymentId: match.razorpayPaymentId
        },
        issuer: {
          company: 'Kaira Webinar Hub',
          supportEmail: 'billing@kairawebinarhub.com',
          website: 'https://kairawebinarhub.com'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve invoice' });
  }
});

// Contact / Enquiries endpoint - with Gmail SMTP dispatch
app.post(['/api/enquiries', '/api/v1/enquiries'], async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;
  console.log(`[New Enquiry]: from ${fullName} (${email}) - ${subject}`);
  
  // Send emails via Gmail SMTP to hellosuman29@gmail.com and confirmation to sender
  emailService.sendEnquiryEmails({
    fullName: fullName || 'Visitor',
    email,
    phone,
    subject: subject || 'General Webinar Enquiry',
    message: message || 'No message content'
  }).catch(err => console.warn('[Enquiry Email Warning]:', err.message));

  res.json({
    success: true,
    message: 'Enquiry received. A notification has been dispatched to hellosuman29@gmail.com.'
  });
});

// Database telemetry and switch endpoints (Local vs Atlas)
app.get(['/api/admin/db-status', '/api/v1/admin/db-status'], (req, res) => {
  res.json({
    success: true,
    data: getDBStatus()
  });
});

app.post(['/api/admin/db-switch', '/api/v1/admin/db-switch'], async (req, res) => {
  const { mode } = req.body; // 'local' or 'atlas'
  try {
    const result = await switchDatabaseMode(mode);
    res.json({
      success: true,
      message: `Database switched to ${mode.toUpperCase()}`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Test Email endpoint to verify Gmail SMTP delivery
app.post(['/api/admin/test-email', '/api/v1/admin/test-email'], async (req, res) => {
  const targetEmail = req.body.email || 'hellosuman29@gmail.com';
  try {
    const result = await emailService.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Kaira Webinar Hub <hellosuman29@gmail.com>',
      to: targetEmail,
      subject: `[Kaira Webinar Hub] Test SMTP Verification • ${new Date().toLocaleTimeString()}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #F1D3DE; border-radius: 8px;">
          <h2 style="color: #970747;">Gmail SMTP Working Successfully!</h2>
          <p>This email confirms that your Gmail SMTP credentials for <strong>hellosuman29@gmail.com</strong> are active and delivering emails properly for Kaira Webinar Hub.</p>
          <p style="font-size: 12px; color: #71717A;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `
    });
    res.json({ success: true, message: `Test email sent to ${targetEmail}`, messageId: result.messageId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend build if available
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// For SPA routing fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Kaira Webinar Hub API is running. Start the frontend Vite server at http://localhost:5174');
    }
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[Kaira Webinar Hub] Backend Server running on http://localhost:${PORT}`);
});

module.exports = app;
