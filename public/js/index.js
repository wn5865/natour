import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login, signup, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe';
import { showAlert } from './alerts.js';
import { writeReview, deleteReview } from './review';
import { handleForm } from './formHandler.js';
import { bookmark } from './bookmark';
import { createTour, updateTour, deleteTour } from './tour';

const alertMessage = document.querySelector('body').dataset.alert;
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login-form > .form');
const signupForm = document.querySelector('#signup-form > .form');
const reviewForm = document.querySelector('.review__content > .form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const dateOption = document.getElementById('date');
const bookmarkBtn = document.getElementById('btn-bookmark');
const tourForm = document.querySelector('#tour-form > .form');

if (tourForm) {
  const submitTourBtn = document.getElementById('submit-btn');
  const updateTourBtn = document.getElementById('update-btn');
  const deleteTourBtn = document.getElementById('delete-btn');

  // Implement submit, update and delete tour
  if (submitTourBtn)
    tourForm.addEventListener('submit', (e) => createTour(handleForm(e)));
  if (updateTourBtn) {
    tourForm.addEventListener('submit', (e) => updateTour(handleForm(e)));
    deleteTourBtn.addEventListener('click', (e) => deleteTour(handleForm(e)));
  }
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (bookmarkBtn) {
  bookmarkBtn.addEventListener('click', () => bookmark(bookmarkBtn));
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => login(handleForm(e)));
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => signup(handleForm(e)));
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) =>
    updateSettings(handleForm(e), 'data')
  );
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    await updateSettings(handleForm(e), 'password');
    e.target.reset();
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
          star.classList.add('reviews__star--active');
          star.classList.remove('reviews__star--inactive');
        } else {
          star.classList.add('reviews__star--inactive');
          star.classList.remove('reviews__star--active');
        }
      });
    });
  });

  // Implement review submit
  reviewForm.addEventListener('submit', (e) => writeReview(handleForm(e)));

  // Implement review delete
  const deleteBtn = reviewForm.querySelector('.btn--delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => deleteReview(handleForm(e)));
  }
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

if (alertMessage) showAlert('success', alertMessage, 20);
