const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');

router.get('/', doctorController.getDoctors);
router.post('/', doctorController.createDoctor);
router.delete('/:id', doctorController.deleteDoctor);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id/slots', doctorController.updateDoctorSlots);
router.get('/:id/slots', doctorController.getDoctorSlots);
router.get('/:id/bookings', doctorController.getDoctorBookings);

module.exports = router;
