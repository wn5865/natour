import axios from 'axios';
import { showAlert } from './alerts.js';

export const bookmark = async (btn) => {
  try {
    let res = btn.dataset.bookmark
      ? await axios.delete(`/api/v1/bookmarks/${btn.dataset.bookmark}`)
      : await axios.post(`/api/v1/bookmarks`, { tour: btn.dataset.tour });

    const icon = btn.querySelector('use');
    const text = btn.querySelector('span');

    if (res.status === 201) {
      text.textContent = 'bookmarked';
      icon.setAttribute('href', '/img/icons.svg#icon-bookmark-filled');
      btn.setAttribute('data-bookmark', res.data.data.data._id);
      showAlert('success', 'Bookmarked successfully');
    } else if (res.status === 204) {
      text.textContent = 'bookmark';
      icon.setAttribute('href', '/img/icons.svg#icon-bookmark');
      btn.removeAttribute('data-bookmark');
      showAlert('success', 'Bookmark removed');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
