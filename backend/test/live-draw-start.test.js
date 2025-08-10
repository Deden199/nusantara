const assert = require('node:assert');
const { test } = require('node:test');
const path = require('node:path');

const events = [];

// Stub modules before requiring startLiveDraw
require.cache[path.resolve(__dirname, '../src/io.js')] = {
  exports: {
    getIO: () => ({
      to: (room) => ({
        emit: (event, data) => {
          events.push({ room, event, data });
        },
      }),
    }),
  },
};

require.cache[path.resolve(__dirname, '../src/controllers/lottery.controller.js')] = {
  exports: {
    emitLiveMeta: async () => {},
  },
};

const { startLiveDraw } = require('../src/liveDraw.js');

test('emits live-draw-start only to specified city room', async () => {
  await startLiveDraw('jakarta');
  assert.deepStrictEqual(events, [
    { room: 'jakarta', event: 'live-draw-start', data: { city: 'jakarta' } },
  ]);
});
