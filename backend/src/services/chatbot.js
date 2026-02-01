const OpenAI = require('openai');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Initialize OpenAI (will fail gracefully if key not set)
let openai = null;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
} catch (error) {
  console.log('OpenAI not configured:', error.message);
}

// System prompt for the hotel chatbot
const systemPrompt = `You are a helpful AI assistant for StayEase, a hotel booking service in Tirupati, India. 
You help guests with:
1. Room information and pricing
2. Availability checking
3. Booking assistance
4. Tirupati travel information (temples, darshan timings, local attractions)
5. Hotel policies and amenities

Key Information:
- Hotel is located in Tirupati, near the famous Tirumala Venkateswara Temple
- We offer Standard, Deluxe, Suite, and Premium rooms
- Check-in: 12:00 PM, Check-out: 11:00 AM
- Free cancellation up to 24 hours before check-in
- Temple darshan assistance available

Be friendly, concise, and helpful. If you don't know something specific about current availability or pricing, suggest the user check the website or contact reception.

You can respond in English or Telugu based on the user's language preference.`;

// Get room information for context
const getRoomContext = async () => {
  try {
    const rooms = await Room.find({ isAvailable: true }).select('name type pricePerNight maxGuests amenities location');
    if (rooms.length === 0) {
      return 'No rooms currently available in the system.';
    }
    
    return rooms.map(r => 
      `- ${r.name} (${r.type}): ₹${r.pricePerNight}/night, ${r.maxGuests} guests, Location: ${r.location.area}`
    ).join('\n');
  } catch (error) {
    return 'Unable to fetch room information.';
  }
};

// Chat with the AI
exports.chat = async (message, language = 'en', conversationHistory = []) => {
  // Fallback responses if OpenAI is not configured
  if (!openai) {
    return getFallbackResponse(message, language);
  }
  
  try {
    const roomContext = await getRoomContext();
    
    const messages = [
      { role: 'system', content: systemPrompt + `\n\nCurrent Available Rooms:\n${roomContext}` },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7
    });
    
    return {
      success: true,
      message: response.choices[0].message.content,
      language
    };
  } catch (error) {
    console.error('OpenAI Error:', error.message);
    return getFallbackResponse(message, language);
  }
};

// Fallback responses when OpenAI is not available
const getFallbackResponse = (message, language) => {
  const lowerMessage = message.toLowerCase();
  
  const responses = {
    en: {
      greeting: "Hello! Welcome to StayEase Tirupati. How can I help you today? You can ask about rooms, pricing, or Tirupati travel information.",
      rooms: "We offer Standard, Deluxe, Suite, and Premium rooms. Please check our Rooms page for current availability and pricing.",
      booking: "To book a room, please select your dates and room type on our website, then proceed to checkout. Need help with anything specific?",
      tirupati: "Tirupati is home to the famous Tirumala Venkateswara Temple. Darshan timings vary based on the type of ticket. We can help arrange your temple visit!",
      default: "Thank you for your message. For detailed assistance, please check our website or contact our reception. Is there anything specific I can help with?"
    },
    te: {
      greeting: "నమస్కారం! StayEase తిరుపతికి స్వాగతం. మీకు ఎలా సహాయం చేయగలను?",
      rooms: "మేము స్టాండర్డ్, డీలక్స్, సూట్ మరియు ప్రీమియం గదులను అందిస్తున్నాము. దయచేసి మా గదుల పేజీని చూడండి.",
      booking: "గది బుక్ చేయడానికి, దయచేసి మా వెబ్‌సైట్‌లో మీ తేదీలు మరియు గది రకాన్ని ఎంచుకోండి.",
      tirupati: "తిరుపతి ప్రసిద్ధ తిరుమల వెంకటేశ్వర దేవాలయానికి నిలయం. మేము మీ దేవాలయ సందర్శనను ఏర్పాటు చేయడంలో సహాయపడగలము!",
      default: "మీ సందేశానికి ధన్యవాదాలు. వివరమైన సహాయం కోసం, దయచేసి మా రిసెప్షన్‌ను సంప్రదించండి."
    }
  };
  
  const lang = language === 'te' ? 'te' : 'en';
  const r = responses[lang];
  
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('namaste')) {
    return { success: true, message: r.greeting, language: lang };
  }
  if (lowerMessage.includes('room') || lowerMessage.includes('గది')) {
    return { success: true, message: r.rooms, language: lang };
  }
  if (lowerMessage.includes('book') || lowerMessage.includes('బుక్')) {
    return { success: true, message: r.booking, language: lang };
  }
  if (lowerMessage.includes('tirupati') || lowerMessage.includes('temple') || lowerMessage.includes('darshan') || lowerMessage.includes('తిరుపతి')) {
    return { success: true, message: r.tirupati, language: lang };
  }
  
  return { success: true, message: r.default, language: lang };
};

// Check room availability via chatbot
exports.checkAvailability = async (checkIn, checkOut, roomType) => {
  try {
    const rooms = await Room.find({
      isAvailable: true,
      type: roomType || { $exists: true }
    });
    
    // Check bookings that overlap with requested dates
    const bookedRoomIds = await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOut, $gte: checkIn } },
        { checkOut: { $gt: checkIn, $lte: checkOut } },
        { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
      ]
    }).distinct('room');
    
    const availableRooms = rooms.filter(room => 
      !bookedRoomIds.some(id => id.toString() === room._id.toString())
    );
    
    return {
      success: true,
      available: availableRooms.length > 0,
      rooms: availableRooms,
      count: availableRooms.length
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unable to check availability'
    };
  }
};
