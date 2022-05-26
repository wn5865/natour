import axios from 'axios';
import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51KyWrGI5Q33gynFj06zlwb1Euw7k6CH6FJHaNhV676QaWBi5Bdyxt5mRIckirkL9pSuH07vhwuk2QFDlopRFGYEq00xrMtzdop'
);

export const bookTour = async (dateId, tourId) => {
  try {
    // create checkout session and redirect using API
    await axios.get(`/api/v1/bookings/checkout/${dateId}`);
  } catch (err) {
    showAlert('error', err.message);
  }
};
