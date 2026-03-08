const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, description, metadata = {}, ipAddress = '') => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            description,
            metadata,
            ipAddress,
        });
    } catch (error) {
        console.error('Activity log error:', error.message);
    }
};

module.exports = { logActivity };
