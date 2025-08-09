let ioInstance;
const { activeLiveDraws } = require('./liveDrawState');

function init(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log('Client connected', socket.id);
    // Allow clients to join a room based on city so we can emit
    // live draw events to the relevant audience only.
    socket.on('joinLive', (city) => {
      if (socket.currentRoom) socket.leave(socket.currentRoom);
      socket.join(city);
      socket.currentRoom = city;

      const state = activeLiveDraws.get(city);
      if (state) {
        socket.emit('liveState', state);
      }
    });

    socket.on('disconnect', () => console.log('Client disconnected', socket.id));
  });
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
}

module.exports = { init, getIO };
