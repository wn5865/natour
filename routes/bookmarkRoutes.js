const express = require('express');
const authController = require('../controllers/authController');
const bookmarkController = require('../controllers/bookmarkController');
const factory = require('../controllers/handlerFactory');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .all(factory.setTourAndUser)
  .get(bookmarkController.getAllBookmarks)
  .post(bookmarkController.createBookmark);

router
  .route('/:id')
  .get(bookmarkController.getBookmark)
  .patch(bookmarkController.updateBookmark)
  .delete(bookmarkController.deleteBookmark);

module.exports = router;
