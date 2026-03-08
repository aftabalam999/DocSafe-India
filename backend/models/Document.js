const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Document name is required'],
        trim: true,
        maxlength: [100, 'Document name cannot exceed 100 characters'],
    },
    type: {
        type: String,
        required: [true, 'Document type is required'],
        enum: ['aadhaar', 'pan', 'passport', 'marksheet', 'birth_certificate', 'driving_license', 'voter_id', 'other'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    fileUrl: {
        type: String,
        required: true,
    },
    publicId: {
        type: String, // Cloudinary public ID for deletion
        required: true,
    },
    fileType: {
        type: String,
        enum: ['pdf', 'image'],
        required: true,
    },
    fileSize: {
        type: Number, // in bytes
        required: true,
    },
    isShared: {
        type: Boolean,
        default: false,
    },
    tags: [String],
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

documentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Document', documentSchema);
