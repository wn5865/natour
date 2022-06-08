const express = require('express');
const bookingController = require('../controllers/bookingController.js');
const authController = require('../controllers/authController.js');
const factory = require('../controllers/handlerFactory');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get(
  '/create-checkout-session/:tourId/:dateId',
  bookingController.createCheckoutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .all(factory.setTourAndUser)
  .get(bookingController.getAllBookings)
  .post(factory.setCurrentUser, bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
