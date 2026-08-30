const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String },
    doctorFee: { type: Number, required: true },
    patientId: { type: String },
    patientName: { type: String, default: 'Anonymous Patient' },
    patientEmail: { type: String, default: 'patient@amrutam.com' },
    patientPhone: { type: String, default: '+91 9876543210' },
    slotId: { type: String, required: true },
    slotTime: { type: String, required: true },
    slotDate: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['Confirmed', 'Completed', 'Cancelled'], default: 'Confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
