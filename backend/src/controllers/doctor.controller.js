const Doctor = require('../models/Doctor.model');
const Booking = require('../models/Booking.model');
const Notification = require('../models/Notification.model');
const { sendFirebasePushNotification } = require('../config/firebase');

exports.getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');
    const search = (req.query.search || '').trim();
    const specialty = req.query.specialty;
    const minExperience = req.query.minExperience ? parseInt(req.query.minExperience) : 0;
    const maxFee = req.query.maxFee ? parseInt(req.query.maxFee) : 0;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
      ];
    }
    if (specialty && specialty !== 'All') {
      query.specialty = { $regex: specialty, $options: 'i' };
    }
    if (minExperience > 0) {
      query.experienceYears = { $gte: minExperience };
    }
    if (maxFee > 0 && maxFee < 5000) {
      query.consultationFee = { $lte: maxFee };
    }

    const totalCount = await Doctor.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    const data = await Doctor.find(query)
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

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ id: req.params.id });
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { name, degree, specialty, experienceYears, consultationFee, hospital, bio, languages } = req.body;
    
    const newDoctor = await Doctor.create({
      id: `doc_${Date.now()}`,
      name: name || 'Dr. New Doctor',
      degree: degree || 'BAMS, MD (Ayurveda)',
      specialty: specialty || 'Kaya Chikitsa (General Medicine)',
      experienceYears: parseInt(experienceYears || '5'),
      rating: 4.8,
      reviewCount: 1,
      consultationFee: parseInt(consultationFee || '500'),
      availableToday: true,
      nextAvailableSlot: 'Available Today',
      bio: bio || 'Senior Ayurvedic Specialist',
      hospital: hospital || 'Amrutam Ayurvedic Center',
      languages: Array.isArray(languages) ? languages : ['English', 'Hindi'],
    });

    const notifTitle = 'Naye Ayurvedic Vaidya Joined 🌿';
    const notifMessage = `${newDoctor.name} (${newDoctor.specialty}) ab online consultation ke liye available hain!`;

    // Save notification log
    const now = new Date();
    await Notification.create({
      id: `notif_${Date.now()}`,
      title: notifTitle,
      message: notifMessage,
      category: 'General Announcement',
      targetAudience: 'All Users',
      sentBy: 'System Auto-Trigger',
      status: 'Sent',
      sentAt: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });

    // WebSockets & FCM Auto Trigger
    const io = req.app.get('io');
    if (io) {
      io.emit('doctors_updated', { action: 'create', doctor: newDoctor });
      io.emit('push_notification', { title: notifTitle, message: notifMessage });
    }
    await sendFirebasePushNotification({ title: notifTitle, body: notifMessage, topic: 'all_users' });

    res.status(201).json({ success: true, data: newDoctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.findOneAndDelete({ id });
    
    const io = req.app.get('io');
    if (io) {
      io.emit('doctors_updated', { action: 'delete', id });
    }

    res.json({ success: true, message: 'Doctor deleted successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDoctorSlots = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];

    const existingBookings = await Booking.find({
      doctorId,
      slotDate: dateStr,
      status: 'Confirmed',
    });
    const bookedSlotTimes = new Set(existingBookings.map(b => b.slotTime));

    const times = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'];
    const slots = times.map((time, idx) => ({
      id: `${doctorId}_${dateStr}_${idx}`,
      time,
      date: dateStr,
      isBooked: bookedSlotTimes.has(time),
      isExpired: idx === 0 && dateStr === new Date().toISOString().split('T')[0],
    }));

    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDoctorBookings = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const bookings = await Booking.find({ doctorId }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
