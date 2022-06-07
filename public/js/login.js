import axios from 'axios';
import { showAlert } from './alerts.js';

export const login = async (data) => {
  try {
    const res = await axios.post('api/v1/users/login', data);

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const signup = async (data) => {
  try {
    console.log(data);
    const res = await axios.post('api/v1/users/signup', data);

    if (res.data.status === 'success') {
      showAlert('success', 'Signed up successfully');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios('/api/v1/users/logout');
    if (res.data.status === 'success') location = '/';
  } catch (err) {
    showAlert('error', 'Error logging out. Try again');
  }
};
