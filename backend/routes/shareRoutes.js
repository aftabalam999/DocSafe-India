const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { shareDocument, getSharedWithMe, getSharedByMe, revokeShare } = require('../controllers/shareController');

router.post('/', protect, shareDocument);
router.get('/received', protect, getSharedWithMe);
router.get('/sent', protect, getSharedByMe);
router.delete('/:id', protect, revokeShare);

module.exports = router;
