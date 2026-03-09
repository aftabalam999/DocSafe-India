const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getActivityLogs } = require('../controllers/activityController');

router.get('/', protect, getActivityLogs);

module.exports = router;
