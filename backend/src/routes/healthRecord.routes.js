const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecord.controller');

router.get('/', healthRecordController.getHealthRecords);
router.post('/', healthRecordController.createHealthRecord);

module.exports = router;
