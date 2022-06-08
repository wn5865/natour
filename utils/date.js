// Converts date (e.g. 2021-04-25T09:00:00.000Z) to user-friendly string
exports.toDateString = (date) => {
  return new Date(date).toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Adds next available date as a string to tour
exports.addDateString = (tours, type = 'overview') => {
  tours.forEach((tour) => {
    if (type === 'booking') {
      tour.dateStr = exports.toDateString(tour.startDates.date);
    } else {
      tour.dateStr = '-';
      for (let date of tour.startDates) {
        if (date.participants < tour.maxGroupSize) {
          tour.dateStr = exports.toDateString(date.date);
          break;
        }
      }
    }
  });
};
