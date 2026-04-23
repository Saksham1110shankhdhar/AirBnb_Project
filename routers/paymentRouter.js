const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../modules/Booking');
const Home = require('../modules/Home');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

function getTrimmedCredentials() {
  return {
    keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
  };
}

function getRazorpayInstance(keyId, keySecret) {
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }

  if (!keyId.startsWith('rzp_')) {
    throw new Error('Invalid Razorpay Key ID format. Should start with "rzp_"');
  }

  if (keySecret.length < 20) {
    throw new Error('Invalid Razorpay Key Secret format');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

router.post('/create-order', isAuth, async (req, res) => {
  const { keyId, keySecret } = getTrimmedCredentials();

  try {
    console.log('Checking Razorpay credentials...');
    console.log('   Key ID present:', !!keyId, keyId ? `(${keyId.substring(0, 12)}...)` : 'MISSING');
    console.log('   Key Secret present:', !!keySecret, keySecret ? `(${keySecret.substring(0, 8)}...)` : 'MISSING');

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: 'Payment gateway configuration error. Please contact support.'
      });
    }

    const razorpay = getRazorpayInstance(keyId, keySecret);
    const { homeId } = req.body;

    if (!homeId) {
      return res.status(400).json({ error: 'Home ID is required' });
    }

    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({ error: 'Selected home was not found' });
    }

    const amountNum = Number(home.price);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid home price' });
    }

    const amountInPaise = Math.max(100, Math.round(amountNum * 100));
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        homeId: String(home._id),
        userId: String(req.session.user._id)
      }
    });

    res.json(order);
  } catch (err) {
    console.error('ORDER ERROR:', err);

    if (err.statusCode === 401) {
      return res.status(500).json({
        error: 'Authentication failed. Please verify your Razorpay Key ID and Key Secret match in the Razorpay Dashboard.'
      });
    }

    if (err.error && err.error.description) {
      return res.status(500).json({
        error: err.error.description
      });
    }

    res.status(500).json({
      error: err.message || 'Order creation failed. Please try again.'
    });
  }
});

router.post('/verify-payment', isAuth, async (req, res) => {
  try {
    const {
      homeId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    } = req.body;

    if (!homeId || !orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment details. Please try again.'
      });
    }

    const { keyId, keySecret } = getTrimmedCredentials();
    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        error: 'Payment gateway configuration error. Please contact support.'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed. Please try again.'
      });
    }

    const razorpay = getRazorpayInstance(keyId, keySecret);
    const payment = await razorpay.payments.fetch(paymentId);

    if (!payment || payment.order_id !== orderId) {
      return res.status(400).json({
        success: false,
        error: 'Payment details do not match the order.'
      });
    }

    if (!['authorized', 'captured'].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        error: 'Payment was not completed successfully.'
      });
    }

    if (payment.currency !== 'INR') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected payment currency.'
      });
    }

    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).json({
        success: false,
        error: 'Selected home was not found'
      });
    }

    const expectedAmountInPaise = Math.max(100, Math.round(Number(home.price) * 100));
    if (payment.amount !== expectedAmountInPaise) {
      return res.status(400).json({
        success: false,
        error: 'Payment amount mismatch. Booking was not confirmed.'
      });
    }

    const currentUserId = String(req.session.user._id);
    const paymentNotesUserId = payment.notes && payment.notes.userId ? String(payment.notes.userId) : '';
    const paymentNotesHomeId = payment.notes && payment.notes.homeId ? String(payment.notes.homeId) : '';

    if (paymentNotesUserId && paymentNotesUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'This payment does not belong to the current user.'
      });
    }

    if (paymentNotesHomeId && paymentNotesHomeId !== String(homeId)) {
      return res.status(400).json({
        success: false,
        error: 'This payment is for a different booking.'
      });
    }

    const existingBooking = await Booking.findOne({
      home: homeId,
      user: req.session.user._id,
      paymentId
    });

    if (existingBooking) {
      return res.json({
        success: true,
        bookingId: existingBooking._id,
        redirectUrl: '/booking/success'
      });
    }

    const booking = await Booking.create({
      home: homeId,
      user: req.session.user._id,
      orderId,
      paymentId,
      paymentSignature: signature,
      paymentStatus: 'paid'
    });

    res.json({
      success: true,
      bookingId: booking._id,
      redirectUrl: '/booking/success'
    });
  } catch (err) {
    console.error('VERIFY PAYMENT ERROR:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Payment verification failed. Please try again.'
    });
  }
});

module.exports = router;
