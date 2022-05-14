import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe';
import { showAlert } from './alerts.js';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form > .form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const form = new FormData(this);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'SAVE password';
    this.reset();
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', function (e) {
    this.textContent = 'Processing...';
    const { tourId } = this.dataset;
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alert) showAlert('success', alertMessage, 20);
