const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookmarkRouter = require('./routes/bookmarkRoutes');
const bookingController = require('./controllers/bookingController');

const app = express();

// Heroku proxy configuration
app.enable('trust proxy');

// Set view engine and path to views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOGAL MIDDLEWARES
// Enable CORS and CORS pre-flight
app.use(cors());
app.options('*', cors());

// Compress responses
app.use(compression());

// Set HTTP headers for security
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [
        "'self'",
        'ws:',
        'https://*.mapbox.com/',
        'https://js.stripe.com/',
        'https://checkout.stripe.com/',
      ],
      scriptSrc: [
        "'self'",
        'blob:',
        'https://*.mapbox.com/',
        'https://js.stripe.com/',
        'https://cdn.jsdelivr.net',
      ],
    },
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 3600 * 1000,
  message: 'Too many requests from this IP. Pleaes try again in an hour',
});
app.use('/api', limiter); // against bruteforce and DOS attack

// Stripe Webhook (put here before body is parsed to JSON)
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/bookmark', bookmarkRouter);
app.use('/', viewRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
