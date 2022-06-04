const Review = require('../models/reviewModel');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

exports.setTourAndUser = (req, res, next) => {
  req.body.tour ||= req.params.tourId;
  req.body.user = req.user.id;
  next();
};
