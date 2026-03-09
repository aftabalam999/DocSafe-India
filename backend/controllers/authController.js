const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { generateOTP, sendOTPEmail, sendForgotPasswordEmail } = require('../utils/otpService');
const { logActivity } = require('../utils/activityLogger');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (!existingUser.isVerified) {
                // Resend OTP
                const otp = generateOTP();
                existingUser.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
                await existingUser.save({ validateBeforeSave: false });
                await sendOTPEmail(email, otp, name);
                return res.status(200).json({ success: true, message: 'OTP resent to your email. Please verify.' });
            }
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const otp = generateOTP();
        const user = await User.create({
            name,
            email,
            password,
            phone,
            otp: { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        });

        await sendOTPEmail(email, otp, name);
        await logActivity(user._id, 'register', `User ${name} registered and OTP sent`, { email });

        res.status(201).json({ success: true, message: 'Registration successful. Please verify your email with the OTP sent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified.' });

        if (!user.otp?.code || user.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }
        if (new Date() > user.otp.expiresAt) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please register again.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        await user.save({ validateBeforeSave: false });

        await logActivity(user._id, 'otp_verified', `Email verified for ${user.name}`, { email });

        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            token,
            user: { _id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Please verify your email first.', needsVerification: true, email });
        }

        await logActivity(user._id, 'login', `User ${user.name} logged in`, {}, req.ip);
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified.' });

        const otp = generateOTP();
        user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
        await user.save({ validateBeforeSave: false });
        await sendOTPEmail(email, otp, user.name);

        res.status(200).json({ success: true, message: 'OTP resent successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('familyMembers.userId', 'name email avatar');
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const otp = generateOTP();
        user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
        await user.save({ validateBeforeSave: false });

        await sendForgotPasswordEmail(email, otp, user.name);
        await logActivity(user._id, 'security', `Password reset OTP sent`, { email });

        res.status(200).json({ success: true, message: 'Password reset OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        if (!user.otp?.code || user.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }
        if (new Date() > user.otp.expiresAt) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        user.password = newPassword;
        user.otp = undefined;
        await user.save();

        await logActivity(user._id, 'security', `Password reset successful`, { email });

        res.status(200).json({ success: true, message: 'Password updated successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
