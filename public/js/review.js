import axios from 'axios';
import { showAlert } from './alerts';

export const writeReview = async (form) => {
  try {
    let res;
    const update = {
      review: form.get('review'),
      rating: form.get('rating'),
    };

    if (form.has('reviewId')) {
      // if the review already exists in DB, update
      console.log('updated...');
      res = await axios.patch(
        `/api/v1/reviews/${form.get('reviewId')}`,
        update
      );
    } else {
      // else, create one
      const ids = {
        tour: form.get('tourId'),
        date: form.get('dateId'),
        user: form.get('userId'),
      };
      res = await axios.post('/api/v1/reviews', Object.assign(ids, update));
    }

    if (res.data.status === 'success') {
      const message =
        'Your review has been ' + (res.status === 201 ? 'posted' : 'updated');
      showAlert('success', message);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
