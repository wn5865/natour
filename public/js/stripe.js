import axios from 'axios';
import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51KyWrGI5Q33gynFj06zlwb1Euw7k6CH6FJHaNhV676QaWBi5Bdyxt5mRIckirkL9pSuH07vhwuk2QFDlopRFGYEq00xrMtzdop'
);

export const bookTour = async (tourId, dateId) => {
  try {
    // Create checkout session
    const response = await axios(
      `/api/v1/bookings/create-checkout-session/${tourId}/${dateId}`
    );

    // Redirect to checkout page provided by Stripe
    await stripe.redirectToCheckout({
      sessionId: response.data.session.id,
    });
  } catch (err) {
    showAlert('error', err.message);
  }
};
