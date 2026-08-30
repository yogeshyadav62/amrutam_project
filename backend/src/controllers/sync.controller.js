const Doctor = require('../models/Doctor.model');
const Product = require('../models/Product.model');
const Booking = require('../models/Booking.model');
const HealthRecord = require('../models/HealthRecord.model');

exports.syncOfflineQueue = async (req, res) => {
  try {
    const { pendingBookings } = req.body;
    const syncedBookings = [];

    if (Array.isArray(pendingBookings) && pendingBookings.length > 0) {
      for (const item of pendingBookings) {
        const confirmed = await Booking.create({
          id: `bk_synced_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          doctorId: item.doctorId,
          doctorName: item.doctorName || 'Ayurvedic Specialist',
          doctorSpecialty: item.doctorSpecialty || 'Kaya Chikitsa',
          doctorFee: item.doctorFee || 499,
          slotId: item.slotId || `slot_${Date.now()}`,
          slotTime: item.slotTime || '10:00 AM',
          slotDate: item.slotDate || new Date().toISOString().split('T')[0],
          status: 'Confirmed',
        });
        syncedBookings.push(confirmed);
      }
    }

    res.json({ success: true, data: { syncedBookings } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const doctorsCount = await Doctor.countDocuments();
    const productsCount = await Product.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    const healthRecordsCount = await HealthRecord.countDocuments();

    const confirmedBookings = await Booking.find({ status: 'Confirmed' });
    const totalRevenueSum = confirmedBookings.reduce((sum, b) => sum + (b.doctorFee || 0), 0);
    const revenueFormatted = `₹${totalRevenueSum.toLocaleString('en-IN')}`;

    res.json({
      success: true,
      data: {
        doctorsCount,
        productsCount,
        bookingsCount,
        healthRecordsCount,
        totalDoctors: doctorsCount,
        totalProducts: productsCount,
        totalHealthRecords: healthRecordsCount,
        activeBookingsCount: confirmedBookings.length,
        totalBookingsCount: bookingsCount,
        revenue: revenueFormatted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
