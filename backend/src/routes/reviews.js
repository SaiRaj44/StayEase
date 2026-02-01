const express = require('express');
const router = express.Router();
const {
  createReview,
  getRoomReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  canReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/room/:roomId', getRoomReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.get('/can-review/:bookingId', protect, canReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
