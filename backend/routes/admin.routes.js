import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleSuspend,
  getSystemStats,
  getAllTripPlans,
  getAdminTripStats,
  deleteTripPlanAsAdmin
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorizeRoles('Admin'));

// Dashboard analytics
router.get('/dashboard', getDashboardStats);
router.get('/stats', getSystemStats);

// Trip management
router.get('/trips', getAllTripPlans);
router.get('/trips/stats', getAdminTripStats);
router.delete('/trips/:id', deleteTripPlanAsAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.patch('/users/:id/suspend', toggleSuspend);
router.delete('/users/:id', deleteUser);

export default router;