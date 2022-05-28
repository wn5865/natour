const express = require('express');
const bookingController = require('../controllers/bookingController.js');
const authController = require('../controllers/authController.js');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get(
  '/create-checkout-session/:tourId/:dateId',
  bookingController.getCheckoutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  // Post method can get requests from user and tour router e.g.
  // /user/:userId/bookings or /tour/:tourId/bookings
  .post(bookingController.setTourUserPrice, bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
