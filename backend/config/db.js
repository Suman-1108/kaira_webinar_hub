const mongoose = require('mongoose');

let isConnected = false;
let currentMode = 'uninitialized';
let currentHost = 'none';

const LOCAL_URI = process.env.MONGODB_LOCAL_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kaira_webinar_hub';
const ATLAS_URI = process.env.MONGODB_ATLAS_URI || 'mongodb+srv://hellosuman29_db_user:pVS42xTlrEyrWUPw@webinar.iqz8o5c.mongodb.net/kaira_webinar_hub?retryWrites=true&w=majority&appName=webinar';

/**
 * Connect to MongoDB with intelligent Local / Atlas Switch Model
 * @param {string} forcedMode - optional 'local' or 'atlas'
 */
const connectDB = async (forcedMode = null) => {
  // Determine target database mode
  // Priority: forcedMode -> process.env.DB_MODE -> NODE_ENV (production uses atlas, development uses local)
  const envMode = process.env.DB_MODE ? process.env.DB_MODE.toLowerCase() : null;
  const isProd = process.env.NODE_ENV === 'production';
  
  let targetMode = forcedMode || envMode || (isProd ? 'atlas' : 'local');
  if (targetMode !== 'atlas' && targetMode !== 'local') {
    targetMode = 'local';
  }

  const targetUri = targetMode === 'atlas' ? ATLAS_URI : LOCAL_URI;
  const targetLabel = targetMode === 'atlas' ? 'MongoDB Atlas (Cloud Cluster)' : 'Local MongoDB (127.0.0.1:27017)';

  console.log(`[Kaira Database] Initializing DB Connection in [${targetMode.toUpperCase()}] mode...`);
  console.log(`[Kaira Database] Target: ${targetLabel}`);

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 6000,
      autoIndex: true
    });

    isConnected = true;
    currentMode = targetMode;
    currentHost = conn.connection.host;

    console.log(`[Kaira Database] ✅ Successfully Connected to ${targetMode.toUpperCase()}: ${conn.connection.host}`);
    return { success: true, mode: currentMode, host: currentHost };
  } catch (error) {
    console.warn(`[Kaira Database] ⚠️ Connection to ${targetMode.toUpperCase()} failed: ${error.message}`);

    // If target was Atlas and failed, try automatic fallback to Local
    if (targetMode === 'atlas') {
      console.log(`[Kaira Database] Attempting automatic fallback to Local MongoDB (${LOCAL_URI})...`);
      try {
        const fallbackConn = await mongoose.connect(LOCAL_URI, { serverSelectionTimeoutMS: 3000 });
        isConnected = true;
        currentMode = 'local-fallback';
        currentHost = fallbackConn.connection.host;
        console.log(`[Kaira Database] ✅ Connected to Local MongoDB Fallback: ${fallbackConn.connection.host}`);
        return { success: true, mode: currentMode, host: currentHost };
      } catch (fallbackErr) {
        console.warn(`[Kaira Database] Local fallback also unavailable: ${fallbackErr.message}. Operating in resilient memory storage.`);
        currentMode = 'in-memory-storage';
      }
    } else {
      console.warn(`[Kaira Database] Operating with resilient fallback storage.`);
      currentMode = 'in-memory-storage';
    }

    return { success: false, mode: currentMode, error: error.message };
  }
};

/**
 * Get active database telemetry status
 */
const getDBStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    mode: currentMode,
    host: currentHost,
    activeUriType: currentMode === 'atlas' ? 'MongoDB Atlas Cloud' : 'Local MongoDB Instance',
    isProductionTarget: process.env.NODE_ENV === 'production'
  };
};

/**
 * Dynamic switch model to change between local and atlas at runtime
 */
const switchDatabaseMode = async (newMode) => {
  if (newMode !== 'local' && newMode !== 'atlas') {
    throw new Error('Invalid DB Mode. Expected "local" or "atlas".');
  }
  process.env.DB_MODE = newMode;
  return await connectDB(newMode);
};

module.exports = connectDB;
module.exports.getDBStatus = getDBStatus;
module.exports.switchDatabaseMode = switchDatabaseMode;
