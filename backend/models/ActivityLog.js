const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'register',
            'upload_document',
            'delete_document',
            'update_document',
            'share_document',
            'revoke_share',
            'view_document',
            'download_document',
            'add_family_member',
            'remove_family_member',
            'update_profile',
            'otp_verified',
        ],
    },
    description: {
        type: String,
        required: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    ipAddress: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
