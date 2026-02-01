const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Today's check-ins
    const todayCheckIns = await Booking.countDocuments({
      checkIn: { $gte: today, $lt: tomorrow },
      status: 'confirmed'
    });

    // Today's check-outs
    const todayCheckOuts = await Booking.countDocuments({
      checkOut: { $gte: today, $lt: tomorrow },
      status: { $in: ['confirmed', 'completed'] }
    });

    // Total rooms
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true });

    // This month's bookings
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: thisMonth, $lt: nextMonth }
    });

    // This month's revenue
    const monthlyRevenueData = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: thisMonth, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const monthlyRevenue = monthlyRevenueData[0]?.total || 0;

    // Total revenue
    const totalRevenueData = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Pending bookings
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('room', 'name type')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        todayCheckIns,
        todayCheckOuts,
        totalRooms,
        availableRooms,
        monthlyBookings,
        monthlyRevenue,
        totalRevenue,
        totalUsers,
        pendingBookings
      },
      recentBookings,
      statusBreakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupBy;
    if (period === 'daily') {
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === 'weekly') {
      groupBy = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
    } else {
      groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const revenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      period,
      revenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get occupancy analytics
// @route   GET /api/admin/analytics/occupancy
exports.getOccupancyAnalytics = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments({ isAvailable: true });
    
    // Get bookings for the next 30 days
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(next30Days.getDate() + 30);

    const bookings = await Booking.find({
      status: { $in: ['confirmed'] },
      checkIn: { $lte: next30Days },
      checkOut: { $gte: today }
    });

    // Calculate daily occupancy
    const occupancyData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const occupiedRooms = bookings.filter(b => 
        b.checkIn < nextDate && b.checkOut > date
      ).length;

      occupancyData.push({
        date: date.toISOString().split('T')[0],
        occupiedRooms,
        totalRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
      });
    }

    res.json({
      success: true,
      occupancy: occupancyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
