const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewsController.alerts);
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour-detail/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

router.use(authController.protect);

router.get('/me', viewsController.getAccount);
router.get('/my-bookmarks', viewsController.getMyBookmarks);
router.get('/my-bookings', viewsController.getMyBookings);
router.get('/review/:tourId/:dateId', viewsController.getReviewForm);

router.use(authController.restrictTo('admin'));

router.get('/manage-tours', viewsController.manageTours);
router.get('/tour', viewsController.getTourForm);
router.get('/tour/:tourId', viewsController.getTourForm);
// router.get('/manage-tours/:tourId', viewsController.getTourForm);
// router.get('manage-users', viewsController.manageUsers);
// router.get('manage-reviews', viewsController.manageReviews);
// router.get('manage-bookings', viewsController.manageBookings);

module.exports = router;
