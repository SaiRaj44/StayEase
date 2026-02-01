const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  sendOTPController,
  verifyOTPController,
  updateProfile,
  googleCallback
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('passport');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/send-otp', sendOTPController);
router.post('/verify-otp', verifyOTPController);
router.put('/profile', protect, updateProfile);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }), 
  googleCallback
);

module.exports = router;
