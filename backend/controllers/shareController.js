const Share = require('../models/Share');
const Document = require('../models/Document');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

// @desc    Share a document with a family member
// @route   POST /api/shares
exports.shareDocument = async (req, res) => {
    try {
        const { documentId, sharedWithEmail, permission, expiresAt } = req.body;

        const doc = await Document.findById(documentId);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
        if (doc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only share your own documents.' });
        }

        const sharedWithUser = await User.findOne({ email: sharedWithEmail });
        if (!sharedWithUser) return res.status(404).json({ success: false, message: 'User with this email not found.' });
        if (sharedWithUser._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot share a document with yourself.' });
        }

        // Check if already shared
        const existing = await Share.findOne({ document: documentId, sharedWith: sharedWithUser._id, isActive: true });
        if (existing) {
            existing.permission = permission || existing.permission;
            existing.expiresAt = expiresAt || existing.expiresAt;
            await existing.save();
            return res.status(200).json({ success: true, message: 'Share updated.', share: existing });
        }

        const share = await Share.create({
            document: documentId,
            sharedBy: req.user._id,
            sharedWith: sharedWithUser._id,
            permission: permission || 'view',
            expiresAt: expiresAt || null,
        });

        // Update document isShared flag
        await Document.findByIdAndUpdate(documentId, { isShared: true });

        await logActivity(req.user._id, 'share_document', `Shared "${doc.name}" with ${sharedWithUser.name}`, {
            docId: doc._id, sharedWith: sharedWithUser._id,
        }, req.ip);

        res.status(201).json({ success: true, message: `Document shared with ${sharedWithUser.name}.`, share });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get documents shared with me
// @route   GET /api/shares/received
exports.getSharedWithMe = async (req, res) => {
    try {
        const shares = await Share.find({
            sharedWith: req.user._id,
            isActive: true,
            $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
        })
            .populate('document')
            .populate('sharedBy', 'name email avatar');

        res.status(200).json({ success: true, shares });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get documents I have shared
// @route   GET /api/shares/sent
exports.getSharedByMe = async (req, res) => {
    try {
        const shares = await Share.find({ sharedBy: req.user._id, isActive: true })
            .populate('document', 'name type')
            .populate('sharedWith', 'name email avatar');

        res.status(200).json({ success: true, shares });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Revoke a share
// @route   DELETE /api/shares/:id
exports.revokeShare = async (req, res) => {
    try {
        const share = await Share.findById(req.params.id).populate('document');
        if (!share) return res.status(404).json({ success: false, message: 'Share not found.' });
        if (share.sharedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        share.isActive = false;
        await share.save();

        // Check if any active shares exist for this document
        const activeShares = await Share.countDocuments({ document: share.document._id, isActive: true });
        if (activeShares === 0) {
            await Document.findByIdAndUpdate(share.document._id, { isShared: false });
        }

        await logActivity(req.user._id, 'revoke_share', `Revoked share for "${share.document.name}"`, { shareId: share._id }, req.ip);

        res.status(200).json({ success: true, message: 'Share revoked successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
