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

  // Add date as a string to use in the template
  tours.forEach((tour) => {
    const date = tour.startDates[0].date;
    const dateStr = new Date(date).toLocaleString('en-us', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    tour.dateStr = dateStr;
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
  const bookings = await Booking.find({ user: req.user.id });

  // Get tours and date IDs
  const tours = bookings.map((el) => el.tour);
  const dateIDs = bookings.map((el) => el.date);

  // Loop through the array to transform a date to string
  for (let i = 0; i < tours.length; ++i) {
    const tour = tours[i];
    const dateId = dateIDs[i];
    const date = tour.startDates.find((startDate) => startDate.id === dateId);
    const dateStr = new Date(date.date).toLocaleString('en-us', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    tour.dateStr = dateStr;
  }

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
