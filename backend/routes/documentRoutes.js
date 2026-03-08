const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/cloudinary');
const {
    uploadDocument,
    getMyDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    getDashboardStats,
} = require('../controllers/documentController');

router.get('/stats', protect, getDashboardStats);
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getMyDocuments);
router.get('/:id', protect, getDocument);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
