const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs for logged in user
// @route   GET /api/activity
exports.getActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const total = await ActivityLog.countDocuments({ user: req.user._id });
        const logs = await ActivityLog.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.status(200).json({ success: true, total, page: Number(page), logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

