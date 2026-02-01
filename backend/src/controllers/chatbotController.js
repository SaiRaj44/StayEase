const chatbotService = require('../services/chatbot');

// Store conversation history in memory (use Redis in production)
const conversationHistory = new Map();

// @desc    Chat with AI assistant
// @route   POST /api/chatbot/chat
exports.chat = async (req, res) => {
  try {
    const { message, language = 'en', sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Get or create conversation history
    const history = conversationHistory.get(sessionId) || [];
    
    // Get AI response
    const response = await chatbotService.chat(message, language, history);

    // Update history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response.message });
    conversationHistory.set(sessionId, history.slice(-20)); // Keep last 20 messages

    res.json({
      success: true,
      message: response.message,
      language: response.language
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check availability via chatbot
// @route   POST /api/chatbot/check-availability
exports.checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, roomType } = req.body;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide check-in and check-out dates'
      });
    }

    const result = await chatbotService.checkAvailability(
      new Date(checkIn),
      new Date(checkOut),
      roomType
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear conversation history
// @route   DELETE /api/chatbot/history/:sessionId
exports.clearHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    conversationHistory.delete(sessionId);

    res.json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
