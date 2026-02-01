const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRevenueAnalytics,
  getOccupancyAnalytics,
  getUsers
} = require('../controllers/adminController');
const { getAllUsers, toggleUserBlock } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/occupancy', getOccupancyAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleUserBlock);

module.exports = router;
