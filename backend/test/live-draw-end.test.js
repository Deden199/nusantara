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

test('emits live-draw-end immediately after results', async () => {
  await emitLiveMeta('jakarta', {}, true);
  assert(events.some((e) => e.event === 'liveMeta'));
  assert(events.some((e) => e.event === 'live-draw-end'));

  mock.timers.tick(10 * 60 * 1000);

  await Promise.resolve();

  // meta should be re-emitted after display period
  assert(events.filter((e) => e.event === 'liveMeta').length >= 2);
});
