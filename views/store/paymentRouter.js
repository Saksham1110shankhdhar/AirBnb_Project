const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: 'INR'
    });

    res.json(order);
  } catch (err) {
    console.error('RAZORPAY ERROR:', err);
    res.status(500).json({ error: 'Payment failed' });
  }
});

module.exports = router;
