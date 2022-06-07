const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Bookmark = require('../models/bookmarkModel');

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
  const tours = await Tour.find();
  const dates = tours.map((tour) => tour.datesToString()[0].date);

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
    dates,
  });
});

/**
 * Gets bookmarks and render them
 */
exports.getBookmarks = catchAsync(async (req, res, next) => {
  const bookmarks = await Bookmark.find({ user: req.user._id }).populate(
    'tour'
  );
  const tours = bookmarks.map((bookmark) => bookmark.tour);
  const dates = tours.map((tour) => tour.datesToString()[0].date);

  res.status(200).render('overview', {
    title: 'Bookmarks',
    tours,
    dates,
  });
});

/**
 * Gets a tour and render tour detail page
 */
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the tour
  let tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    const message = 'There is no tour with that name';
    return next(new AppError(message, 404));
  }

  let bookmark;
  if (req.user) {
    // 2) If logged in,
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

  const dates = tour.datesToString();
  res.status(200).render('tour', {
    title: tour.name,
    tour,
    dates,
    bookmark,
  });
});

/**
 * Gets all bookings of current user and render 'My Bookings' page
 */
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

  res.status(200).render('bookings', {
    title: 'My Tours',
    tours,
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
