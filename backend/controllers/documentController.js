const Document = require('../models/Document');
const Share = require('../models/Share');
const User = require('../models/User');
const { cloudinary } = require('../middleware/cloudinary');
const { logActivity } = require('../utils/activityLogger');

// @desc    Upload document
// @route   POST /api/documents/upload
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
        const { name, type, description, tags } = req.body;

        const isPdf = req.file.mimetype === 'application/pdf';
        const doc = await Document.create({
            owner: req.user._id,
            name,
            type,
            description,
            fileUrl: req.file.path,
            publicId: req.file.filename,
            fileType: isPdf ? 'pdf' : 'image',
            fileSize: req.file.size,
            tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        });

        // Update storage used
        await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: req.file.size } });
        await logActivity(req.user._id, 'upload_document', `Uploaded document: ${name}`, { docId: doc._id, type }, req.ip);

        res.status(201).json({ success: true, message: 'Document uploaded successfully.', document: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all documents for logged in user
// @route   GET /api/documents
exports.getMyDocuments = async (req, res) => {
    try {
        const { type, search, page = 1, limit = 10 } = req.query;
        const query = { owner: req.user._id };
        if (type) query.type = type;
        if (search) query.name = { $regex: search, $options: 'i' };

        const total = await Document.countDocuments(query);
        const documents = await Document.find(query)
            .sort({ uploadedAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.status(200).json({ success: true, total, page: Number(page), documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single document
// @route   GET /api/documents/:id
exports.getDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
        if (doc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        await logActivity(req.user._id, 'view_document', `Viewed document: ${doc.name}`, { docId: doc._id }, req.ip);
        res.status(200).json({ success: true, document: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update document
// @route   PUT /api/documents/:id
exports.updateDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
        if (doc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const { name, description, tags } = req.body;
        doc.name = name || doc.name;
        doc.description = description || doc.description;
        doc.tags = tags ? tags.split(',').map((t) => t.trim()) : doc.tags;
        await doc.save();

        await logActivity(req.user._id, 'update_document', `Updated document: ${doc.name}`, { docId: doc._id }, req.ip);
        res.status(200).json({ success: true, message: 'Document updated.', document: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
        if (doc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        // Delete from Cloudinary
        const resourceType = doc.fileType === 'pdf' ? 'raw' : 'image';
        await cloudinary.uploader.destroy(doc.publicId, { resource_type: resourceType });

        // Remove all shares for this document
        await Share.deleteMany({ document: doc._id });

        // Update storage used
        await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: -doc.fileSize } });

        await doc.deleteOne();
        await logActivity(req.user._id, 'delete_document', `Deleted document: ${doc.name}`, { docId: doc._id }, req.ip);

        res.status(200).json({ success: true, message: 'Document deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/documents/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const totalDocuments = await Document.countDocuments({ owner: userId });
        const sharedDocuments = await Share.countDocuments({ sharedBy: userId });
        const familyMembers = req.user.familyMembers?.length || 0;
        const user = await User.findById(userId);
        const storageUsed = user?.storageUsed || 0;

        const recentDocuments = await Document.find({ owner: userId }).sort({ uploadedAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            stats: { totalDocuments, sharedDocuments, familyMembers, storageUsed },
            recentDocuments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
