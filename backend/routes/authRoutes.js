const express = require('express');
const router = express.Router();
const { register, verifyOtp, login, resendOtp, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);

module.exports = router;
