const express = require('express');
const bookingRouter = express.Router();

const bookingController = require('../Controllers/bookingController');
const isAuth = require('../middleware/isAuth');
const Home = require('../modules/Home');

/**
 * STEP 3: Booking success page (STATIC ROUTE FIRST)
 */
bookingRouter.get(
  '/booking/success',
  isAuth,
  bookingController.getBookingSuccess
);

/**
 * STEP 1: Show booking / payment page (DYNAMIC ROUTE AFTER)
 */
bookingRouter.get(
  '/booking/:homeId',
  isAuth,
  async (req, res) => {
    try {
      const home = await Home.findById(req.params.homeId);

      if (!home) {
        return res.redirect('/');
      }

      res.render('store/booking', {
        home,
        pageTitle: 'Confirm Booking',
        isLoggedIN: req.session.isLoggedIN,
        user: req.session.user,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (err) {
      console.error('BOOKING PAGE ERROR:', err);
      res.redirect('/');
    }
  }
);

/**
 * STEP 2: Save booking
 */
bookingRouter.post(
  '/book/:homeId',
  isAuth,
  bookingController.postBookHome
);

module.exports = bookingRouter;
