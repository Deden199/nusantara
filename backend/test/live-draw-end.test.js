const assert = require('node:assert');
const { test, mock } = require('node:test');
const path = require('node:path');

const events = [];

// Stub modules before requiring controller
require.cache[path.resolve(__dirname, '../src/io.js')] = {
  exports: {
    getIO: () => ({
      to: () => ({
        emit: (event, data) => {
          events.push({ event, data });
        },
      }),
    }),
  },
};

require.cache[path.resolve(__dirname, '../src/config/database.js')] = {
  exports: {
    schedule: {
      findUnique: async () => ({}),
    },
  },
};

const { emitLiveMeta } = require('../src/controllers/lottery.controller.js');

mock.timers.enable({ apis: ['setTimeout'] });

test('emits live-draw-end after result expiration', async () => {
  await emitLiveMeta('jakarta', {});
  assert(events.some((e) => e.event === 'liveMeta'));

  mock.timers.tick(10 * 60 * 1000);

  assert(events.some((e) => e.event === 'live-draw-end'));
});
