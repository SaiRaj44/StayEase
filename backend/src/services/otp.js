const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate OTP (6 digits)
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (Mock implementation - replace with actual SMS service)
exports.sendOTP = async (phone, otp) => {
  // In production, integrate with Twilio, MSG91, or similar service
  console.log(`[DEV] OTP for ${phone}: ${otp}`);
  
  // Mock: always return success in development
  return {
    success: true,
    message: 'OTP sent successfully'
  };
};

// Verify OTP
exports.verifyOTP = async (user, otp) => {
  if (!user.otp || !user.otp.code) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }
  
  if (new Date() > user.otp.expiresAt) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  if (user.otp.code !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  return { valid: true };
};
