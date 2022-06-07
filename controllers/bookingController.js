const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

/**
 * Middleware to check if the current user has actually booked a tour
 * This prevents a user from writing a review without booking.
 */
exports.checkIfBooked = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne(req.body);
  if (!booking) {
    const message = 'You must book a tour to write a review';
    return next(new AppError(message, 400));
  }
  next();
});

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get tour and tour date
  const { tourId, dateId } = req.params;
  const tour = await Tour.findById(tourId);
  const date = tour.startDates.find((date) => date.id === dateId);

  if (date.soldOut) {
    return next(new AppError('The tour has already been sold out', 404));
  }

  // 2) Create checkout session
  const domain = `${req.protocol}://${req.header('host')}`;
  const dateStr = new Date(date.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${domain}/my-bookings?alert=booking`,
    cancel_url: `${domain}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: Object.values(req.params).join('/'),
    line_items: [
      {
        name: `${tour.name} Tour (date: ${dateStr})`,
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

/**
 * Webhook to be automatically notified from Stripe that a checkout has been
 * completed, and then create a booking
 */
exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const signature = req.header('stripe-signature');
  let event;

  // Validate a session
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  const session = event.data.object;
  const user = await User.findOne({ email: session.customer_email });
  const email = new Email(user, '');

  try {
    // fulfill the order
    await fulfillOrder(session, user);
  } catch (err) {
    // if an error occurred, then refund the payment
    await stripe.refunds.create({ payment_intent: session.payment_intent });

    // and notify the user by email that his booking failed
    email.sendBookingFail();

    // respond with error message
    return res.status(400).send(`Booking failed: ${err.message}`);
  }

  // send an email that the tour has been successfully booked
  email.sendBookingSuccess();

  res.status(200).json({ received: true });
});

const fulfillOrder = async (session, user) => {
  const [tourId, dateId] = session.client_reference_id.split('/');
  const tour = await Tour.findById(tourId);
  const date = tour.startDates.find((date) => date.id === dateId);

  // If sold out, throw an error
  if (date.soldOut) {
    throw new AppError(
      'The tour that starts on the date has already been sold out. Please try another date.',
      400
    );
  }

  // If not, increment the number of participants and save the tour info
  date.soldOut = ++date.participants === tour.maxGroupSize;
  await tour.save();

  const price = session.amount_total / 100;
  await Booking.create({ tour: tourId, date: dateId, user: user.id, price });
};
