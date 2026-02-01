const express = require('express');
const router = express.Router();
const {
  chat,
  checkAvailability,
  clearHistory
} = require('../controllers/chatbotController');

// Public routes - chatbot is available to all users
router.post('/chat', chat);
router.post('/check-availability', checkAvailability);
router.delete('/history/:sessionId', clearHistory);

module.exports = router;
