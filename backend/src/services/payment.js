const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay (will fail gracefully if keys not set)
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
} catch (error) {
  console.log('Razorpay not configured:', error.message);
}

// Create Razorpay Order
exports.createOrder = async (amount, currency = 'INR', receipt) => {
  if (!razorpay) {
    // Mock order for development
    return {
      id: 'order_mock_' + Date.now(),
      amount: amount * 100,
      currency,
      receipt,
      status: 'created'
    };
  }
  
  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`
  };
  
  const order = await razorpay.orders.create(options);
  return order;
};

// Verify Payment Signature
exports.verifyPayment = (orderId, paymentId, signature) => {
  if (!razorpay) {
    // Mock verification for development - always return true
    return true;
  }
  
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  
  return expectedSignature === signature;
};

// Initiate Refund
exports.initiateRefund = async (paymentId, amount) => {
  if (!razorpay) {
    // Mock refund for development
    return {
      id: 'rfnd_mock_' + Date.now(),
      payment_id: paymentId,
      amount: amount * 100,
      status: 'processed'
    };
  }
  
  const refund = await razorpay.payments.refund(paymentId, {
    amount: amount * 100
  });
  return refund;
};

// Get Razorpay Key for frontend
exports.getKeyId = () => {
  return process.env.RAZORPAY_KEY_ID || 'rzp_test_mock';
};
