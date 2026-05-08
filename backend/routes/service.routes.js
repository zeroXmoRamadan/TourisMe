import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  updateServiceStatus,
  getServicesByType,
  getMyServices,
  getTopRatedServices
} from '../controllers/serviceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Protected routes - Owner's services (must be before /:id wildcard)
router.get('/owner/my-services', protect, authorizeRoles('LocalBusinessOwner'), getMyServices);

// Public routes
router.get('/', getServices);
router.get('/top-rated', getTopRatedServices);
router.get('/type/:serviceType', getServicesByType);
router.get('/:id', getServiceById);

// Protected routes - Create, Update, Delete
router.post(
  '/', 
  protect, 
  authorizeRoles('LocalBusinessOwner', 'Admin'), 
  upload.array('images', 5), 
  createService
);

router.put(
  '/:id', 
  protect, 
  authorizeRoles('LocalBusinessOwner', 'Admin'), 
  upload.array('images', 5), 
  updateService
);

router.put(
  '/:id/status',
  protect,
  authorizeRoles('Admin'),
  updateServiceStatus
);

router.delete(
  '/:id', 
  protect, 
  authorizeRoles('LocalBusinessOwner', 'Admin'), 
  deleteService
);

// Multer error handler — catches file size and type errors and returns clean JSON
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image too large. Maximum file size is 10MB.' });
  }
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;