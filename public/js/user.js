import axios from 'axios';
import { showAlert } from './alerts';

export const createUser = async (data) => {
  try {
    const res = await axios.post(`/api/v1/users`, data);
    if (res.data.status === 'success') {
      showAlert('success', 'User created');
      setTimeout(() => history.back(), 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateUser = async (data) => {
  try {
    const id = data._id;

    const res = await axios.patch(`/api/v1/users/${id}`, data);
    if (res.data.status === 'success') {
      showAlert('success', 'User updated');
      setTimeout(() => history.back(), 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteUser = async (data) => {
  try {
    const id = data._id;

    const res = await axios.patch(`/api/v1/users/${id}`, { active: false });
    if (res.status === 200) {
      showAlert('success', 'User deactivated');
      setTimeout(() => history.back(), 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
