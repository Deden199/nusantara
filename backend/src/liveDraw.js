const { getIO } = require('./io');
const { emitLiveMeta } = require('./controllers/lottery.controller');

async function startLiveDraw(city) {
  try {
    const io = getIO();
    io.to(city).emit('live-draw-start', { city });
    await emitLiveMeta(city);
    console.log(`Live draw started for ${city}`);
  } catch (err) {
    console.error('[startLiveDraw] Failed to emit live draw start:', err);
  }
}

module.exports = { startLiveDraw };
