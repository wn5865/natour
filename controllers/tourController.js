const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.findByIdAndSave(Tour);

/**
 * Middleware for retrieving top 5 tours when sorted by average
 * ratings(descending) and price(ascending)
 */
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/**
 * Calculates summary statistics of all tours grouped by 'difficulty'
 */
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

/**
 * Retrieves the number of tours grouped by the month of start dates in the
 * specified year
 */
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { month: 1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

/**
 * Retrieves tours within the specified distance from a point
 */
exports.getToursWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

/**
 * Calculates distances (in miles or kilometers) from a point to all tours
 */
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',').map(Number);
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        // geoNear must be the first pipeline
        near: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { distances },
  });
});

// Middlewares for handling multipart/form-data
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) return cb(null, true);
  cb(new AppError('Not an image. Please upload only images.', 400), false);
};
const upload = multer({ storage, fileFilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // Request must have both cover image and ordinary images
  if (!req.files || !req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  // Add cover image filename to request
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // Process the image
  await sharp(req.files.imageCover[0].buffer) // Retrieve image data
    .resize(2000, 1333)
    .toFormat('jpeg') // Force output to JPEG format
    .jpeg({ quality: 90 }) // Adjust the qualtiy (default === 80)
    .toFile(`public/img/tours/${req.body.imageCover}`); // Save as a file

  // 2) Images
  req.body.images = []; // array to which filenames are pushed
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(req.files.images[i].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});
