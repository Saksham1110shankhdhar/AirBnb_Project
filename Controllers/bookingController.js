const Booking = require('../modules/Booking');

/**
 * POST: Book a home
 */
exports.postBookHome = async (req, res) => {
  try {
    console.log('📝 Booking request received');
    console.log('   Session user:', req.session.user ? 'Present' : 'Missing');
    console.log('   Home ID:', req.params.homeId);
    
    // 🔐 Safety check
    if (!req.session.user || !req.session.user._id) {
      console.error('❌ User not authenticated');
      return res.status(401).json({ 
        error: 'Authentication required. Please login again.' 
      });
    }

    const homeId = req.params.homeId;
    const userId = req.session.user._id;

    if (!homeId) {
      console.error('❌ Home ID missing');
      return res.status(400).json({ 
        error: 'Home ID is required' 
      });
    }

    console.log('💾 Creating booking...');
    console.log('   Home:', homeId);
    console.log('   User:', userId);

    const booking = await Booking.create({
      home: homeId,
      user: userId
    });

    console.log('✅ Booking created successfully:', booking._id);

    // Return JSON response for AJAX requests
    res.status(200).json({ 
      success: true, 
      message: 'Booking confirmed successfully',
      bookingId: booking._id
    });

  } catch (err) {
    console.error('❌ BOOKING ERROR:', err);
    console.error('   Error details:', err.message);
    
    // Return JSON error response
    res.status(500).json({ 
      error: err.message || 'Booking failed. Please try again.' 
    });
  }
};


/**
 * GET: Booking success page
 */
exports.getBookingSuccess = (req, res) => {
  res.render('store/booking-success', {
    pageTitle: 'Booking Confirmed • Airbnb',
    isLoggedIN: req.session.isLoggedIN,
    user: req.session.user
  });
};
