const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💣 Shutting down...');
  console.log(err.name, err.message, err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect to DB
mongoose.connect(DB).then(() => {
  console.log('DB connection sucessful!');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💣 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Todos
//  1) Implement restriction that users can only review a tour that they have
//  actually booked

// 2) Implement nested bookings routes: /tours/:id/bookings and
// /users/:id/bookings

// 3) Improve tour dates: add a participants and a soldOut fields to each date.
// A date then becomes like an instance of the tour. Then, when a user books,
// they need to select one of the dates.  A new booking will increase the number
// of participants in the date, until it is booked out.  (participants >
// maxGroupSize). So, when a user wants to book you need to check if tour on the
// selected date is still available

// 4) Implement advanced authentication features: confirm user email, keep users
// logged in with refresh tokens, two-factor authentication, etc..
