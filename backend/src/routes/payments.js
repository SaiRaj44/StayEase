const express = require('express');
const router = express.Router();
const { getKeyId } = require('../services/payment');

// @desc    Get Razorpay key
// @route   GET /api/payments/key
router.get('/key', (req, res) => {
  res.json({
    success: true,
    key: getKeyId()
  });
});

module.exports = router;
