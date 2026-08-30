const Doctor = require('../models/Doctor.model');
const Booking = require('../models/Booking.model');
const Notification = require('../models/Notification.model');
const { sendFirebasePushNotification } = require('../config/firebase');
const jwt = require('jsonwebtoken');

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
    if (maxFee > 0) {
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
    const targetId = req.params.id;
    const isObjId = require('mongoose').Types.ObjectId.isValid(targetId);
    const doctor = await Doctor.findOne({
      $or: [{ id: targetId }, ...(isObjId ? [{ _id: targetId }] : [])],
    });
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });

    const docIds = [targetId, ...(doctor ? [doctor.id, doctor._id.toString()] : [])];
    const confirmedBookings = await Booking.find({ doctorId: { $in: docIds }, status: 'Confirmed' });

    const docObj = doctor.toObject();
    docObj.confirmedBookings = confirmedBookings;

    res.json({ success: true, data: docObj });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { name, email, password, degree, specialty, experienceYears, consultationFee, hospital, bio, languages, availableSlots } = req.body;
    
    const cleanEmail = email ? email.toLowerCase().trim() : `doc_${Date.now()}@amrutam.com`;
    const cleanPassword = password || 'Doctor@123';

    const newDoctor = await Doctor.create({
      id: `doc_${Date.now()}`,
      name: name || 'Dr. New Doctor',
      email: cleanEmail,
      password: cleanPassword,
      role: 'doctor',
      degree: degree || 'BAMS, MD (Ayurveda)',
      specialty: specialty || 'Kaya Chikitsa (General Medicine)',
      experienceYears: parseInt(experienceYears || '5'),
      rating: 4.8,
      reviewCount: 1,
      consultationFee: parseInt(consultationFee || '500'),
      availableToday: true,
      nextAvailableSlot: 'Available Today',
      availableSlots: Array.isArray(availableSlots) ? availableSlots : [],
      bio: bio || 'Senior Ayurvedic Specialist',
      hospital: hospital || 'Amrutam Ayurvedic Center',
      languages: Array.isArray(languages) ? languages : ['English', 'Hindi'],
    });

    const notifTitle = 'Naye Ayurvedic Vaidya Joined 🌿';
    const notifMessage = `${newDoctor.name} (${newDoctor.specialty}) ab online consultation ke liye available hain!`;

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

exports.doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const doctor = await Doctor.findOne({ email: cleanEmail });

    if (!doctor) {
      return res.status(401).json({ success: false, error: 'Invalid Doctor email or credentials' });
    }

    if (doctor.password && doctor.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: doctor.id, role: 'doctor', email: doctor.email, name: doctor.name },
      process.env.JWT_SECRET || 'amrutam_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        doctor: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          role: 'doctor',
          specialty: doctor.specialty,
          degree: doctor.degree,
          hospital: doctor.hospital,
          consultationFee: doctor.consultationFee,
          availableSlots: doctor.availableSlots,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateDoctorSlots = async (req, res) => {
  try {
    const { availableSlots } = req.body;
    if (!Array.isArray(availableSlots)) {
      return res.status(400).json({ success: false, error: 'availableSlots must be an array of time strings' });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { id: req.params.id },
      { availableSlots },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });

    const io = req.app.get('io');
    if (io) {
      io.emit('doctors_updated', { action: 'update', doctor });
    }

    res.json({ success: true, data: doctor });
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
    const patientId = (req.query.patientId || req.query.userId || '').trim();
    const patientEmail = (req.query.patientEmail || req.query.email || '').toLowerCase().trim();

    const isObjId = require('mongoose').Types.ObjectId.isValid(doctorId);
    const doctor = await Doctor.findOne({
      $or: [{ id: doctorId }, ...(isObjId ? [{ _id: doctorId }] : [])],
    });

    const docIds = [doctorId];
    if (doctor) {
      if (doctor.id) docIds.push(String(doctor.id));
      if (doctor._id) docIds.push(String(doctor._id));
    }

    const times = doctor && Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [];

    // Fetch all confirmed bookings for this doctor on this date
    const allBookingsOnDate = await Booking.find({
      doctorId: { $in: docIds },
      slotDate: dateStr,
      status: { $regex: /^confirmed$/i },
    });

    // Map of slotTime -> count of booked patients (Capacity limit = 50 patients per slot)
    const slotPatientCounts = new Map();
    // Set of slotTimes booked specifically by current user
    const userBookedSlotTimes = new Set();

    allBookingsOnDate.forEach((b) => {
      const cleanTime = (b.slotTime || '').trim();
      const currentCount = slotPatientCounts.get(cleanTime) || 0;
      slotPatientCounts.set(cleanTime, currentCount + 1);

      const isUserBooking =
        (patientId && patientId !== 'usr_guest' && String(b.patientId) === patientId) ||
        (patientEmail && patientEmail !== 'patient@amrutam.com' && b.patientEmail && b.patientEmail.toLowerCase().trim() === patientEmail);

      if (isUserBooking) {
        userBookedSlotTimes.add(cleanTime);
      }
    });

    const MAX_SLOT_CAPACITY = 50;

    const slots = times.map((time, idx) => {
      const cleanTime = (time || '').trim();
      const bookedCount = slotPatientCounts.get(cleanTime) || 0;
      const isUserBooked = userBookedSlotTimes.has(cleanTime);
      const isCapacityFull = bookedCount >= MAX_SLOT_CAPACITY;

      return {
        id: `${doctorId}_${dateStr}_${idx}`,
        time: cleanTime,
        date: dateStr,
        isBooked: isUserBooked || isCapacityFull,
        isFull: isCapacityFull,
        bookedCount,
        availableCapacity: Math.max(0, MAX_SLOT_CAPACITY - bookedCount),
        isExpired: false,
      };
    });

    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDoctorBookings = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const isObjId = require('mongoose').Types.ObjectId.isValid(doctorId);
    const doctor = await Doctor.findOne({
      $or: [{ id: doctorId }, ...(isObjId ? [{ _id: doctorId }] : [])],
    });

    const docIds = [doctorId, ...(doctor ? [doctor.id, doctor._id.toString()] : [])];
    const bookings = await Booking.find({ doctorId: { $in: docIds } }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
