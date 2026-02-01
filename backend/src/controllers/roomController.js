const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get all rooms
// @route   GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const { type, area, minPrice, maxPrice, guests, checkIn, checkOut } = req.query;
    
    // Build filter
    const filter = { isAvailable: true };
    
    if (type) filter.type = type;
    if (area) filter['location.area'] = area;
    if (guests) filter.maxGuests = { $gte: parseInt(guests) };
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = parseInt(maxPrice);
    }

    let rooms = await Room.find(filter).sort({ pricePerNight: 1 });

    // If date range provided, filter out booked rooms
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      const bookedRoomIds = await Booking.find({
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
          { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
          { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
        ]
      }).distinct('room');

      rooms = rooms.filter(room => 
        !bookedRoomIds.some(id => id.toString() === room._id.toString())
      );
    }

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check room availability for dates
// @route   GET /api/rooms/:id/availability
exports.checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide check-in and check-out dates'
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      room: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
      ]
    });

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.pricePerNight;

    res.json({
      success: true,
      available: !existingBooking,
      room: {
        id: room._id,
        name: room.name,
        pricePerNight: room.pricePerNight
      },
      nights,
      totalPrice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create room (Admin only)
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    
    res.status(201).json({
      success: true,
      room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update room (Admin only)
// @route   PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete room (Admin only)
// @route   DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get room types summary
// @route   GET /api/rooms/types
exports.getRoomTypes = async (req, res) => {
  try {
    const types = await Room.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          minPrice: { $min: '$pricePerNight' },
          maxPrice: { $max: '$pricePerNight' }
        }
      },
      { $sort: { minPrice: 1 } }
    ]);

    res.json({
      success: true,
      types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
