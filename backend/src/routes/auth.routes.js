const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const doctorController = require('../controllers/doctor.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/doctor-login', doctorController.doctorLogin);
router.get('/me', authController.getMe);

module.exports = router;
