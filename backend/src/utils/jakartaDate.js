function jakartaDate(input) {
  if (!input) {
    return new Date();
  }
  const [datePart, timePart] = (input || '').split('T');
  if (!datePart || !timePart) return new Date();
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
}

module.exports = { jakartaDate };
