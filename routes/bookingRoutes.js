const express = require('express');
const bookingController = require('../controllers/bookingController.js');
const authController = require('../controllers/authController.js');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/checkout/:dateId', bookingController.checkout);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.setTourUserPrice, bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
