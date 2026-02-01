const express = require('express');
const router = express.Router();
const {
  createBooking,
  verifyPaymentAndConfirm,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// User routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.post('/:id/verify-payment', protect, verifyPaymentAndConfirm);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/', protect, adminOnly, getAllBookings);
router.put('/:id/status', protect, adminOnly, updateBookingStatus);

module.exports = router;
