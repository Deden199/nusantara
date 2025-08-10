const assert = require('node:assert');
const { test, mock } = require('node:test');
const path = require('node:path');

// capture emitted socket events
const events = [];

// stub socket.io before requiring modules
const ioPath = path.resolve(__dirname, '../src/io.js');
require.cache[ioPath] = {
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

mock.timers.enable({ apis: ['setTimeout'] });

test('run emits live-draw-end and refreshes metadata', async () => {
  events.length = 0;

  const schedule = { city: 'jakarta', drawTime: '10:00' };
  const dbPath = path.resolve(__dirname, '../src/config/database.js');
  require.cache[dbPath] = {
    exports: {
      schedule: {
        findMany: async () => [schedule],
        findUnique: async () => schedule,
      },
      lotteryResult: {
        findUnique: async () => null,
        create: async () => ({}),
      },
      fetchError: {
        create: async () => {},
      },
    },
  };

  const datePath = path.resolve(__dirname, '../src/utils/jakartaDate.js');
  require.cache[datePath] = {
    exports: {
      jakartaDate: () => new Date('2023-01-01T03:01:00Z'),
    },
  };

  const statePath = path.resolve(__dirname, '../src/liveDrawState.js');
  const { activeLiveDraws } = require(statePath);
  activeLiveDraws.set('jakarta', {});

  const controllerPath = path.resolve(
    __dirname,
    '../src/controllers/lottery.controller.js'
  );
  const fetchPath = path.resolve(__dirname, '../src/cron/fetchResults.js');
  delete require.cache[controllerPath];
  delete require.cache[fetchPath];
  const { run } = require(fetchPath);

  await run();

  mock.timers.tick(0);
  await Promise.resolve();
  mock.timers.tick(10 * 60 * 1000);
  await Promise.resolve();

  assert(events.some((e) => e.event === 'live-draw-end'));
  assert(events.filter((e) => e.event === 'liveMeta').length >= 2);
});
