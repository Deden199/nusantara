const { getIO } = require('./io');

async function startLiveDraw(city) {
  try {
    const io = getIO();
    io.emit('live-draw-start', { city });
    console.log(`Live draw started for ${city}`);
  } catch (err) {
    console.error('[startLiveDraw] Failed to emit live draw start:', err);
  }
}

module.exports = { startLiveDraw };
