const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

// @desc    Update profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });

        await logActivity(req.user._id, 'update_profile', `Profile updated for ${name}`, {}, req.ip);
        res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add family member
// @route   POST /api/users/family
exports.addFamilyMember = async (req, res) => {
    try {
        const { email, relation } = req.body;
        const familyUser = await User.findOne({ email });
        if (!familyUser) return res.status(404).json({ success: false, message: 'No user found with this email.' });
        if (familyUser._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot add yourself as a family member.' });
        }

        const user = await User.findById(req.user._id);
        const alreadyAdded = user.familyMembers.some((m) => m.userId.toString() === familyUser._id.toString());
        if (alreadyAdded) return res.status(400).json({ success: false, message: 'This person is already a family member.' });

        user.familyMembers.push({ userId: familyUser._id, name: familyUser.name, relation });
        await user.save();

        await logActivity(req.user._id, 'add_family_member', `Added ${familyUser.name} as ${relation}`, { familyId: familyUser._id }, req.ip);
        res.status(200).json({ success: true, message: `${familyUser.name} added as family member.`, familyMembers: user.familyMembers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove family member
// @route   DELETE /api/users/family/:memberId
exports.removeFamilyMember = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.familyMembers = user.familyMembers.filter((m) => m.userId.toString() !== req.params.memberId);
        await user.save();

        await logActivity(req.user._id, 'remove_family_member', `Removed family member`, { memberId: req.params.memberId }, req.ip);
        res.status(200).json({ success: true, message: 'Family member removed.', familyMembers: user.familyMembers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get family members
// @route   GET /api/users/family
exports.getFamilyMembers = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('familyMembers.userId', 'name email avatar');
        res.status(200).json({ success: true, familyMembers: user.familyMembers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
