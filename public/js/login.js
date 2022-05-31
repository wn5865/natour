import axios from 'axios';
import { showAlert } from './alerts.js';

export const login = async (form) => {
  try {
    const res = await axios.post('api/v1/users/login', {
      email: form.get('email'),
      password: form.get('password'),
    });

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

export const signup = async (form) => {
  try {
    const res = await axios.post('api/v1/users/signup', {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
      passwordConfirm: form.get('password-confirm'),
    });

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
