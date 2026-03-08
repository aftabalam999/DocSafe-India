const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sharedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    permission: {
        type: String,
        enum: ['view', 'download'],
        default: 'view',
    },
    expiresAt: {
        type: Date,
        default: null, // null means no expiry
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    sharedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Share', shareSchema);
