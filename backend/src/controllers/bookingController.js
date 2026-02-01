const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const { createOrder, verifyPayment } = require('../services/payment');

// @desc    Create booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, guestDetails } = req.body;

    // Validate room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check availability
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const existingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for selected dates'
      });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.pricePerNight;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      guestDetails,
      status: 'pending'
    });

    // Create Razorpay order
    const order = await createOrder(totalPrice, 'INR', booking.bookingId);

    // Create payment record
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user.id,
      amount: totalPrice,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    booking.payment = payment._id;
    await booking.save();

    res.status(201).json({
      success: true,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        room: room.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status
      },
      payment: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify payment and confirm booking
// @route   POST /api/bookings/:id/verify-payment
exports.verifyPaymentAndConfirm = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify payment signature
    const isValid = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment
    await Payment.findByIdAndUpdate(booking.payment, {
      razorpayPaymentId,
      razorpaySignature,
      status: 'completed'
    });

    // Confirm booking
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('room', 'name type images pricePerNight location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room', 'name type images pricePerNight location amenities cancellationPolicy')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.checkIn = {};
      if (startDate) filter.checkIn.$gte = new Date(startDate);
      if (endDate) filter.checkIn.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate('room', 'name type pricePerNight')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('room', 'name').populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
