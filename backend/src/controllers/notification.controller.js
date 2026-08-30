const Notification = require('../models/Notification.model');
const { sendFirebasePushNotification } = require('../config/firebase');

exports.sendNotification = async (req, res) => {
  try {
    const { title, message, category, targetAudience } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and Message are required.' });
    }

    const now = new Date();
    const sentAt = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const notificationDoc = await Notification.create({
      id: `notif_${Date.now()}`,
      title,
      message,
      category: category || 'General Announcement',
      targetAudience: targetAudience || 'All Users',
      sentBy: 'Super Admin',
      status: 'Sent',
      sentAt,
    });

    // Emit live WebSocket notification event
    const io = req.app.get('io');
    if (io) {
      io.emit('push_notification', {
        id: notificationDoc.id,
        title: notificationDoc.title,
        message: notificationDoc.message,
        category: notificationDoc.category,
        targetAudience: notificationDoc.targetAudience,
        sentAt: notificationDoc.sentAt,
      });
    }

    // Trigger Firebase FCM Push Notification
    await sendFirebasePushNotification({
      title: notificationDoc.title,
      body: notificationDoc.message,
      topic: targetAudience === 'Vaidyas & Doctors' ? 'doctors' : 'all_users',
    });

    res.status(201).json({ success: true, data: notificationDoc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '15');

    const totalCount = await Notification.countDocuments();
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    const data = await Notification.find()
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
