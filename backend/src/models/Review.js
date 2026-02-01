const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  stayDate: {
    type: Date,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: true // Since it's linked to a booking
  }
}, {
  timestamps: true
});

// Prevent multiple reviews for same booking
reviewSchema.index({ booking: 1 }, { unique: true });

// Index for room reviews
reviewSchema.index({ room: 1, createdAt: -1 });

// Static method to calculate average rating for a room
reviewSchema.statics.calculateAverageRating = async function(roomId) {
  const stats = await this.aggregate([
    { $match: { room: roomId } },
    {
      $group: {
        _id: '$room',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    };
  }
  return { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);
