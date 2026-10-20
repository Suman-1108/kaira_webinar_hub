const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const webinarRoutes = require('./routes/webinarRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');

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
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'OK',
    service: 'Kaira Webinar Hub API',
    theme: 'Burgundy & Rose Pink',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/webinars', webinarRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Contact / Enquiries endpoint
app.post('/api/enquiries', (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;
  console.log(`[New Enquiry]: from ${fullName} (${email}) - ${subject}`);
  res.json({
    success: true,
    message: 'Enquiry received. Our academic coordinator will contact you shortly.'
  });
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
