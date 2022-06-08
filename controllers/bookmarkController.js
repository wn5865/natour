const Bookmark = require('../models/bookmarkModel');
const factory = require('../controllers/handlerFactory');

exports.getBookmark = factory.getOne(Bookmark, ['tour', 'user']);
exports.getAllBookmarks = factory.getAll(Bookmark);
exports.createBookmark = factory.createOne(Bookmark);
exports.updateBookmark = factory.updateOne(Bookmark);
exports.deleteBookmark = factory.deleteOne(Bookmark);
