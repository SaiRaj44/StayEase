const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoom,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomTypes
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getRooms);
router.get('/types', getRoomTypes);
router.get('/:id', getRoom);
router.get('/:id/availability', checkAvailability);

// Admin routes
router.post('/', protect, adminOnly, createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;
