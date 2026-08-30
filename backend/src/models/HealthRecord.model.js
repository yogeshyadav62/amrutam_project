const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['Lab Report', 'Prescription', 'Consultation', 'Vaccination', 'Allergy'], required: true },
    doctorName: { type: String },
    facility: { type: String },
    date: { type: String, required: true },
    monthYear: { type: String, required: true, index: true },
    tags: [{ type: String }],
    summary: { type: String },
    fileType: { type: String, default: 'PDF' },
    fileSize: { type: String, default: '1.2 MB' },
  },
  { timestamps: true }
);

HealthRecordSchema.index({ createdAt: -1 });
HealthRecordSchema.index({ date: -1 });
HealthRecordSchema.index({ type: 1 });

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
