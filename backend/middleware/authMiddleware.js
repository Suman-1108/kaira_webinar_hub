const jwt = require('jsonwebtoken');
const storage = require('../services/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'kaira_webinar_hub_super_secret_jwt_key_2026';

/**
 * Middleware to verify JWT token and authenticate user
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to your account before registering for a course.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attempt to enrich with fresh database user record if available
    let user = null;
    try {
      user = await storage.findUserById(decoded.id);
    } catch (e) {
      // Storage fallback
    }

    req.user = {
      id: decoded.id,
      email: (user && user.email) || decoded.email,
      name: (user && user.name) || decoded.name,
      role: (user && user.role) || decoded.role || 'user'
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Your login session has expired. Please log in again to continue.'
    });
  }
};

/**
 * Optional token middleware - extracts user if present, doesn't block if absent
 */
const optionalToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role || 'user'
        };
      }
    }
  } catch (e) {
    // Silent ignore for optional auth
  }
  next();
};

/**
 * Require Admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin credentials required to access this portal.'
    });
  }
  next();
};

/**
 * Require Seller/Instructor or Admin role
 */
const requireInstructorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  const allowed = ['instructor', 'seller', 'admin'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Instructor or Seller portal credentials required.'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  optionalToken,
  requireAdmin,
  requireInstructorOrAdmin,
  JWT_SECRET
};
