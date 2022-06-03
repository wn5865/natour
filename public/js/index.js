import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login, signup, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe';
import { showAlert } from './alerts.js';
import { writeReview } from './review';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form > .form');
const signupForm = document.querySelector('.signup-form > .form');
const reviewForm = document.querySelector('.review__content > .form');
const modalBox = document.querySelector('.modal');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const dateOption = document.getElementById('date');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    login(new FormData(this));
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    signup(new FormData(this));
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', function (e) {
    e.preventDefault();
    updateSettings(new FormData(this), 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const saveBtn = document.querySelector('.btn--save-password');
    saveBtn.textContent = 'Updating...';
    const form = new FormData(this);
    const currentPassword = form.get('password-current');
    const password = form.get('password');
    const passwordConfirm = form.get('password-confirm');

    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password'
    );
    saveBtn.textContent = 'SAVE password';
    this.reset();
  });
}

if (reviewForm) {
  const stars = reviewForm.querySelectorAll('[class^="reviews__star"');
  let rating = document.getElementById('rating');

  // Implement interactive color change of rating stars on click
  stars.forEach((star) => {
    const id = Number(star.dataset.id);
    star.addEventListener('click', () => {
      rating.value = id + 1;
      stars.forEach((star, i) => {
        if (i <= id) {
          star.classList.remove('reviews__star--inactive');
          star.classList.add('reviews__star--active');
        } else {
          star.classList.add('reviews__star--inactive');
          star.classList.remove('reviews__star--active');
        }
      });
    });
  });

  // Implement review submit
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const form = new FormData(this);

    if (!form.get('rating')) {
      return showAlert('error', 'Please rate this tour');
    }
    if (!form.get('review')) {
      return showAlert('error', 'Please write your review');
    }

    writeReview(form);

    setTimeout(() => {
      history.back();
    }, 3000);
  });
}

if (bookBtn && dateOption) {
  bookBtn.addEventListener('click', function (e) {
    const btnText = this.textContent;
    this.textContent = 'Processing...';

    const tourId = dateOption.dataset.tourId;
    const dateId = dateOption.value;
    if (!dateId) {
      this.textContent = btnText;
      return showAlert('error', 'Please select a start date');
    }
    bookTour(tourId, dateId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
