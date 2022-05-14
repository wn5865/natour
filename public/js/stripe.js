import axios from 'axios';
import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51KyWrGI5Q33gynFj06zlwb1Euw7k6CH6FJHaNhV676QaWBi5Bdyxt5mRIckirkL9pSuH07vhwuk2QFDlopRFGYEq00xrMtzdop'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form & charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err.message);
  }
};
