import axios from 'axios';
import { showAlert } from './alerts';

export const createTour = async (data) => {
  try {
    const res = await axios.post(`/api/v1/tours`, data);
    if (res.data.status === 'success') {
      showAlert('success', 'Tour created');
      setTimeout(() => (location.href = '/manage-tours'), 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateTour = async (data) => {
  try {
    const id = data._id;
    delete data._id;

    const res = await axios.patch(`/api/v1/tours/${id}`, data);
    if (res.data.status === 'success') {
      showAlert('success', 'Tour updated');
      setTimeout(() => (location.href = '/manage-tours'), 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteTour = async (data) => {
  let response = confirm('Are you sure you want to delete this tour?');
  if (!response) return;

  try {
    const id = data._id;

    const res = await axios.delete(`/api/v1/tours/${id}`);
    if (res.status === 204) {
      showAlert('success', 'Tour deleted');
      setTimeout(() => (location.href = '/manage-tours'), 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
