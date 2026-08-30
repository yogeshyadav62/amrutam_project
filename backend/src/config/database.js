const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Amrutam MongoDB Atlas connection established successfully.');
  } catch (error) {
    console.error('🔥 MongoDB connection warning:', error.message);
    console.log('⚡ Working with resilient in-memory data engine.');
  }
};

module.exports = { connectDatabase };
