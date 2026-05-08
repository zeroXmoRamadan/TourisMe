import express from 'express';
import {
  getAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
  getAttractionsByCategory,
  getNearbyAttractions,
  getTopRatedAttractions,
  getCategories
} from '../controllers/attractionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';   

const router = express.Router();

// Public routes
router.get('/', getAttractions);
router.get('/categories', getCategories);
router.get('/nearby', getNearbyAttractions);
router.get('/top-rated', getTopRatedAttractions);
router.get('/category/:category', getAttractionsByCategory);
router.get('/:id', getAttractionById);

// Protected routes (Admin only)
router.post('/', protect, authorizeRoles('Admin'), upload.array('images', 5), createAttraction); 
router.put('/:id', protect, authorizeRoles('Admin'), upload.array('images', 5), updateAttraction);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteAttraction);

// Multer error handler
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image too large. Maximum file size is 10MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Too many files. Maximum is 5 images.' });
  }
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;