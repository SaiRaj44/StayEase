const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Please provide check-in date']
  },
  checkOut: {
    type: Date,
    required: [true, 'Please provide check-out date']
  },
  guests: {
    type: Number,
    required: [true, 'Please specify number of guests'],
    min: [1, 'At least 1 guest required']
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  guestDetails: {
    name: {
      type: String,
      required: [true, 'Please provide guest name']
    },
    email: {
      type: String,
      required: [true, 'Please provide guest email']
    },
    phone: {
      type: String,
      required: [true, 'Please provide guest phone']
    },
    specialRequests: String
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  bookingId: {
    type: String,
    unique: true
  },
  cancellationReason: String,
  cancelledAt: Date
}, {
  timestamps: true
});

// Generate booking ID before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingId = `SE${year}${month}${random}`;
  }
  next();
});

// Validate checkout after checkin
bookingSchema.pre('validate', function(next) {
  if (this.checkOut <= this.checkIn) {
    next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
