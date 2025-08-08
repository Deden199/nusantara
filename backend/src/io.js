let ioInstance;

function init(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log('Client connected', socket.id);
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
