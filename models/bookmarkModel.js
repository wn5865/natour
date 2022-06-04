const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'A bookmark must belong to a user'],
  },
  tour: {
    type: mongoose.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'A bookmark must belong to a tour'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
