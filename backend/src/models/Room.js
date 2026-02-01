const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide room name'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'premium'],
    required: [true, 'Please specify room type']
  },
  description: {
    type: String,
    required: [true, 'Please provide room description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    type: String
  }],
  pricePerNight: {
    type: Number,
    required: [true, 'Please provide price per night'],
    min: [0, 'Price cannot be negative']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Please specify maximum guests'],
    min: [1, 'At least 1 guest required'],
    max: [10, 'Maximum 10 guests allowed']
  },
  amenities: [{
    type: String
  }],
  houseRules: [{
    type: String
  }],
  cancellationPolicy: {
    type: String,
    default: 'Free cancellation up to 24 hours before check-in. After that, the first night is non-refundable.'
  },
  location: {
    area: {
      type: String,
      required: [true, 'Please specify area'],
      enum: ['Tirupati', 'Tirumala', 'Alipiri', 'Kapila Theertham', 'Chandragiri', 'Sri Kalahasti']
    },
    address: {
      type: String,
      required: [true, 'Please provide address']
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  roomCount: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 room required']
  }
}, {
  timestamps: true
});

// Index for search
roomSchema.index({ type: 1, 'location.area': 1, pricePerNight: 1 });

module.exports = mongoose.model('Room', roomSchema);
