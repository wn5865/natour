const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');

/**
 * Middleware to set user and tour IDs
 */
exports.setTourUserIds = catchAsync(async (req, res, next) => {
  // Set user and tour IDs
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // Prevent user from writing reviews without booking
  const booking = await Booking.findOne({
    user: req.body.user,
    tour: req.body.tour,
  });
  if (!booking) {
    return next(new AppError('You must book a tour to write a review', 400));
  }

  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
