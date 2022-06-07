const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Bookmark = require('../models/bookmarkModel');
const { toDateString, addDateString } = require('../utils/date');

/**
 * Sets an alert message used in template engine
 */
exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert = `Your payment was successful!
      If your booking doesn't show up here immediately, please check your email for confirmation.`;
  }
  next();
};

/**
 * Gets all tours and render overview page
 */
exports.getOverview = catchAsync(async (req, res, next) => {
  // Get all tours
  const tours = await Tour.find();

  // Convert a date to string, and add it as a field
  addDateString(tours);

  // Render tours
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

/**
 * Gets bookmarks and render them
 */
exports.getMyBookmarks = catchAsync(async (req, res, next) => {
  // Get bookmarks first and get tours from them
  const tours = (
    await Bookmark.find({ user: req.user._id }).populate('tour')
  ).map((bookmark) => bookmark.tour);

  // Convert a date to string, and add it as a field
  addDateString(tours);

  // Render tours
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

/**
 * Gets all bookings of current user and render 'My Bookings' page
 */
exports.getMyBookings = catchAsync(async (req, res, next) => {
  // Get all bookings and then dates from bookings
  const bookings = await Booking.find({ user: req.user.id });
  const dateIDs = bookings.map((booking) => booking.date);

  // Find tours with the date IDs
  const tours = await Tour.aggregate([
    { $unwind: '$startDates' },
    { $match: { 'startDates._id': { $in: dateIDs } } },
  ]);

  // Convert a date to string, and add it as a field
  addDateString(tours);

  res.status(200).render('bookings', {
    title: 'My Tours',
    tours,
  });
});

/**
 * Gets a tour and render tour detail page
 */
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the tour
  let tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user createdAt',
    options: { sort: { createdAt: -1 } },
  });

  if (!tour) {
    const message = 'There is no tour with that name';
    return next(new AppError(message, 404));
  }

  let bookmark;
  // 2) If logged in,
  if (req.user) {
    const IDs = { tour: tour._id, user: req.user._id };

    // 2-1) remove tour dates that has been already booked or sold out
    const bookings = await Booking.find(IDs);
    const dateIDs = bookings.map((booking) => booking.date.toString());
    tour.startDates = tour.startDates
      .filter((date) => date.participants < tour.maxGroupSize)
      .filter((date) => !dateIDs.includes(date.id));

    // 2-2) check if this tour is bookmarked
    bookmark = await Bookmark.findOne(IDs);
  }

  // 3) Render tour details
  res.status(200).render('tour', {
    title: tour.name,
    tour,
    dates: tour.startDates.map(toDateString),
    bookmark,
  });
});

exports.getReviewForm = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const { tourId: tour, dateId: date } = req.params;
  const IDs = { user, tour, date };
  const review = (await Review.findOne(IDs)) || IDs;
  res.status(200).render('reviewForm', { title: 'Review', review });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up for Natours',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

// ADMINISTRATOR PAGES
exports.manageTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'Manage Tours',
    tours,
  });
});
