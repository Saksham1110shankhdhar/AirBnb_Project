const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

// Create Razorpay instance lazily to ensure env vars are loaded
function getRazorpayInstance(keyId, keySecret) {
  // Trim whitespace from credentials (common issue in .env files)
  const trimmedKeyId = (keyId || '').trim();
  const trimmedKeySecret = (keySecret || '').trim();
  
  if (!trimmedKeyId || !trimmedKeySecret) {
    throw new Error('Razorpay credentials not configured');
  }
  
  // Validate key format
  if (!trimmedKeyId.startsWith('rzp_')) {
    throw new Error('Invalid Razorpay Key ID format. Should start with "rzp_"');
  }
  
  if (trimmedKeySecret.length < 20) {
    throw new Error('Invalid Razorpay Key Secret format');
  }
  
  return new Razorpay({
    key_id: trimmedKeyId,
    key_secret: trimmedKeySecret
  });
}

router.post('/create-order', async (req, res) => {
  try {
    // Get and trim credentials (remove any whitespace)
    let keyId = process.env.RAZORPAY_KEY_ID;
    let keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    // Trim whitespace (common issue in .env files)
    if (keyId) keyId = keyId.trim();
    if (keySecret) keySecret = keySecret.trim();
    
    // Debug logging (without exposing full secrets)
    console.log('🔍 Checking Razorpay credentials...');
    console.log('   Key ID present:', !!keyId, keyId ? `(${keyId.substring(0, 12)}...)` : 'MISSING');
    console.log('   Key ID length:', keyId ? keyId.length : 0);
    console.log('   Key Secret present:', !!keySecret, keySecret ? `(${keySecret.substring(0, 8)}...)` : 'MISSING');
    console.log('   Key Secret length:', keySecret ? keySecret.length : 0);
    console.log('   Current NODE_ENV:', process.env.NODE_ENV || 'production');
    const envFile = `.env.${process.env.NODE_ENV || 'production'}`;
    console.log('   Expected .env file:', envFile);
    
    if (!keyId || !keySecret) {
      console.error('❌ Razorpay credentials missing in environment variables');
      console.error('   Looking for: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
      console.error('   Please check your .env file');
      return res.status(500).json({ 
        error: 'Payment gateway configuration error. Please contact support.' 
      });
    }
    
    // Validate key format
    if (!keyId.startsWith('rzp_')) {
      console.error('❌ Invalid Key ID format. Should start with "rzp_"');
      console.error('   Your Key ID starts with:', keyId.substring(0, 5));
      return res.status(500).json({ 
        error: 'Invalid Razorpay Key ID format. Please check your credentials.' 
      });
    }
    
    if (keySecret.length < 20) {
      console.error('❌ Key Secret appears to be too short');
      return res.status(500).json({ 
        error: 'Invalid Razorpay Key Secret. Please check your credentials.' 
      });
    }
    
    // Create Razorpay instance with validated and trimmed credentials
    const razorpay = getRazorpayInstance(keyId, keySecret);

    console.log('REQ BODY:', req.body);

    const amount = req.body.amount;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Validate amount is a number
    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }

    console.log('💰 Creating Razorpay order for amount:', amountNum, 'INR');
    console.log('   Using Key ID:', keyId.substring(0, 12) + '...');
    
    // Ensure amount is at least 1 rupee (100 paise) for Razorpay
    const amountInPaise = Math.max(100, Math.round(amountNum * 100));
    console.log('   Amount in paise:', amountInPaise);

    const order = await razorpay.orders.create({
      amount: amountInPaise, // INR → paise (must be integer, minimum 100)
      currency: 'INR',
      receipt: 'receipt_' + Date.now()
    });

    console.log('✅ Order created successfully:', order.id);
    res.json(order);
  } catch (err) {
    console.error('❌ ORDER ERROR:', err);
    
    // Provide more specific error messages
    if (err.statusCode === 401) {
      console.error('🔐 Razorpay Authentication Failed (401)');
      console.error('   Key ID used:', keyId ? keyId.substring(0, 12) + '...' : 'N/A');
      console.error('   This usually means:');
      console.error('   1. RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET do not match (from different accounts)');
      console.error('   2. The keys are incorrect or have been regenerated');
      console.error('   3. The keys have been revoked or expired');
      console.error('   4. There are extra spaces, quotes, or special characters in your .env file');
      console.error('');
      console.error('   SOLUTION:');
      console.error('   1. Go to https://dashboard.razorpay.com/app/keys');
      console.error('   2. Make sure you copy BOTH Key ID and Key Secret from the SAME account');
      console.error('   3. In your .env.production file, ensure:');
      console.error('      RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx  (no spaces, no quotes)');
      console.error('      RAZORPAY_KEY_SECRET=your_secret_here    (no spaces, no quotes)');
      console.error('   4. Restart your server after updating the .env file');
      return res.status(500).json({ 
        error: 'Authentication failed. Please verify your Razorpay Key ID and Key Secret match in the Razorpay Dashboard.' 
      });
    }
    
    if (err.error && err.error.description) {
      return res.status(500).json({ 
        error: err.error.description || 'Order creation failed' 
      });
    }
    
    res.status(500).json({ 
      error: err.message || 'Order creation failed. Please try again.' 
    });
  }
});

module.exports = router;
