// Track active live draws per city.
// Each entry maps a city to its current state:
// { prize: <current prize key>, digits: { first: [], second: [], third: [] } }
const activeLiveDraws = new Map();

module.exports = { activeLiveDraws };
