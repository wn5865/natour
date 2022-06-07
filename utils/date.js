// Converts date (e.g. 2021-04-25T09:00:00.000Z) to user-friendly string
exports.toDateString = (date) => {
  return new Date(date).toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Adds date string as a field of a tour
exports.addDateString = (tours) => {
  tours.forEach((tour) => {
    const startDates = tour.startDates;
    const targetDate = Array.isArray(startDates) ? startDates[0] : startDates;
    tour.dateStr = exports.toDateString(targetDate.date);
  });
};
