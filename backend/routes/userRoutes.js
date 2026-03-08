const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { updateProfile, addFamilyMember, removeFamilyMember, getFamilyMembers } = require('../controllers/userController');

router.put('/profile', protect, updateProfile);
router.get('/family', protect, getFamilyMembers);
router.post('/family', protect, addFamilyMember);
router.delete('/family/:memberId', protect, removeFamilyMember);

module.exports = router;
