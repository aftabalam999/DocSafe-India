const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getActivityLogs, getAllActivityLogs } = require('../controllers/activityController');

router.get('/', protect, getActivityLogs);
router.get('/all', protect, adminOnly, getAllActivityLogs);

module.exports = router;
