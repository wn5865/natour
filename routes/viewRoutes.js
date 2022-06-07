const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewsController.alerts);
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

router.use(authController.protect);

router.get('/me', viewsController.getAccount);
router.get('/bookmarks', viewsController.getBookmarks);
router.get('/my-tours', viewsController.getMyTours);
router.get('/review/:tourId/:dateId', viewsController.getReviewForm);

module.exports = router;
