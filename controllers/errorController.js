const AppError = require('../utils/appError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { message: err.message, ...err };
  const env = process.env.NODE_ENV;

  if (env === 'development') {
    sendErrorDev(err, req, res);
  } else if (env === 'production') {
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};

// Handler for cast error from DB
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handler for duplicate field erros from DB
const handleDuplicateFieldsDB = (err) => {
  const fields = Object.keys(err.keyValue);
  let message;
  if (fields.length === 1 && fields[0] === 'email') {
    message = 'A user with that email address already exists.';
  } else {
    message = `Duplicate field value: "${fields}". Please use another value`;
  }
  return new AppError(message, 400);
};

// Handler for validation errors from DB
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handler for JWT error
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

// Handler for expired JWT
const handleJWTExpiredError = () =>
  new AppError('Token has already expired. Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) Rendered website
  console.error('ERROR 💥', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      // 1) Log error
      console.log('production error: ', err);

      // 2) Send error message
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic mesage
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // A) Rendered Website
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message,
    });
  }

  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);

  // 2) Send generic mesage
  res.status(500).render('error', {
    title: 'Something went wrong',
    message: 'Please try again later',
  });
};
