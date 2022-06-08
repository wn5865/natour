const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No document found with the ID', 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.findByIdAndSave = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1) Get a tour by ID
    const doc = await Tour.findById(req.params.id);
    if (!doc) return next(new AppError('No document found with the ID', 404));

    // 2) Update tour
    doc.set(req.body);
    await doc.save();

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with the ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError('No document found with the ID', 404));

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = { ...req.body };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // const doc = await features.query.explain();

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc },
    });
  });

/**
 * Middleware to set tour and user IDs
 * This contruct a request body from URL parameters when using nested
 * routes, e.g. tours/:tourId/bookings or users/:userId/bookings
 */
exports.setTourAndUser = (req, res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  if (req.params.userId) req.body.user = req.params.userId;
  next();
};

/**
 * Middleware to set req.body.user to current user in case that
 * no user info was given as URL params
 */
exports.setCurrentUser = (req, res, next) => {
  req.body.user ||= req.user;
  next();
};
