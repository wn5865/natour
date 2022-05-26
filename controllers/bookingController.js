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

exports.checkout = catchAsync(async (req, res, next) => {
  // 1) Get the current tour
  const tour = await Tour.findOne({ 'startDates._id': req.params.dateId });
  if (!tour) return next(new AppError('Invalid start date', 400));

  const date = tour.startDates.find((date) => date.id === req.params.dateId);
  const dateStr = new Date(date.date).toLocaleDateString('en-US');

  // 2) Create checkout session
  const domain = `${req.protocol}://${req.header('host')}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${domain}/my-tours?alert=booking`,
    cancel_url: `${domain}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.dateId,
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

  // 3) Redirect to checkout page
  stripe.redirectToCheckout({
    sessionId: session.id,
  });
});

exports.webhookCheckout = async (req, res, next) => {
  try {
    const payload = req.body;
    const signature = req.header('stripe-signature');
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      await createBookingCheckout(event.data.object);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
};

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};
