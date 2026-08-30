const User = require('../models/User.model');
const Notification = require('../models/Notification.model');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email or phone already exists' });
    }

    const newUser = await User.create({
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'patient',
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user: userObj,
        token: `token_${newUser.id}_${Date.now()}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, error: 'Please enter your email/phone and password' });
    }

    const queryStr = emailOrPhone.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: queryStr }, { phone: queryStr }],
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: userObj,
        token: `token_${user.id}_${Date.now()}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'userId parameter required' });

    const user = await User.findOne({ id: userId }).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
