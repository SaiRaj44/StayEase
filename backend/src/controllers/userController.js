const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get booking counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingsCount = await Booking.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          bookingsCount
        };
      })
    );

    res.json({
      success: true,
      count: users.length,
      users: usersWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Block/Unblock user (Admin only)
// @route   PUT /api/admin/users/:id/block
exports.toggleUserBlock = async (req, res) => {
  try {
    const { block } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin users'
      });
    }

    user.isBlocked = block;
    await user.save();

    res.json({
      success: true,
      message: block ? 'User blocked successfully' : 'User unblocked successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
