const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['Appointment Alert', 'Daily Medicine Reminder', 'Wellness Tip', 'Promotional Offer', 'General Announcement'],
      default: 'General Announcement',
    },
    targetAudience: {
      type: String,
      enum: ['All Users', 'Active Patients', 'Vaidyas & Doctors'],
      default: 'All Users',
    },
    sentBy: { type: String, default: 'Super Admin' },
    status: { type: String, enum: ['Sent', 'Failed'], default: 'Sent' },
    sentAt: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
