const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

/**
 * Checks if the current user has actually booked a tour.
 * Prevents a user from writing reviews without booking.
 */
exports.checkIfBooked = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({
    user: req.body.user,
    tour: req.body.tour,
  });
  if (!booking) {
    return next(new AppError('You must book a tour to write a review', 400));
  }
  next();
});

/**
 * Middleware to set tour ID, user ID, and price before creating a booking
 */
exports.setTourUserPrice = catchAsync(async (req, res, next) => {
  // Set tour ID
  if (!req.body.tour) {
    if (!req.params.tourId)
      return next(
        new AppError(
          'Tour ID must be specified as a parameter or in the body',
          400
        )
      );
    req.body.tour = req.params.tourId;
  }

  // Set user ID
  if (!req.body.user) {
    if (!req.params.userId)
      return next(
        new AppError(
          'User ID must be specified as a parameter or in the body',
          400
        )
      );
    req.body.user = req.params.userId;
  }

  // Set price
  if (!req.body.price) {
    const tour = await Tour.findById(req.body.tour);
    if (!tour) {
      return next(new AppError('Tour ID is invalid', 400));
    }
    req.body.price = tour.price;
  }
  next();
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get tour and tour date
  const { tourId, dateId } = req.params;
  const tour = await Tour.findById(tourId);
  const date = tour.startDates.find((date) => date.id === dateId);

  // 2) Create checkout session
  const domain = `${req.protocol}://${req.header('host')}`;
  const dateStr = new Date(date.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${domain}/my-tours?alert=booking`,
    cancel_url: `${domain}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: Object.values(req.params).join('/'),
    line_items: [
      {
        name: `${tour.name} Tour (Date: ${dateStr})`,
        description: tour.summary,
        images: [`${domain}/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const signature = req.header('stripe-signature');
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // case that session verification fails
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await fulfillOrder(event.data.object);
  }
  res.status(200).json({ received: true });
});

const fulfillOrder = async (session) => {
  const [tourId, dateId] = session.client_reference_id.split('/');
  const tour = await Tour.findById(tourId);
  const date = tour.startDates.find((date) => date.id === dateId);

  // Increment the number of participants
  if (date.soldOut) {
    throw AppError(
      'The tour date has already been sold out. Please try another date'
    );
  } else {
    ++date.participants;
    if (date.participants === tour.maxGroupSize) {
      date.soldOut = true;
    }
  }
  await tour.save();

  const user = await User.findOne({ email: session.customer_email });
  const price = session.amount_total / 100;
  await Booking.create({ tour: tour.id, user: user.id, price });
};
