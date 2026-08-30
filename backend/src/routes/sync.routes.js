const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');

router.post('/sync', syncController.syncOfflineQueue);
router.get('/stats', syncController.getStats);

module.exports = router;
