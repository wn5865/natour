import axios from 'axios';
import { showAlert } from './alerts';

export const writeReview = async (data) => {
  try {
    if (!Number(data.rating))
      return showAlert('error', 'Please rate this tour');

    // If the review already exists in DB, update. Else, create one
    let res = data.reviewId
      ? await axios.patch(`/api/v1/reviews/${data.reviewId}`, data)
      : await axios.post('/api/v1/reviews', data);

    if (res.data.status === 'success') {
      const message =
        'Your review has been ' + (res.status === 201 ? 'posted' : 'updated');
      showAlert('success', message);
      setTimeout(() => history.back(), 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteReview = async (data) => {
  try {
    let res = await axios.delete(`/api/v1/reviews/${data.reviewId}`);
    if (res.status === 204) {
      const message = 'Your review has been deleted';
      showAlert('success', message);
      setTimeout(() => history.back(), 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
