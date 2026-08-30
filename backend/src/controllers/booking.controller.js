const Booking = require('../models/Booking.model');
const Doctor = require('../models/Doctor.model');
const Notification = require('../models/Notification.model');
const { sendFirebasePushNotification } = require('../config/firebase');

exports.createBooking = async (req, res) => {
  try {
    const { doctorId, slotId, dateStr, slotTime } = req.body;

    if (slotId && slotId.includes('expired')) {
      return res.status(400).json({ success: false, error: 'SLOT_EXPIRED: Requested slot has expired.' });
    }

    // Check for existing confirmed booking in MongoDB
    const doubleBooked = await Booking.findOne({
      doctorId,
      slotDate: dateStr,
      slotTime,
      status: 'Confirmed',
    });

    if (doubleBooked) {
      return res.status(409).json({ success: false, error: 'DOUBLE_BOOKING: You already have a booking for this time slot.' });
    }

    const doctor = await Doctor.findOne({ id: doctorId });

    const booking = await Booking.create({
      id: `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      doctorId,
      doctorName: doctor ? doctor.name : 'Ayurvedic Specialist',
      doctorSpecialty: doctor ? doctor.specialty : 'Kaya Chikitsa',
      doctorFee: doctor ? doctor.consultationFee : 499,
      slotId: slotId || `slot_${Date.now()}`,
      slotTime: slotTime || '10:00 AM',
      slotDate: dateStr || new Date().toISOString().split('T')[0],
      status: 'Confirmed',
    });

    const now = new Date();
    const sentAt = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const notifTitle = 'Appointment Confirmed 🩺';
    const notifMessage = `Aapka consultation ${booking.doctorName} ke sath ${booking.slotDate} (${booking.slotTime}) par confirm ho gaya hai!`;

    // Save automatic notification log
    await Notification.create({
      id: `notif_${Date.now()}`,
      title: notifTitle,
      message: notifMessage,
      category: 'Appointment Alert',
      targetAudience: 'Active Patients',
      sentBy: 'System Auto-Trigger',
      status: 'Sent',
      sentAt,
    });

    // Emit live WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('booking_created', booking);
      io.emit('push_notification', { title: notifTitle, message: notifMessage });
    }

    // AUTOMATIC Push Notification trigger via Firebase FCM
    await sendFirebasePushNotification({
      title: notifTitle,
      body: notifMessage,
      topic: 'all_users',
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '15');
    const search = (req.query.search || '').trim();
    const status = req.query.status;

    const query = {};
    if (search) {
      query.$or = [
        { doctorName: { $regex: search, $options: 'i' } },
        { doctorSpecialty: { $regex: search, $options: 'i' } },
        { slotDate: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    const totalCount = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    const data = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(pageSize);

    res.json({
      success: true,
      data: {
        data,
        page,
        pageSize,
        totalPages,
        totalCount,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Cancelled' },
      { new: true }
    );
    if (booking) {
      const notifTitle = 'Appointment Cancelled 📅';
      const notifMessage = `Aapka appointment for ${booking.doctorName} (${booking.slotDate}) cancel kar diya gaya hai.`;
      
      const io = req.app.get('io');
      if (io) {
        io.emit('booking_updated', booking);
        io.emit('push_notification', { title: notifTitle, message: notifMessage });
      }

      await sendFirebasePushNotification({
        title: notifTitle,
        body: notifMessage,
        topic: 'all_users',
      });

      return res.json({ success: true, data: booking });
    }
    res.status(404).json({ success: false, error: 'Booking not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (booking) {
      const notifTitle = `Appointment Status: ${status} 🩺`;
      const notifMessage = `Aapka ${booking.doctorName} ke sath consultation ${status} ho gaya hai.`;

      const io = req.app.get('io');
      if (io) {
        io.emit('booking_updated', booking);
        io.emit('push_notification', { title: notifTitle, message: notifMessage });
      }

      await sendFirebasePushNotification({
        title: notifTitle,
        body: notifMessage,
        topic: 'all_users',
      });

      return res.json({ success: true, data: booking });
    }
    res.status(404).json({ success: false, error: 'Booking not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
