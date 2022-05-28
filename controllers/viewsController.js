const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert = `Your payment was successful!
      If your booking doesn't show up here immediately, please check your email for confirmation.`;
  }
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  // Add date as a field after transforming to string
  tours.forEach((tour) => {
    tour.dateStr = new Date(tour.startDates[0].date).toLocaleString('en-us', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Get all bookings from a user info
  const bookings = await Booking.find({ user: req.user.id });

  // Get tours and date IDs
  const dateIDs = bookings.map((el) => el.date);
  const tours = await Tour.aggregate([
    { $unwind: '$startDates' },
    { $match: { 'startDates._id': { $in: dateIDs } } },
  ]);

  // Loop through the array to transform a date to string
  tours.forEach((tour) => {
    tour.dateStr = new Date(tour.startDates.date).toLocaleString('en-us', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
