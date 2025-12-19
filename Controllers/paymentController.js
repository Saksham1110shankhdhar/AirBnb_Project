const razorpay = require('../utils/razorpay');

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // ₹ → paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now()
    };

    const order = await razorpay.orders.create(options);
    res.json(order);

  } catch (err) {
    res.status(500).json({ error: 'Payment failed' });
  }
};
