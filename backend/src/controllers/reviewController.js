const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Create a review
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, title, comment } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed or confirmed bookings'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      room: booking.room,
      booking: bookingId,
      rating,
      title,
      comment,
      stayDate: booking.checkIn
    });

    // Populate user info
    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reviews for a room
// @route   GET /api/reviews/room/:roomId
exports.getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    const stats = await Review.calculateAverageRating(req.params.roomId);

    res.json({
      success: true,
      ...stats,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('room', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, title, comment },
      { new: true, runValidators: true }
    ).populate('user', 'name');

    res.json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if user can review a booking
// @route   GET /api/reviews/can-review/:bookingId
exports.canReview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.json({ success: true, canReview: false, reason: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.json({ success: true, canReview: false, reason: 'Not your booking' });
    }

    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return res.json({ success: true, canReview: false, reason: 'Booking not completed' });
    }

    const existingReview = await Review.findOne({ booking: req.params.bookingId });
    if (existingReview) {
      return res.json({ success: true, canReview: false, reason: 'Already reviewed', review: existingReview });
    }

    res.json({ success: true, canReview: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
