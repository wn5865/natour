import axios from 'axios';
import { showAlert } from './alerts';

export const writeReview = async (form) => {
  try {
    const tourId = form.get('tourId');
    const res = await axios.post(`/api/v1/tours/${tourId}/reviews`, {
      review: form.get('review'),
      rating: form.get('rating'),
    });
    if (res.data.status === 'success')
      showAlert('success', 'Your review has been posted');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
