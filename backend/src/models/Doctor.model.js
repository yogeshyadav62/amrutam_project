const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    degree: { type: String, required: true },
    specialty: { type: String, required: true, index: true },
    experienceYears: { type: Number, default: 5 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 100 },
    consultationFee: { type: Number, required: true },
    availableToday: { type: Boolean, default: true },
    nextAvailableSlot: { type: String, default: 'Available Today' },
    bio: { type: String },
    hospital: { type: String },
    languages: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
