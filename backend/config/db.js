const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kaira_webinar_hub';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[Kaira Backend] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Kaira Backend] MongoDB connection warning: ${error.message}. Running with resilient fallback storage.`);
  }
};

module.exports = connectDB;
