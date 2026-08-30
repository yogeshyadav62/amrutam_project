const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, index: true },
    password: { type: String, default: 'Doctor@123' },
    role: { type: String, default: 'doctor' },
    degree: { type: String, required: true },
    specialty: { type: String, required: true, index: true },
    experienceYears: { type: Number, default: 5 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 100 },
    consultationFee: { type: Number, required: true },
    availableToday: { type: Boolean, default: true },
    nextAvailableSlot: { type: String, default: 'Available Today' },
    availableSlots: {
      type: [String],
      default: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'],
    },
    bio: { type: String },
    hospital: { type: String },
    languages: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
